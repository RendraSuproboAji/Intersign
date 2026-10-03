import { afterAll, beforeAll, expect, test } from 'bun:test'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { GET as getFile } from '../app/api/items/[id]/[file]/route'
import { DELETE, PATCH } from '../app/api/items/[id]/route'
import { GET as list, POST } from '../app/api/items/route'
import { fitAsset } from './custom-items'
import { makeTableGlb } from './test-helpers/glb-fixture'

/** The /api/items routes against a real items folder in a temp directory. */

const dir = mkdtempSync(join(tmpdir(), 'items-api-'))
const saved = {
  INTERSIGN_ITEMS_DIR: process.env.INTERSIGN_ITEMS_DIR,
  INTERSIGN_ITEM_MAX_MB: process.env.INTERSIGN_ITEM_MAX_MB,
  PASCAL_SCENE_API_TOKEN: process.env.PASCAL_SCENE_API_TOKEN,
}
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const BASE = 'http://127.0.0.1:3002'

beforeAll(() => {
  process.env.INTERSIGN_ITEMS_DIR = dir
  delete process.env.INTERSIGN_ITEM_MAX_MB
  delete process.env.PASCAL_SCENE_API_TOKEN // loopback requests need no token
})

afterAll(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(dir, { recursive: true, force: true })
})

const metadata = {
  name: 'Oak table',
  category: 'furniture',
  placement: 'floor',
  ...fitAsset({ min: [-60, 0, -30], max: [60, 75, 30] }, 'cm', 'floor'),
}

function upload(fields: { model?: Uint8Array; thumbnail?: Uint8Array; metadata?: unknown }) {
  const form = new FormData()
  if (fields.model) form.set('model', new Blob([fields.model]), 'table.glb')
  if (fields.thumbnail) form.set('thumbnail', new Blob([fields.thumbnail]), 'thumbnail.png')
  if (fields.metadata !== undefined) form.set('metadata', JSON.stringify(fields.metadata))
  return POST(
    new NextRequest(`${BASE}/api/items`, {
      method: 'POST',
      body: form,
      headers: { host: '127.0.0.1:3002' },
    }),
  )
}

const request = (path: string, init: { method?: string; body?: string } = {}) =>
  new NextRequest(`${BASE}${path}`, { ...init, headers: { host: '127.0.0.1:3002' } })
const params = <T>(value: T) => ({ params: Promise.resolve(value) })

test('uploads an item, lists it and serves its files', async () => {
  const model = makeTableGlb()
  const created = await upload({ model, thumbnail: PNG, metadata })
  expect(created.status).toBe(201)
  const { item } = (await created.json()) as { item: { id: string; name: string } }
  expect(item.id).toMatch(/^[a-f0-9]{16}$/)

  const listed = (await (await list(request('/api/items'))).json()) as { items: { id: string }[] }
  expect(listed.items.map((i) => i.id)).toContain(item.id)

  const file = await getFile(
    request(`/api/items/${item.id}/model.glb`),
    params({ id: item.id, file: 'model.glb' }),
  )
  expect(file.status).toBe(200)
  expect(file.headers.get('content-type')).toBe('model/gltf-binary')
  expect(file.headers.get('cache-control')).toContain('immutable')
  expect(new Uint8Array(await file.arrayBuffer())).toEqual(model)
})

test('rejects bad uploads without writing anything', async () => {
  const before = readdirSync(dir).length
  expect(
    (await upload({ model: new TextEncoder().encode('not a model'), thumbnail: PNG, metadata }))
      .status,
  ).toBe(400)
  expect(
    (await upload({ model: makeTableGlb(), thumbnail: new Uint8Array(12), metadata })).status,
  ).toBe(400)
  expect(
    (
      await upload({
        model: makeTableGlb(),
        thumbnail: PNG,
        metadata: { ...metadata, dimensions: [0, 1, 1] },
      })
    ).status,
  ).toBe(400)
  expect((await upload({ model: makeTableGlb(), thumbnail: PNG })).status).toBe(400)

  process.env.INTERSIGN_ITEM_MAX_MB = '0.0001'
  expect((await upload({ model: makeTableGlb(), thumbnail: PNG, metadata })).status).toBe(413)
  delete process.env.INTERSIGN_ITEM_MAX_MB

  expect(readdirSync(dir).length).toBe(before)
})

test('only known files of well-formed ids are served', async () => {
  for (const [id, file] of [
    ['..', 'item.json'],
    ['0123456789abcdef', '../../etc/passwd'],
    ['0123456789abcdef', 'item.json'],
    ['0123456789abcdef', 'model.glb'],
  ] as const) {
    const response = await getFile(request(`/api/items/${id}/${file}`), params({ id, file }))
    expect(response.status).toBe(404)
  }
})

test('renames an item, then removes it from the catalog but keeps its files', async () => {
  const created = await upload({ model: makeTableGlb(), thumbnail: PNG, metadata })
  const { item } = (await created.json()) as { item: { id: string } }

  const renamed = await PATCH(
    request(`/api/items/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Walnut table' }),
    }),
    params({ id: item.id }),
  )
  expect(((await renamed.json()) as { item: { name: string } }).item.name).toBe('Walnut table')
  const badPatch = await PATCH(
    request(`/api/items/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ category: 'spaceship' }),
    }),
    params({ id: item.id }),
  )
  expect(badPatch.status).toBe(400)

  expect(
    (await DELETE(request(`/api/items/${item.id}`, { method: 'DELETE' }), params({ id: item.id })))
      .status,
  ).toBe(200)
  const listed = (await (await list(request('/api/items'))).json()) as { items: { id: string }[] }
  expect(listed.items.map((i) => i.id)).not.toContain(item.id)
  // Scenes that already placed it still load the model.
  const file = await getFile(
    request(`/api/items/${item.id}/model.glb`),
    params({ id: item.id, file: 'model.glb' }),
  )
  expect(file.status).toBe(200)
  // A second removal, or one of an unknown id, is a 404.
  expect(
    (await DELETE(request(`/api/items/${item.id}`, { method: 'DELETE' }), params({ id: item.id })))
      .status,
  ).toBe(404)
})

test('non-loopback requests need the scene API token, like /api/scenes', async () => {
  const response = await list(
    new NextRequest('https://editor.example/api/items', { headers: { host: 'editor.example' } }),
  )
  expect(response.status).toBe(503)
})
