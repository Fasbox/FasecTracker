'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProject, useUpdateProject, useDeleteProject } from '@/features/projects/useProjects'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#a855f7',
]

interface Props {
  params: Promise<{ projectId: string }>
}

export default function ProjectSettingsPage({ params }: Props) {
  const { projectId } = use(params)
  const router = useRouter()
  const { data: project, isLoading } = useProject(projectId)
  const updateProject = useUpdateProject(projectId)
  const deleteProject = useDeleteProject()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description ?? '')
      setColor(project.color)
    }
  }, [project])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProject.mutateAsync({ name: name.trim(), description: description.trim() || null, color })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (deleteInput !== project?.name) return
    await deleteProject.mutateAsync(projectId)
    router.push('/dashboard')
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
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-8 p-6">

        {/* General settings */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Configuración general</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="desc">Descripción</label>
              <textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <span className="flex h-full w-full items-center justify-center text-white text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProject.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateProject.isPending ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Zona de peligro</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Archivar el proyecto lo ocultará del listado. Las piezas y datos no se eliminan permanentemente.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Archivar proyecto
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-foreground">
                Escribe <strong>{project.name}</strong> para confirmar:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={project.name}
                className="w-full rounded-md border border-destructive/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== project.name || deleteProject.isPending}
                  className="flex-1 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-40"
                >
                  {deleteProject.isPending ? 'Archivando...' : 'Confirmar archivo'}
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
