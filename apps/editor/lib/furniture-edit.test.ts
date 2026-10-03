import { expect, test } from 'bun:test'
import type { ItemNode, SceneMaterial } from '@pascal-app/core'
import {
  colourChange,
  itemSize,
  normalizeDegrees,
  partColour,
  resizedScale,
  rotatedTo,
  rotationDegrees,
} from './furniture-edit'

function item(overrides: Partial<ItemNode['asset']> = {}, node: Partial<ItemNode> = {}) {
  return {
    asset: { dimensions: [1.2, 0.75, 0.6], ...overrides } as ItemNode['asset'],
    scale: [1, 1, 1] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    slots: undefined,
    ...node,
  }
}

test('resizes one side, or all of them in proportion', () => {
  const table = item()
  expect(itemSize(table)).toEqual([1.2, 0.75, 0.6])
  expect(resizedScale(table, 0, 1.8, false)).toEqual([1.5, 1, 1])
  const proportional = resizedScale(table, 0, 1.8, true)
  expect(itemSize({ ...table, scale: proportional }).map((v) => +v.toFixed(6))).toEqual([
    1.8, 1.125, 0.9,
  ])
  // Sizes stay between 1 cm and 100 m.
  expect(itemSize({ ...table, scale: resizedScale(table, 1, 0, false) })[1]).toBeCloseTo(0.01)
})

test('rotates floor pieces about y and wall pieces about the wall normal', () => {
  const chair = item()
  expect(rotatedTo(chair, 90)[1]).toBeCloseTo(Math.PI / 2)
  expect(rotationDegrees({ ...chair, rotation: rotatedTo(chair, 270) })).toBe(-90)

  const shelf = item({ attachTo: 'wall-side' })
  const turned = rotatedTo(shelf, 15)
  expect(turned[1]).toBe(0)
  expect(turned[2]).toBeCloseTo((15 * Math.PI) / 180)
})

test('normalizes angles to (-180, 180]', () => {
  expect(normalizeDegrees(180)).toBe(180)
  expect(normalizeDegrees(-180)).toBe(180)
  expect(normalizeDegrees(450)).toBe(90)
  expect(normalizeDegrees(-45.04)).toBe(-45)
})

test('colours a part with a new scene material, then reuses it', () => {
  const chair = item()
  const first = colourChange({}, chair, 'seat', '#AA3300')
  expect(first.material?.material.properties?.color).toBe('#aa3300')
  expect(first.slots).toEqual({ seat: `scene:${first.material!.id}` })

  const materials: Record<string, SceneMaterial> = { [first.material!.id]: first.material! }
  const coloured = { ...chair, slots: first.slots }
  expect(partColour(materials, coloured, 'seat')).toBe('#aa3300')
  expect(partColour(materials, coloured, 'legs')).toBeNull()

  const second = colourChange(materials, coloured, 'legs', '#aa3300')
  expect(second.material).toBeNull()
  expect(second.slots.legs).toBe(first.slots.seat)

  const reset = colourChange(materials, { ...chair, slots: second.slots }, 'seat', null)
  expect(reset.slots).toEqual({ legs: first.slots.seat })
})
