'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChecklistDataItem } from '@/types/app.types'
import { useUpdateChecklist } from '@/features/items/useItems'

interface ItemChecklistProps {
  itemId: string
  projectId: string
  checklistData: ChecklistDataItem[]
}

export function ItemChecklist({ itemId, projectId, checklistData }: ItemChecklistProps) {
  const [items, setItems] = useState<ChecklistDataItem[]>(checklistData)
  const updateChecklist = useUpdateChecklist(itemId, projectId)

  const toggle = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    setItems(updated)
    updateChecklist.mutate(updated)
  }

  const done = items.filter((i) => i.checked).length
  const total = items.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Checklist</h3>
        <span className={cn(
          'text-xs font-medium',
          done === total && total > 0 ? 'text-green-500' : 'text-muted-foreground'
        )}>
          {done}/{total}
        </span>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              done === total ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {/* Items */}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-start gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-accent/50 transition-colors"
            >
              {item.checked ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              )}
              <span className={cn(
                'leading-snug',
                item.checked && 'text-muted-foreground line-through'
              )}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">Sin ítems en el checklist</p>
      )}
    </div>
  )
}
