'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import { useState, useMemo, useCallback } from 'react'
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
  // Estado local para feedback optimista mientras arrastras
  const [localItems, setLocalItems] = useState<ContentItemWithRelations[] | null>(null)
  const updateStatus = useUpdateItemStatus(projectId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  // Detecta columnas primero, luego cards — resuelve el problema principal del DnD
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      // Prioriza si hay colisión con una columna directamente
      const columnHit = pointerCollisions.find(
        ({ id }) => KANBAN_STATUSES.some((s) => s.value === id)
      )
      if (columnHit) return [columnHit]
      return pointerCollisions
    }
    return rectIntersection(args)
  }, [])

  const displayItems = localItems ?? items

  const itemsByStatus = useMemo(() => {
    const map = {} as Record<ContentStatus, ContentItemWithRelations[]>
    KANBAN_STATUSES.forEach((s) => { map[s.value] = [] })
    displayItems.forEach((item) => {
      if (map[item.status]) map[item.status].push(item)
    })
    return map
  }, [displayItems])

  const handleDragStart = ({ active }: DragStartEvent) => {
    const item = items.find((i) => i.id === active.id)
    setActiveItem(item ?? null)
    setLocalItems([...items]) // copia para optimismo
  }

  // Mueve la card visualmente en tiempo real entre columnas
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !localItems) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeEl = localItems.find((i) => i.id === activeId)
    if (!activeEl) return

    const targetStatus =
      (KANBAN_STATUSES.find((s) => s.value === overId)?.value as ContentStatus | undefined) ??
      (localItems.find((i) => i.id === overId)?.status)

    if (!targetStatus || targetStatus === activeEl.status) return

    setLocalItems((prev) =>
      (prev ?? items).map((i) =>
        i.id === activeId ? { ...i, status: targetStatus } : i
      )
    )
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const draggedItem = items.find((i) => i.id === active.id)
    setActiveItem(null)
    setLocalItems(null)

    if (!over || !draggedItem) return

    const overId = over.id as string
    const targetStatus =
      (KANBAN_STATUSES.find((s) => s.value === overId)?.value as ContentStatus | undefined) ??
      (items.find((i) => i.id === overId)?.status)

    if (!targetStatus || targetStatus === draggedItem.status) return

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
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeItem && (
          <div className="rotate-1 scale-105 opacity-95 shadow-2xl">
            <KanbanCard item={activeItem} projectId={projectId} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
