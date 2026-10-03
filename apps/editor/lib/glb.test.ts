import { expect, test } from 'bun:test'
import { isGlb, makePaintable, modelBounds, parseGlb, writeGlb } from './glb'
import { makeBoxesGlb, makeTableGlb } from './test-helpers/glb-fixture'

test('round-trips a .glb, keeping the binary chunk byte for byte', () => {
  const glb = makeTableGlb()
  const { json, bin } = parseGlb(glb)
  expect(json.materials?.map((m) => m.name)).toEqual(['Wood', 'Metal.001'])
  const again = parseGlb(writeGlb(json, bin))
  expect(again.json).toEqual(json)
  expect(again.bin).toEqual(bin)
})

test('rejects files that are not glTF 2.0 binaries', () => {
  expect(isGlb(new TextEncoder().encode('{"asset":{}}'))).toBe(false)
  expect(() => parseGlb(new Uint8Array(16))).toThrow('Not a .glb file')
  const truncated = makeTableGlb().slice(0, 40)
  expect(() => parseGlb(truncated)).toThrow()
})

test('makes every material a uniquely named paintable slot', () => {
  const { json } = parseGlb(
    makeBoxesGlb([
      { min: [0, 0, 0], max: [1, 1, 1], material: 'Wood' },
      { min: [0, 0, 0], max: [1, 1, 1], material: 'wood.001' },
      { min: [0, 0, 0], max: [1, 1, 1], material: 'slot_Seat' },
      { min: [0, 0, 0], max: [1, 1, 1], material: '' },
    ]),
  )
  const { json: paintable, slots } = makePaintable(json)
  expect(paintable.materials?.map((m) => m.name)).toEqual([
    'slot_wood',
    'slot_wood_2',
    'slot_seat',
    'slot_part_4',
  ])
  expect(slots.map((s) => s.label)).toEqual(['Wood', 'Wood 2', 'Seat', 'Part 4'])
  // Other material properties are kept.
  expect(paintable.materials?.[0]).toMatchObject({ pbrMetallicRoughness: expect.any(Object) })
})

test('measures the model through its node transforms', () => {
  const box = modelBounds(parseGlb(makeTableGlb()).json)
  expect(box.min.toArray()).toEqual([-60, 0, -30])
  expect(box.max.toArray()).toEqual([60, 75, 30])

  const moved = parseGlb(
    makeBoxesGlb([{ min: [0, 0, 0], max: [1, 2, 3], material: 'a' }], {
      translation: [10, 0, 0],
      scale: [2, 2, 2],
    }),
  ).json
  const b = modelBounds(moved)
  expect(b.min.toArray()).toEqual([10, 0, 0])
  expect(b.max.toArray()).toEqual([12, 4, 6])
})

test('a model without geometry is reported', () => {
  expect(() =>
    modelBounds({ asset: { version: '2.0' }, nodes: [{}], scenes: [{ nodes: [0] }] }),
  ).toThrow('no geometry')
})
