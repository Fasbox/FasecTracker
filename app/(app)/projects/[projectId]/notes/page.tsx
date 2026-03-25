'use client'

import { use, useState } from 'react'
import dynamic from 'next/dynamic'
import { useProject, useUpdateProjectNotes } from '@/features/projects/useProjects'
import { Loader2, CheckCircle2 } from 'lucide-react'

const RichEditor = dynamic(
  () => import('@/components/editor/RichEditor').then((m) => m.RichEditor),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse bg-muted/20 rounded-lg" /> }
)

interface Props {
  params: Promise<{ projectId: string }>
}

export default function NotesPage({ params }: Props) {
  const { projectId } = use(params)
  const { data: project, isLoading } = useProject(projectId)
  const updateNotes = useUpdateProjectNotes(projectId)
  const [saved, setSaved] = useState(false)

  const handleChange = (content: object) => {
    updateNotes.mutate(content, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-none items-center justify-between border-b border-border bg-card px-5 py-3">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Bloc de notas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recordatorios, ideas sueltas y notas del proyecto
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {updateNotes.isPending && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Guardando...
            </>
          )}
          {saved && !updateNotes.isPending && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Guardado</span>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <RichEditor
          key={projectId}
          content={project.notes ?? null}
          onChange={handleChange}
          placeholder="Escribe aquí tus recordatorios, ideas para grabar, cosas pendientes, notas de producción..."
          autosaveMs={1200}
          className="h-full min-h-full"
        />
      </div>
    </div>
  )
}
