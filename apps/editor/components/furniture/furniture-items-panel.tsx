'use client'

import { CATALOG_ITEMS, ItemsPanel } from '@pascal-app/editor'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toCatalogItem } from '@/lib/custom-items'
import { useCustomItems } from './custom-items-store'
import { UploadDialog } from './upload-dialog'

/**
 * The Items tab: Pascal's built-in catalog plus the user's uploads, with an
 * "Upload" tile first in every category. The Library/Community/Mine chips and
 * tag filters stay hidden, as before.
 */
export function FurnitureItemsPanel() {
  const { items: uploads } = useCustomItems()
  const [open, setOpen] = useState(false)
  const items = useMemo(
    () => [...CATALOG_ITEMS, ...uploads.map((u) => toCatalogItem(u, window.location.origin))],
    [uploads],
  )
  return (
    <>
      <ItemsPanel
        items={items}
        leadingTile={
          <button
            className="group flex flex-col gap-1.5 rounded-xl p-1.5 transition-colors hover:bg-sidebar-accent"
            onClick={() => setOpen(true)}
            type="button"
          >
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border border-dashed text-muted-foreground group-hover:text-foreground">
              <Plus className="h-6 w-6" />
            </div>
            <span className="truncate px-0.5 text-left font-medium text-[11px] text-muted-foreground group-hover:text-foreground">
              Upload
            </span>
          </button>
        }
        showSourceFilter={false}
        showTagFilters={false}
      />
      {open && <UploadDialog onClose={() => setOpen(false)} />}
    </>
  )
}
