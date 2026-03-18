'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, useMemo } from 'react'
import type { ContentItemWithRelations, ContentStatus } from '@/types/app.types'
import { KANBAN_STATUSES } from '@/types/app.types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useUpdateItemStatus } from '@/features/items/useItems'

interface KanbanBoardProps {
  items: ContentItemWithRelations[]
  projectId: string
}

export function KanbanBoard({ items, projectId }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<ContentItemWithRelations | null>(null)
  const updateStatus = useUpdateItemStatus(projectId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const itemsByStatus = useMemo(() => {
    const map: Record<ContentStatus, ContentItemWithRelations[]> = {} as Record<ContentStatus, ContentItemWithRelations[]>
    KANBAN_STATUSES.forEach((s) => { map[s.value] = [] })
    items.forEach((item) => {
      if (map[item.status]) map[item.status].push(item)
    })
    return map
  }, [items])

  const handleDragStart = ({ active }: DragStartEvent) => {
    const item = items.find((i) => i.id === active.id)
    setActiveItem(item ?? null)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null)
    if (!over) return

    const draggedItem = items.find((i) => i.id === active.id)
    if (!draggedItem) return

    // ¿Soltó en una columna (status) o en otra card?
    const targetStatus = KANBAN_STATUSES.find((s) => s.value === over.id)?.value
      ?? items.find((i) => i.id === over.id)?.status

    if (!targetStatus || targetStatus === draggedItem.status) return

    // Calcular orden en la nueva columna
    const targetColumn = itemsByStatus[targetStatus]
    const lastItem = targetColumn[targetColumn.length - 1]

    updateStatus.mutate({
      id: draggedItem.id,
      newStatus: targetStatus,
      prevOrder: lastItem?.kanban_order ?? null,
      nextOrder: null,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto pb-4">
        {KANBAN_STATUSES.map((s) => (
          <KanbanColumn
            key={s.value}
            status={s.value}
            items={itemsByStatus[s.value]}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="rotate-2 opacity-90">
            <KanbanCard item={activeItem} projectId={projectId} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
