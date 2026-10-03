'use client'

import {
  type AnyNodeId,
  deriveSlotId,
  type ItemNode,
  type SceneMaterial,
  slotLabelFromId,
  useScene,
} from '@pascal-app/core'
import { resolveCdnUrl, useViewer } from '@pascal-app/viewer'
import { Link, Link2Off, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  colourChange,
  itemSize,
  partColour,
  resizedScale,
  rotatedTo,
  rotationDegrees,
} from '@/lib/furniture-edit'
import { parseGlb } from '@/lib/glb'
import { cn } from '@/lib/utils'

const SWATCHES = [
  '#f5f1e8',
  '#d9cbb0',
  '#a47551',
  '#6b4423',
  '#3b2a1e',
  '#8a9a5b',
  '#2f5d50',
  '#5b7fa3',
  '#1f2a44',
  '#b5523b',
  '#c9a227',
  '#2b2b2b',
]

/**
 * "Furniture" card for the selected item: exact size in cm, rotation, and a
 * colour per paintable part. Sits beside the engine's own item panel.
 */
export function FurniturePanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const id = selectedIds.length === 1 ? (selectedIds[0] as AnyNodeId) : null
  const node = useScene((s) => (id ? s.nodes[id] : undefined))
  if (!(id && node?.type === 'item')) return null
  return <FurnitureCard key={id} node={node as ItemNode} />
}

function FurnitureCard({ node }: { node: ItemNode }) {
  const [keepProportions, setKeepProportions] = useState(true)
  const parts = useModelParts(node.asset.src)
  const materials = useScene((s) => s.materials) as Record<string, SceneMaterial>
  const size = itemSize(node)
  const update = (patch: Partial<ItemNode>) => useScene.getState().updateNode(node.id, patch)

  return (
    <div
      className="pointer-events-auto fixed top-20 right-[332px] z-50 hidden w-64 flex-col gap-3 rounded-xl border border-border/50 bg-sidebar/95 p-3 text-sm shadow-2xl backdrop-blur-xl md:flex"
      data-testid="furniture-panel"
    >
      <h2 className="font-semibold tracking-tight">Furniture</h2>

      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-xs">Size (cm)</span>
          <button
            aria-label={keepProportions ? 'Proportions locked' : 'Proportions unlocked'}
            aria-pressed={keepProportions}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setKeepProportions(!keepProportions)}
            title="Keep proportions"
            type="button"
          >
            {keepProportions ? (
              <Link className="h-3.5 w-3.5" />
            ) : (
              <Link2Off className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ['W', 0],
              ['D', 2],
              ['H', 1],
            ] as const
          ).map(([label, axis]) => (
            <NumberField
              key={label}
              label={label}
              onCommit={(cm) =>
                update({ scale: resizedScale(node, axis, cm / 100, keepProportions) })
              }
              value={Math.round(size[axis] * 1000) / 10}
            />
          ))}
        </div>
        <button
          className="self-start text-muted-foreground text-xs hover:text-foreground"
          onClick={() => update({ scale: [1, 1, 1] })}
          type="button"
        >
          Reset size
        </button>
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="font-medium text-muted-foreground text-xs">Rotation</span>
        <div className="flex items-center gap-1.5">
          <NumberField
            label="°"
            onCommit={(degrees) => update({ rotation: rotatedTo(node, degrees) })}
            value={rotationDegrees(node)}
          />
          {[-90, -15, 15, 90].map((step) => (
            <button
              className="rounded-md bg-accent px-1.5 py-1 text-xs hover:bg-accent/70"
              key={step}
              onClick={() => update({ rotation: rotatedTo(node, rotationDegrees(node) + step) })}
              type="button"
            >
              {step > 0 ? `+${step}` : step}°
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <span className="font-medium text-muted-foreground text-xs">Colour</span>
        {parts === null && <p className="text-muted-foreground text-xs">Reading the model…</p>}
        {parts?.length === 0 && (
          <p className="text-muted-foreground text-xs">
            This model has no colourable parts. Uploaded models always do.
          </p>
        )}
        {parts?.map((part) => (
          <PartColour
            colour={partColour(materials, node, part)}
            key={part}
            label={slotLabelFromId(part)}
            onChange={(colour) => commitColour(node.id, part, colour)}
          />
        ))}
      </section>
    </div>
  )
}

function PartColour({
  label,
  colour,
  onChange,
}: {
  label: string
  colour: string | null
  onChange: (colour: string | null) => void
}) {
  const custom = useRef<HTMLInputElement>(null)
  // The native picker reports every colour while dragging; commit once it closes.
  useEffect(() => {
    const input = custom.current
    if (!input) return
    const commit = () => onChange(input.value)
    input.addEventListener('change', commit)
    return () => input.removeEventListener('change', commit)
  }, [onChange])

  return (
    <div className="flex flex-col gap-1" data-testid={`part-${label}`}>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {colour && (
          <button
            aria-label={`Reset ${label} colour`}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => onChange(null)}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {SWATCHES.map((swatch) => (
          <button
            aria-label={`${label} ${swatch}`}
            className={cn(
              'h-5 w-5 rounded-full border border-border',
              colour === swatch && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
            )}
            key={swatch}
            onClick={() => onChange(swatch)}
            style={{ background: swatch }}
            type="button"
          />
        ))}
        <input
          aria-label={`${label} custom colour`}
          className="h-5 w-5 cursor-pointer rounded-full border border-border bg-transparent p-0"
          defaultValue={colour ?? '#ffffff'}
          ref={custom}
          type="color"
        />
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    const parsed = draft === null ? Number.NaN : Number.parseFloat(draft.replace(',', '.'))
    setDraft(null)
    if (Number.isFinite(parsed) && parsed !== value) onCommit(parsed)
  }
  return (
    <label className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <input
        aria-label={label}
        className="w-full min-w-0 bg-transparent py-1 text-right text-sm outline-none"
        inputMode="decimal"
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        value={draft ?? String(value)}
      />
    </label>
  )
}

/** One edit, like the engine's paint tool: the material and the slot ref together (one undo). */
function commitColour(nodeId: ItemNode['id'], part: string, colour: string | null) {
  useScene.setState((state) => {
    const node = state.nodes[nodeId as AnyNodeId]
    if (state.readOnly || node?.type !== 'item') return state
    const { slots, material } = colourChange(
      state.materials as Record<string, SceneMaterial>,
      node as ItemNode,
      part,
      colour,
    )
    return {
      materials: material ? { ...state.materials, [material.id]: material } : state.materials,
      nodes: { ...state.nodes, [nodeId]: { ...node, slots } },
    }
  })
  useScene.getState().markDirty(nodeId as AnyNodeId)
}

const partsCache = new Map<string, Promise<string[]>>()

/** Paintable parts (`slot_*` materials) of a model; null while reading. */
function useModelParts(src: string): string[] | null {
  const [parts, setParts] = useState<{ src: string; parts: string[] } | null>(null)
  useEffect(() => {
    let cancelled = false
    let request = partsCache.get(src)
    if (!request) {
      request = fetch(resolveCdnUrl(src) ?? src)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const names =
            parseGlb(new Uint8Array(buffer)).json.materials?.map((m) => m.name ?? '') ?? []
          return [...new Set(names.map(deriveSlotId).filter((id): id is string => id !== null))]
        })
        .catch(() => [])
      partsCache.set(src, request)
    }
    void request.then((result) => !cancelled && setParts({ src, parts: result }))
    return () => {
      cancelled = true
    }
  }, [src])
  return parts?.src === src ? parts.parts : null
}
