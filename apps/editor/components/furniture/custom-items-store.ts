'use client'

import { useEffect, useSyncExternalStore } from 'react'
import type { CustomItemPatch, CustomItemRecord } from '@/lib/custom-items'

/** The uploaded items, fetched once and shared by the Items tab and the upload dialog. */

type State = { items: CustomItemRecord[]; loaded: boolean; error: string | null }

let state: State = { items: [], loaded: false, error: null }
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function set(next: Partial<State>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function refreshCustomItems(): Promise<void> {
  inflight ??= (async () => {
    try {
      const response = await fetch('/api/items', { cache: 'no-store' })
      if (!response.ok) throw new Error(`Couldn't load your uploads (${response.status})`)
      const { items } = (await response.json()) as { items: CustomItemRecord[] }
      set({ items, loaded: true, error: null })
    } catch (error) {
      set({ loaded: true, error: error instanceof Error ? error.message : String(error) })
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function useCustomItems(): State {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  )
  useEffect(() => {
    if (!state.loaded) void refreshCustomItems()
  }, [])
  return snapshot
}

export async function uploadCustomItem(form: FormData): Promise<CustomItemRecord> {
  const response = await fetch('/api/items', { method: 'POST', body: form })
  const body = (await response.json().catch(() => ({}))) as {
    item?: CustomItemRecord
    details?: string
  }
  if (!(response.ok && body.item))
    throw new Error(body.details ?? `Upload failed (${response.status})`)
  set({ items: [body.item, ...state.items] })
  return body.item
}

export async function updateCustomItem(id: string, patch: CustomItemPatch): Promise<void> {
  const response = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  const body = (await response.json().catch(() => ({}))) as { item?: CustomItemRecord }
  if (!(response.ok && body.item)) throw new Error(`Couldn't save the change (${response.status})`)
  const updated = body.item
  set({ items: state.items.map((item) => (item.id === id ? updated : item)) })
}

export async function removeCustomItem(id: string): Promise<void> {
  const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 404) {
    throw new Error(`Couldn't remove the item (${response.status})`)
  }
  set({ items: state.items.filter((item) => item.id !== id) })
}
