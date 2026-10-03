import type { NextRequest } from 'next/server'
import { ItemStoreError, removeItem, updateItem } from '@/lib/item-store-server'
import { guardSceneApiRequest, sceneApiJson, sceneApiPreflight } from '@/lib/scene-api-security'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string }> }

export function OPTIONS(request: NextRequest) {
  return sceneApiPreflight(request)
}

/** Rename, or change the category or placement of, an uploaded item. */
export async function PATCH(request: NextRequest, context: Context) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard
  const { id } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return sceneApiJson(
      request,
      { error: 'invalid_request', details: 'body must be valid JSON' },
      { status: 400 },
    )
  }

  try {
    const item = await updateItem(id, body)
    if (!item) return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
    return sceneApiJson(request, { item })
  } catch (error) {
    if (error instanceof ItemStoreError) {
      return sceneApiJson(request, { error: error.code, details: error.message }, { status: 400 })
    }
    throw error
  }
}

/** Removes the item from the catalog; scenes that use it keep loading its files. */
export async function DELETE(request: NextRequest, context: Context) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard
  const { id } = await context.params
  if (!(await removeItem(id))) return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
  return sceneApiJson(request, { ok: true })
}
