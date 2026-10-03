'use client'

import { activateCatalogItem, useEditor } from '@pascal-app/editor'
import { Trash2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import {
  ITEM_CATEGORIES,
  ITEM_PLACEMENTS,
  type ItemCategory,
  type ItemPlacement,
  MODEL_UNITS,
  type ModelUnit,
  toCatalogItem,
} from '@/lib/custom-items'
import { type ImportedModel, importModel, itemMetadata, nameFromFile } from '@/lib/furniture-import'
import { cn } from '@/lib/utils'
import {
  removeCustomItem,
  updateCustomItem,
  uploadCustomItem,
  useCustomItems,
} from './custom-items-store'
import { placeholderThumbnail, renderThumbnail } from './render-thumbnail'

const LABELS: Record<string, string> = {
  furniture: 'Furniture',
  appliance: 'Appliance',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  outdoor: 'Outdoor',
  floor: 'Floor',
  wall: 'Wall',
  ceiling: 'Ceiling',
  m: 'Metres',
  cm: 'Centimetres',
  mm: 'Millimetres',
  in: 'Inches',
}

const field = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm'

/** Upload a .glb as a new Items-tab piece, and manage earlier uploads. */
export function UploadDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'upload' | 'mine'>('upload')
  return (
    <div
      aria-label="Your furniture"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-center gap-1 border-border border-b p-2">
          {(['upload', 'mine'] as const).map((id) => (
            <button
              className={cn(
                'rounded-md px-3 py-1.5 font-medium text-sm',
                tab === id ? 'bg-accent' : 'text-muted-foreground hover:text-foreground',
              )}
              key={id}
              onClick={() => setTab(id)}
              type="button"
            >
              {id === 'upload' ? 'Upload model' : 'My uploads'}
            </button>
          ))}
          <button
            aria-label="Close"
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {tab === 'upload' ? <UploadForm onDone={onClose} /> : <MyUploads />}
        </div>
      </div>
    </div>
  )
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const catalogCategory = useEditor((s) => s.catalogCategory)
  const [imported, setImported] = useState<ImportedModel | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>(
    ITEM_CATEGORIES.includes(catalogCategory as ItemCategory)
      ? (catalogCategory as ItemCategory)
      : 'furniture',
  )
  const [placement, setPlacement] = useState<ItemPlacement>('floor')
  const [unit, setUnit] = useState<ModelUnit>('m')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function choose(file: File | undefined) {
    if (!file) return
    setError(null)
    setImported(null)
    try {
      const model = importModel(new Uint8Array(await file.arrayBuffer()))
      setImported(model)
      setUnit(model.suggestedUnit)
      setName(nameFromFile(file.name))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function submit() {
    if (!imported) return
    setBusy(true)
    setError(null)
    try {
      const metadata = itemMetadata(imported, { name, category, placement, unit })
      const thumbnail = await renderThumbnail(imported.model).catch(() =>
        placeholderThumbnail(metadata.name),
      )
      const form = new FormData()
      form.set('model', new Blob([imported.model], { type: 'model/gltf-binary' }), 'model.glb')
      form.set('thumbnail', thumbnail, 'thumbnail.png')
      form.set('metadata', JSON.stringify(metadata))
      const record = await uploadCustomItem(form)
      // Ready to place: show its category and arm the placement tool.
      useEditor.getState().setCatalogCategory(record.category)
      activateCatalogItem(toCatalogItem(record, window.location.origin))
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const size = imported
    ? itemMetadata(imported, { name, category, placement, unit }).dimensions
    : null
  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border border-dashed p-5 text-center text-muted-foreground hover:bg-accent/40">
        <Upload className="h-6 w-6" />
        <span>{imported ? 'Choose another .glb file' : 'Choose a .glb file'}</span>
        <span className="text-xs">
          Export from SketchUp, Blender, 3ds Max… as glTF binary (.glb)
        </span>
        <input
          accept=".glb,model/gltf-binary"
          className="sr-only"
          data-testid="furniture-file"
          onChange={(e) => void choose(e.target.files?.[0])}
          type="file"
        />
      </label>

      {imported && (
        <>
          <Field label="Name">
            <input
              className={field}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select onChange={setCategory} options={ITEM_CATEGORIES} value={category} />
            </Field>
            <Field label="Placed on">
              <Select onChange={setPlacement} options={ITEM_PLACEMENTS} value={placement} />
            </Field>
          </div>
          <Field label="Model units">
            <Select
              onChange={setUnit}
              options={Object.keys(MODEL_UNITS) as ModelUnit[]}
              value={unit}
            />
          </Field>
          {size && (
            <p
              className="rounded-md bg-accent/50 px-3 py-2 text-muted-foreground"
              data-testid="furniture-size"
            >
              Size: {cm(size[0])} × {cm(size[2])} × {cm(size[1])} cm (W × D × H) ·{' '}
              {imported.parts.length} colourable part{imported.parts.length === 1 ? '' : 's'}
            </p>
          )}
        </>
      )}

      {error && <p className="text-red-500">{error}</p>}
      <button
        className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
        disabled={!imported || !name.trim() || busy}
        onClick={() => void submit()}
        type="button"
      >
        {busy ? 'Uploading…' : 'Add to Items'}
      </button>
    </div>
  )
}

function MyUploads() {
  const { items, loaded, error } = useCustomItems()
  const [message, setMessage] = useState<string | null>(null)
  if (!loaded) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (error) return <p className="text-red-500 text-sm">{error}</p>
  if (!items.length) return <p className="text-muted-foreground text-sm">No uploads yet.</p>
  return (
    <div className="flex flex-col gap-2 text-sm">
      {items.map((item) => (
        <div className="flex items-center gap-2" key={item.id}>
          <img
            alt=""
            className="h-10 w-10 rounded-md bg-accent object-cover"
            src={`/api/items/${item.id}/thumbnail.png`}
          />
          <input
            aria-label="Name"
            className={field}
            defaultValue={item.name}
            maxLength={120}
            onBlur={(e) => {
              const next = e.target.value.trim()
              if (next && next !== item.name) {
                updateCustomItem(item.id, { name: next }).catch((err: Error) =>
                  setMessage(err.message),
                )
              }
            }}
          />
          <button
            aria-label={`Remove ${item.name}`}
            className="rounded-md p-2 text-red-500 hover:bg-red-500/10"
            onClick={() => {
              if (!window.confirm(`Remove "${item.name}" from Items? Scenes that use it keep it.`))
                return
              removeCustomItem(item.id).catch((err: Error) => setMessage(err.message))
            }}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {message && <p className="text-red-500">{message}</p>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      {children}
    </label>
  )
}

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <select className={field} onChange={(e) => onChange(e.target.value as T)} value={value}>
      {options.map((option) => (
        <option key={option} value={option}>
          {LABELS[option] ?? option}
        </option>
      ))}
    </select>
  )
}

function cm(metres: number) {
  return Math.round(metres * 1000) / 10
}
