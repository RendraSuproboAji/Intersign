import { deriveSlotId, slotLabelFromId } from '@pascal-app/core'
import { Box3, Matrix4, Quaternion, Vector3 } from 'three'

/**
 * Just enough of binary glTF 2.0 (.glb) to prepare an uploaded furniture model:
 * rename its materials so every part is paintable, and measure it. Only the
 * JSON chunk is rewritten; the binary chunk (geometry, textures, Draco or
 * meshopt data) is passed through untouched, so nothing is lost or re-encoded.
 */

const GLB_MAGIC = 0x46546c67 // 'glTF'
const CHUNK_JSON = 0x4e4f534a
const CHUNK_BIN = 0x004e4942

type GltfNode = {
  children?: number[]
  mesh?: number
  matrix?: number[]
  translation?: number[]
  rotation?: number[]
  scale?: number[]
}

type GltfAccessor = {
  min?: number[]
  max?: number[]
  normalized?: boolean
  componentType?: number
}

export type GltfJson = {
  asset?: { version?: string }
  scene?: number
  scenes?: { nodes?: number[] }[]
  nodes?: GltfNode[]
  meshes?: { primitives?: { attributes?: Record<string, number> }[] }[]
  accessors?: GltfAccessor[]
  materials?: { name?: string }[]
  [key: string]: unknown
}

export type PaintableSlot = { id: string; label: string }

export function isGlb(bytes: Uint8Array): boolean {
  return bytes.byteLength >= 12 && view(bytes).getUint32(0, true) === GLB_MAGIC
}

export function parseGlb(bytes: Uint8Array): { json: GltfJson; bin: Uint8Array | null } {
  if (!isGlb(bytes)) throw new Error('Not a .glb file')
  const data = view(bytes)
  if (data.getUint32(4, true) !== 2) throw new Error('Only glTF 2.0 .glb files are supported')
  const length = Math.min(data.getUint32(8, true), bytes.byteLength)
  let json: GltfJson | null = null
  let bin: Uint8Array | null = null
  for (let offset = 12; offset + 8 <= length; ) {
    const chunkLength = data.getUint32(offset, true)
    const chunkType = data.getUint32(offset + 4, true)
    const start = offset + 8
    if (start + chunkLength > length) throw new Error('The .glb file is truncated')
    const chunk = bytes.subarray(start, start + chunkLength)
    if (chunkType === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(chunk)) as GltfJson
    else if (chunkType === CHUNK_BIN && !bin) bin = chunk
    offset = start + chunkLength
  }
  if (!json) throw new Error('The .glb file has no glTF JSON')
  return { json, bin }
}

export function writeGlb(json: GltfJson, bin: Uint8Array | null): Uint8Array<ArrayBuffer> {
  const jsonBytes = pad(new TextEncoder().encode(JSON.stringify(json)), 0x20)
  const binBytes = bin ? pad(bin, 0) : null
  const total = 12 + 8 + jsonBytes.byteLength + (binBytes ? 8 + binBytes.byteLength : 0)
  const out = new Uint8Array(total)
  const data = view(out)
  data.setUint32(0, GLB_MAGIC, true)
  data.setUint32(4, 2, true)
  data.setUint32(8, total, true)
  data.setUint32(12, jsonBytes.byteLength, true)
  data.setUint32(16, CHUNK_JSON, true)
  out.set(jsonBytes, 20)
  if (binBytes) {
    const at = 20 + jsonBytes.byteLength
    data.setUint32(at, binBytes.byteLength, true)
    data.setUint32(at + 4, CHUNK_BIN, true)
    out.set(binBytes, at + 8)
  }
  return out
}

/**
 * Names every material `slot_<id>` (the engine's marker for a paintable part),
 * keeping existing `slot_` names and making the ids unique.
 */
export function makePaintable(json: GltfJson): { json: GltfJson; slots: PaintableSlot[] } {
  const used = new Set<string>()
  const slots: PaintableSlot[] = []
  const materials = (json.materials ?? []).map((material, index) => {
    const base =
      deriveSlotId(material.name ?? '') ?? slugify(material.name ?? '') ?? `part_${index + 1}`
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}_${n}`
    used.add(id)
    slots.push({ id, label: slotLabelFromId(id) })
    return { ...material, name: `slot_${id}` }
  })
  return { json: json.materials ? { ...json, materials } : json, slots }
}

/** Bounds of the default scene in model units, from the POSITION accessors' min/max. */
export function modelBounds(json: GltfJson): Box3 {
  const box = new Box3()
  const sceneIndex = json.scene ?? 0
  const roots = json.scenes?.[sceneIndex]?.nodes ?? json.nodes?.map((_, i) => i) ?? []
  const visit = (index: number, parent: Matrix4, depth: number) => {
    const node = json.nodes?.[index]
    if (!node || depth > 64) return
    const world = parent.clone().multiply(localMatrix(node))
    if (node.mesh !== undefined) {
      for (const primitive of json.meshes?.[node.mesh]?.primitives ?? []) {
        const accessor = json.accessors?.[primitive.attributes?.POSITION ?? -1]
        const range = accessorRange(accessor)
        if (range) box.union(range.applyMatrix4(world))
      }
    }
    for (const child of node.children ?? []) visit(child, world, depth + 1)
  }
  for (const root of roots) visit(root, new Matrix4(), 0)
  if (box.isEmpty()) throw new Error('The model has no geometry')
  return box
}

function localMatrix(node: GltfNode): Matrix4 {
  if (node.matrix?.length === 16) return new Matrix4().fromArray(node.matrix)
  const t = node.translation ?? [0, 0, 0]
  const r = node.rotation ?? [0, 0, 0, 1]
  const s = node.scale ?? [1, 1, 1]
  return new Matrix4().compose(
    new Vector3(t[0], t[1], t[2]),
    new Quaternion(r[0], r[1], r[2], r[3]),
    new Vector3(s[0], s[1], s[2]),
  )
}

// Normalized integer positions (KHR_mesh_quantization) store min/max as raw integers.
const NORMALIZED_DIVISOR: Record<number, number> = {
  5120: 127,
  5121: 255,
  5122: 32767,
  5123: 65535,
}

function accessorRange(accessor: GltfAccessor | undefined): Box3 | null {
  if (!(accessor?.min?.length === 3 && accessor.max?.length === 3)) return null
  const divisor = accessor.normalized ? (NORMALIZED_DIVISOR[accessor.componentType ?? 0] ?? 1) : 1
  const [min, max] = [accessor.min, accessor.max].map(
    (v) => new Vector3(v[0]! / divisor, v[1]! / divisor, v[2]! / divisor),
  )
  return new Box3(min, max)
}

function slugify(name: string): string | null {
  const slug = name
    .toLowerCase()
    .replace(/\.\d+$/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || null
}

function pad(bytes: Uint8Array, fill: number): Uint8Array {
  const padding = (4 - (bytes.byteLength % 4)) % 4
  if (!padding) return bytes
  const out = new Uint8Array(bytes.byteLength + padding).fill(fill)
  out.set(bytes)
  return out
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}
