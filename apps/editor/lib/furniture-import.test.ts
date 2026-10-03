import { expect, test } from 'bun:test'
import { importModel, itemMetadata, nameFromFile } from './furniture-import'
import { parseGlb } from './glb'
import { makeTableGlb } from './test-helpers/glb-fixture'

test('imports a centimetre table: paintable parts, size and placement', () => {
  const imported = importModel(makeTableGlb())
  expect(imported.suggestedUnit).toBe('cm')
  expect(imported.parts).toEqual([
    { id: 'wood', label: 'Wood' },
    { id: 'metal', label: 'Metal' },
  ])
  expect(parseGlb(imported.model).json.materials?.map((m) => m.name)).toEqual([
    'slot_wood',
    'slot_metal',
  ])

  const metadata = itemMetadata(imported, {
    name: '  Oak table ',
    category: 'furniture',
    placement: 'floor',
    unit: imported.suggestedUnit,
  })
  expect(metadata).toEqual({
    name: 'Oak table',
    category: 'furniture',
    placement: 'floor',
    dimensions: [1.2, 0.75, 0.6],
    offset: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
  })
})

test('names an item after its file', () => {
  expect(nameFromFile('modern_oak-table.v2.glb')).toBe('Modern oak table v2')
  expect(nameFromFile('.glb')).toBe('Model')
})
