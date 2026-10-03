import { randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  type CustomItemMetadata,
  type CustomItemRecord,
  customItemMetadataSchema,
  customItemPatchSchema,
} from './custom-items'
import { isGlb } from './glb'

/**
 * The items folder is runtime data, not part of the build: every filesystem
 * call below carries `turbopackIgnore` so Next doesn't trace the whole project
 * into the server output.
 *
 * Uploaded furniture on disk, next to the scene database:
 *   <items dir>/<id>/model.glb, thumbnail.png, item.json
 * Removing an item only hides it from the catalog: scenes that already use it
 * keep loading its files. Every function takes an optional directory (tests).
 */

export const ITEM_ID = /^[a-f0-9]{16}$/
export const ITEM_FILES = {
  'model.glb': 'model/gltf-binary',
  'thumbnail.png': 'image/png',
} as const
export type ItemFile = keyof typeof ITEM_FILES

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47]
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024

export class ItemStoreError extends Error {
  constructor(
    readonly code: 'invalid_model' | 'invalid_thumbnail' | 'too_large' | 'invalid_metadata',
    message: string,
  ) {
    super(message)
  }
}

export async function itemsDirectory(env: NodeJS.ProcessEnv = process.env): Promise<string> {
  if (env.INTERSIGN_ITEMS_DIR) return env.INTERSIGN_ITEMS_DIR
  // Imported lazily, like the scene store (see scene-store-server.ts).
  const { resolveDefaultDatabasePath } = (await import('@pascal-app/mcp/storage')) as {
    resolveDefaultDatabasePath: (env?: NodeJS.ProcessEnv) => string
  }
  return join(dirname(resolveDefaultDatabasePath(env)), 'items')
}

export function maxModelBytes(env: NodeJS.ProcessEnv = process.env): number {
  const mb = Number.parseFloat(env.INTERSIGN_ITEM_MAX_MB ?? '')
  return (Number.isFinite(mb) && mb > 0 ? mb : 50) * 1024 * 1024
}

export async function listItems(dir?: string): Promise<CustomItemRecord[]> {
  const root = dir ?? (await itemsDirectory())
  let ids: string[]
  try {
    ids = await readdir(/*turbopackIgnore: true*/ root)
  } catch {
    return []
  }
  const records = await Promise.all(
    ids.filter((id) => ITEM_ID.test(id)).map((id) => getItem(id, root)),
  )
  return records
    .filter((r): r is CustomItemRecord => r !== null && !r.deleted)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getItem(id: string, dir?: string): Promise<CustomItemRecord | null> {
  if (!ITEM_ID.test(id)) return null
  const root = dir ?? (await itemsDirectory())
  try {
    return JSON.parse(
      await readFile(/*turbopackIgnore: true*/ join(root, id, 'item.json'), 'utf8'),
    ) as CustomItemRecord
  } catch {
    return null
  }
}

export async function readItemFile(id: string, file: string, dir?: string) {
  if (!(ITEM_ID.test(id) && file in ITEM_FILES)) return null
  const root = dir ?? (await itemsDirectory())
  try {
    return await readFile(/*turbopackIgnore: true*/ join(root, id, file))
  } catch {
    return null
  }
}

export async function createItem(
  input: { model: Uint8Array; thumbnail: Uint8Array; metadata: unknown },
  dir?: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<CustomItemRecord> {
  const parsed = customItemMetadataSchema.safeParse(input.metadata)
  if (!parsed.success) throw new ItemStoreError('invalid_metadata', parsed.error.message)
  const limit = maxModelBytes(env)
  if (input.model.byteLength > limit) {
    throw new ItemStoreError('too_large', `Models can be up to ${limit / 1024 / 1024} MB`)
  }
  if (!isGlb(input.model)) throw new ItemStoreError('invalid_model', 'Upload a .glb model')
  if (
    input.thumbnail.byteLength > MAX_THUMBNAIL_BYTES ||
    !PNG_MAGIC.every((byte, i) => input.thumbnail[i] === byte)
  ) {
    throw new ItemStoreError('invalid_thumbnail', 'The thumbnail must be a PNG under 2 MB')
  }

  const root = dir ?? (await itemsDirectory(env))
  const id = randomBytes(8).toString('hex')
  const record: CustomItemRecord = { ...parsed.data, id, createdAt: new Date().toISOString() }
  const folder = join(root, id)
  await mkdir(/*turbopackIgnore: true*/ folder, { recursive: true })
  await atomicWrite(join(folder, 'model.glb'), input.model)
  await atomicWrite(join(folder, 'thumbnail.png'), input.thumbnail)
  // Written last: an item without item.json is never listed.
  await atomicWrite(join(folder, 'item.json'), JSON.stringify(record, null, 2))
  return record
}

export async function updateItem(
  id: string,
  patch: unknown,
  dir?: string,
): Promise<CustomItemRecord | null> {
  const parsed = customItemPatchSchema.safeParse(patch)
  if (!parsed.success) throw new ItemStoreError('invalid_metadata', parsed.error.message)
  const root = dir ?? (await itemsDirectory())
  const current = await getItem(id, root)
  if (!current || current.deleted) return null
  const next: CustomItemRecord = { ...current, ...(parsed.data as Partial<CustomItemMetadata>) }
  await atomicWrite(join(root, id, 'item.json'), JSON.stringify(next, null, 2))
  return next
}

export async function removeItem(id: string, dir?: string): Promise<boolean> {
  const root = dir ?? (await itemsDirectory())
  const current = await getItem(id, root)
  if (!current || current.deleted) return false
  const hidden = JSON.stringify({ ...current, deleted: true }, null, 2)
  await atomicWrite(join(root, id, 'item.json'), hidden)
  return true
}

async function atomicWrite(path: string, data: Uint8Array | string) {
  const temp = `${path}.${randomBytes(4).toString('hex')}.tmp`
  await writeFile(/*turbopackIgnore: true*/ temp, data)
  await rename(/*turbopackIgnore: true*/ temp, path)
}
