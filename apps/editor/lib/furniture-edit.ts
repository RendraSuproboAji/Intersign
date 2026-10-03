import {
  generateSceneMaterialId,
  getSceneMaterialIdFromRef,
  type ItemNode,
  type SceneMaterial,
  toSceneMaterialRef,
} from '@pascal-app/core'

/**
 * Size, rotation and per-part colour of a placed item, as node patches.
 * The asset's dimensions are [width, height, depth] in metres and the node's
 * `scale` multiplies them; colours live in scene materials referenced from
 * the node's `slots`, exactly as the engine's paint tool stores them.
 */

type Vec3 = [number, number, number]
type Item = Pick<ItemNode, 'asset' | 'scale' | 'rotation' | 'slots'>

const MIN_SIZE = 0.01
const MAX_SIZE = 100

export function itemSize(node: Item): Vec3 {
  const [w, h, d] = node.asset.dimensions
  return [w * node.scale[0], h * node.scale[1], d * node.scale[2]]
}

/** The node scale that gives one side (0 width, 1 height, 2 depth) a length in metres. */
export function resizedScale(
  node: Item,
  axis: 0 | 1 | 2,
  metres: number,
  keepProportions: boolean,
): Vec3 {
  const target = Math.min(MAX_SIZE, Math.max(MIN_SIZE, metres))
  if (keepProportions) {
    const factor = target / itemSize(node)[axis]
    return node.scale.map((s) => s * factor) as Vec3
  }
  const next = [...node.scale] as Vec3
  next[axis] = target / node.asset.dimensions[axis]
  return next
}

/** Wall pieces turn about the wall normal (their local z), everything else about y. */
export function rotationAxis(node: Item): 1 | 2 {
  return node.asset.attachTo === 'wall' || node.asset.attachTo === 'wall-side' ? 2 : 1
}

/** The turn in degrees, in (-180, 180]. */
export function rotationDegrees(node: Item): number {
  return normalizeDegrees((node.rotation[rotationAxis(node)] * 180) / Math.PI)
}

export function rotatedTo(node: Item, degrees: number): Vec3 {
  const next = [...node.rotation] as Vec3
  next[rotationAxis(node)] = (normalizeDegrees(degrees) * Math.PI) / 180
  return next
}

export function normalizeDegrees(degrees: number): number {
  const d = (((degrees % 360) + 540) % 360) - 180
  return Math.round((d === -180 ? 180 : d) * 10) / 10
}

/** The colour a part was given here, or null when it shows the model's own material. */
export function partColour(
  materials: Record<string, SceneMaterial>,
  node: Item,
  part: string,
): string | null {
  const ref = node.slots?.[part]
  const id = ref ? getSceneMaterialIdFromRef(ref) : null
  const material = id ? materials[id]?.material : undefined
  return material?.preset === 'custom' ? (material.properties?.color ?? null) : null
}

/**
 * The slots for a new part colour (null restores the model's own material),
 * plus the scene material to add when no existing one has that colour.
 */
export function colourChange(
  materials: Record<string, SceneMaterial>,
  node: Item,
  part: string,
  colour: string | null,
): { slots: Record<string, string>; material: SceneMaterial | null } {
  const slots = { ...(node.slots ?? {}) }
  if (colour === null) {
    delete slots[part]
    return { slots, material: null }
  }
  const hex = colour.toLowerCase()
  const existing = Object.values(materials).find(
    (m) => m.material.preset === 'custom' && m.material.properties?.color?.toLowerCase() === hex,
  )
  const material: SceneMaterial | null = existing
    ? null
    : {
        id: generateSceneMaterialId(),
        name: `Colour ${hex}`,
        material: {
          preset: 'custom',
          properties: {
            color: hex,
            roughness: 0.6,
            metalness: 0,
            opacity: 1,
            transparent: false,
            side: 'front',
          },
        },
      }
  slots[part] = toSceneMaterialRef((existing ?? material)!.id)
  return { slots, material }
}
