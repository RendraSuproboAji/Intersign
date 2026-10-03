import type { NextRequest } from 'next/server'
import { createItem, ItemStoreError, listItems } from '@/lib/item-store-server'
import { guardSceneApiRequest, sceneApiJson, sceneApiPreflight } from '@/lib/scene-api-security'

export const dynamic = 'force-dynamic'

export function OPTIONS(request: NextRequest) {
  return sceneApiPreflight(request)
}

export async function GET(request: NextRequest) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard
  return sceneApiJson(request, { items: await listItems() })
}

/** multipart/form-data: `model` (.glb), `thumbnail` (PNG) and `metadata` (JSON). */
export async function POST(request: NextRequest) {
  const guard = guardSceneApiRequest(request)
  if (guard) return guard

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return invalid(request, 'Send the model as multipart/form-data')
  }
  const model = form.get('model')
  const thumbnail = form.get('thumbnail')
  const metadata = form.get('metadata')
  if (!(model instanceof Blob && thumbnail instanceof Blob && typeof metadata === 'string')) {
    return invalid(request, 'Expected the fields model, thumbnail and metadata')
  }

  let parsedMetadata: unknown
  try {
    parsedMetadata = JSON.parse(metadata)
  } catch {
    return invalid(request, 'metadata must be JSON')
  }

  try {
    const item = await createItem({
      model: new Uint8Array(await model.arrayBuffer()),
      thumbnail: new Uint8Array(await thumbnail.arrayBuffer()),
      metadata: parsedMetadata,
    })
    return sceneApiJson(request, { item }, { status: 201 })
  } catch (error) {
    if (error instanceof ItemStoreError) {
      return sceneApiJson(
        request,
        { error: error.code, details: error.message },
        { status: error.code === 'too_large' ? 413 : 400 },
      )
    }
    throw error
  }
}

function invalid(request: NextRequest, details: string) {
  return sceneApiJson(request, { error: 'invalid_request', details }, { status: 400 })
}
