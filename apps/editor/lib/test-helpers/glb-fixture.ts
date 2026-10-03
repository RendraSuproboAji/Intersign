import { type GltfJson, writeGlb } from '../glb'

type Box = { min: [number, number, number]; max: [number, number, number]; material: string }

/**
 * A valid .glb of axis-aligned boxes, one mesh primitive and material each,
 * under a root node with an optional translation/scale. Used to test uploads
 * without third-party model files.
 */
export function makeBoxesGlb(
  boxes: Box[],
  root: { translation?: [number, number, number]; scale?: [number, number, number] } = {},
): Uint8Array {
  const chunks: Uint8Array[] = []
  let byteOffset = 0
  const bufferViews: object[] = []
  const accessors: object[] = []
  const primitives: object[] = []
  const indices = new Uint16Array([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6, 1, 2, 6, 1, 6, 5, 0, 4,
    7, 0, 7, 3,
  ])

  const add = (bytes: Uint8Array, target: number) => {
    bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.byteLength, target })
    chunks.push(bytes)
    byteOffset += bytes.byteLength
    const padding = (4 - (byteOffset % 4)) % 4
    if (padding) {
      chunks.push(new Uint8Array(padding))
      byteOffset += padding
    }
    return bufferViews.length - 1
  }

  boxes.forEach((box, index) => {
    // Corner i takes max on x for bit 0, y for bit 1, z for bit 2 (x-fastest box order below).
    const corners = [0, 1, 3, 2, 4, 5, 7, 6].flatMap((i) =>
      [0, 1, 2].map((axis) => ((i >> axis) & 1 ? box.max[axis]! : box.min[axis]!)),
    )
    const positions = new Float32Array(corners)
    const positionView = add(new Uint8Array(positions.buffer), 34962)
    accessors.push({
      bufferView: positionView,
      componentType: 5126,
      count: 8,
      type: 'VEC3',
      min: box.min,
      max: box.max,
    })
    const indexView = add(new Uint8Array(indices.buffer.slice(0)), 34963)
    accessors.push({ bufferView: indexView, componentType: 5123, count: 36, type: 'SCALAR' })
    primitives.push({
      attributes: { POSITION: index * 2 },
      indices: index * 2 + 1,
      material: index,
    })
  })

  const bin = new Uint8Array(byteOffset)
  let at = 0
  for (const chunk of chunks) {
    bin.set(chunk, at)
    at += chunk.byteLength
  }

  const json: GltfJson = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ children: [1], ...root }, { mesh: 0 }],
    meshes: [{ primitives }],
    materials: boxes.map((box, i) => ({
      name: box.material,
      pbrMetallicRoughness: { baseColorFactor: [0.4 + 0.3 * i, 0.3, 0.2, 1] },
    })),
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.byteLength }],
  }
  return writeGlb(json, bin)
}

/** A table, modelled in centimetres: 120 × 75 × 60 cm, wooden top and metal legs. */
export function makeTableGlb(): Uint8Array {
  return makeBoxesGlb([
    { min: [-60, 70, -30], max: [60, 75, 30], material: 'Wood' },
    { min: [-55, 0, -25], max: [55, 70, 25], material: 'Metal.001' },
  ])
}
