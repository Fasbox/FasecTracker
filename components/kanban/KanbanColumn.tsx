'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import type { ContentItemWithRelations, ContentStatus } from '@/types/app.types'
import { KANBAN_STATUSES } from '@/types/app.types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  status: ContentStatus
  items: ContentItemWithRelations[]
  projectId: string
}

export function KanbanColumn({ status, items, projectId }: KanbanColumnProps) {
  const config = KANBAN_STATUSES.find((s) => s.value === status)!
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    // setNodeRef en el wrapper completo — el header también es drop target
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full w-64 flex-none flex-col rounded-xl border border-border bg-muted/30',
        'transition-colors duration-150',
        isOver && 'border-primary/60 bg-primary/5 shadow-[0_0_0_2px] shadow-primary/20'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', config.color)} />
          <span className="text-sm font-semibold text-foreground">{config.label}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        id={status}
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            'flex flex-1 flex-col gap-2 overflow-y-auto p-2',
            'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
          )}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} projectId={projectId} />
          ))}
          {items.length === 0 && (
            <div className={cn(
              'flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors',
              isOver ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border'
            )}>
              {isOver ? 'Soltar aquí' : 'Sin piezas'}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
