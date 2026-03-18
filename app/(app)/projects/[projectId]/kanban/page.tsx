'use client'

import { use } from 'react'
import { useItemsByProject } from '@/features/items/useItems'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Loader2 } from 'lucide-react'

interface Props {
  params: Promise<{ projectId: string }>
}

export default function KanbanPage({ params }: Props) {
  const { projectId } = use(params)
  const { data: items, isLoading, error } = useItemsByProject(projectId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-destructive">Error al cargar las piezas</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden p-4">
      <KanbanBoard items={items ?? []} projectId={projectId} />
    </div>
  )
}
