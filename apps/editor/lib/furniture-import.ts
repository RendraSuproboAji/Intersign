import {
  type CustomItemMetadata,
  fitAsset,
  guessUnit,
  type ItemCategory,
  type ItemPlacement,
  type ModelUnit,
  type Vec3,
} from './custom-items'
import { makePaintable, modelBounds, type PaintableSlot, parseGlb, writeGlb } from './glb'

/** An uploaded .glb, read once: its paintable copy and its raw size. */
export type ImportedModel = {
  model: Uint8Array<ArrayBuffer>
  bounds: { min: Vec3; max: Vec3 }
  parts: PaintableSlot[]
  suggestedUnit: ModelUnit
}

export function importModel(bytes: Uint8Array): ImportedModel {
  const { json, bin } = parseGlb(bytes)
  const box = modelBounds(json)
  const { json: paintable, slots } = makePaintable(json)
  const size = box.getSize(box.min.clone()).toArray() as Vec3
  return {
    model: writeGlb(paintable, bin),
    bounds: { min: box.min.toArray() as Vec3, max: box.max.toArray() as Vec3 },
    parts: slots,
    suggestedUnit: guessUnit(size),
  }
}

export function itemMetadata(
  imported: ImportedModel,
  choices: { name: string; category: ItemCategory; placement: ItemPlacement; unit: ModelUnit },
): CustomItemMetadata {
  return {
    name: choices.name.trim(),
    category: choices.category,
    placement: choices.placement,
    ...fitAsset(imported.bounds, choices.unit, choices.placement),
  }
}

/** "modern_oak-table.v2.glb" → "Modern oak table v2". */
export function nameFromFile(fileName: string): string {
  const base = fileName
    .replace(/\.glb$/i, '')
    .replace(/[_.-]+/g, ' ')
    .trim()
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Model'
}
