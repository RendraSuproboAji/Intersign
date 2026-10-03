import type { NextRequest } from 'next/server'
import { ITEM_FILES, type ItemFile, readItemFile } from '@/lib/item-store-server'
import {
  guardSceneApiRequest,
  sceneApiJson,
  sceneApiPreflight,
  withSceneApiHeaders,
} from '@/lib/scene-api-security'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string; file: string }> }

export function OPTIONS(request: NextRequest) {
  return sceneApiPreflight(request)
}

/**
 * The model and thumbnail of an uploaded item. Not rate limited: a scene or
 * the Items tab loads many of these at once. Files never change under an id.
 */
export async function GET(request: NextRequest, context: Context) {
  const guard = guardSceneApiRequest(request, { skipRateLimit: true })
  if (guard) return guard
  const { id, file } = await context.params
  const bytes = await readItemFile(id, file)
  if (!bytes) return sceneApiJson(request, { error: 'not_found' }, { status: 404 })
  return withSceneApiHeaders(
    request,
    new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': ITEM_FILES[file as ItemFile],
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }),
  )
}
