import type { AssetInput } from '@pascal-app/core'
import { z } from 'zod'

/** Furniture uploaded by the user, stored by the Intersign server under /api/items. */

export const ITEM_CATEGORIES = ['furniture', 'appliance', 'kitchen', 'bathroom', 'outdoor'] as const
export const ITEM_PLACEMENTS = ['floor', 'wall', 'ceiling'] as const
export const MODEL_UNITS = { m: 1, cm: 0.01, mm: 0.001, in: 0.0254 } as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]
export type ItemPlacement = (typeof ITEM_PLACEMENTS)[number]
export type ModelUnit = keyof typeof MODEL_UNITS
export type Vec3 = [number, number, number]

const vec3 = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()])

export const customItemMetadataSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.enum(ITEM_CATEGORIES),
  placement: z.enum(ITEM_PLACEMENTS),
  // [width, height, depth] in metres, as placed (before the node's own scale).
  dimensions: z.tuple([
    z.number().positive().max(100),
    z.number().positive().max(100),
    z.number().positive().max(100),
  ]),
  offset: vec3,
  scale: vec3,
})

export const customItemPatchSchema = customItemMetadataSchema
  .pick({ name: true, category: true, placement: true })
  .partial()

export type CustomItemMetadata = z.infer<typeof customItemMetadataSchema>
export type CustomItemPatch = z.infer<typeof customItemPatchSchema>

export type CustomItemRecord = CustomItemMetadata & {
  id: string
  createdAt: string
  deleted?: boolean
}

/** Model units from its largest side: furniture over 20 units across is almost never metres. */
export function guessUnit(size: Vec3): ModelUnit {
  const largest = Math.max(...size)
  if (largest > 2000) return 'mm'
  if (largest > 20) return 'cm'
  return 'm'
}

/**
 * Corrective transforms that make the model sit like the built-in catalog
 * items: bottom at y = 0, centred on x, and centred on z — except wall
 * pieces, whose back rests against the wall at z = 0.
 */
export function fitAsset(
  bounds: { min: Vec3; max: Vec3 },
  unit: ModelUnit,
  placement: ItemPlacement,
): Pick<CustomItemMetadata, 'dimensions' | 'offset' | 'scale'> {
  const u = MODEL_UNITS[unit]
  const [minX, minY, minZ] = bounds.min
  const [maxX, maxY, maxZ] = bounds.max
  const round = (v: number) => Math.round(v * 1e6) / 1e6 + 0
  return {
    dimensions: [round((maxX - minX) * u), round((maxY - minY) * u), round((maxZ - minZ) * u)],
    offset: [
      round((-(minX + maxX) / 2) * u),
      round(-minY * u),
      round((placement === 'wall' ? -minZ : -(minZ + maxZ) / 2) * u),
    ],
    scale: [u, u, u],
  }
}

export function itemFileUrl(origin: string, id: string, file: 'model.glb' | 'thumbnail.png') {
  return `${origin}/api/items/${id}/${file}`
}

/** The record as an Items-tab tile (and as the asset a placed item copies). */
export function toCatalogItem(record: CustomItemRecord, origin: string): AssetInput {
  return {
    id: `custom-${record.id}`,
    category: record.category,
    name: record.name,
    source: 'mine',
    tags: [record.placement, 'uploaded'],
    thumbnail: itemFileUrl(origin, record.id, 'thumbnail.png'),
    src: itemFileUrl(origin, record.id, 'model.glb'),
    dimensions: record.dimensions,
    offset: record.offset,
    rotation: [0, 0, 0],
    scale: record.scale,
    ...(record.placement === 'wall' ? { attachTo: 'wall-side' as const } : {}),
    ...(record.placement === 'ceiling' ? { attachTo: 'ceiling' as const } : {}),
  }
}

const ITEM_URL = /^https?:\/\/[^/]+(\/api\/items\/[A-Za-z0-9_-]+\/(?:model\.glb|thumbnail\.png))$/

/**
 * Placed uploads store absolute URLs (the engine sends relative paths to its
 * CDN). Point them at the current origin, so a scene still finds its uploads
 * after the server moves, e.g. from localhost to a deployed address.
 */
export function rehostItemUrls<G extends { nodes: Record<string, unknown> }>(
  graph: G,
  origin: string,
): G {
  let changed = false
  const nodes: Record<string, unknown> = {}
  for (const [id, node] of Object.entries(graph.nodes)) {
    const asset = (node as { type?: string; asset?: { src?: string; thumbnail?: string } }).asset
    if ((node as { type?: string }).type !== 'item' || !asset) {
      nodes[id] = node
      continue
    }
    const src = rehost(asset.src, origin)
    const thumbnail = rehost(asset.thumbnail, origin)
    if (src === asset.src && thumbnail === asset.thumbnail) {
      nodes[id] = node
      continue
    }
    changed = true
    nodes[id] = { ...(node as object), asset: { ...asset, src, thumbnail } }
  }
  return changed ? { ...graph, nodes } : graph
}

function rehost(url: string | undefined, origin: string): string | undefined {
  const path = url?.match(ITEM_URL)?.[1]
  return path ? `${origin}${path}` : url
}
