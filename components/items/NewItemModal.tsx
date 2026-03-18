'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useTemplates } from '@/features/templates/useTemplates'
import { useCreateItem } from '@/features/items/useItems'
import { cn } from '@/lib/utils'
import { KANBAN_STATUSES, CONTENT_TYPE_LABELS } from '@/types/app.types'
import type { ContentStatus, ContentType } from '@/types/app.types'

interface NewItemModalProps {
  projectId: string
}

export function NewItemModal({ projectId }: NewItemModalProps) {
  const { newItemOpen, closeNewItem } = useUIStore()
  const router = useRouter()
  const { data: templates } = useTemplates(projectId)
  const createItem = useCreateItem(projectId)

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<ContentStatus>('idea')
  const [contentType, setContentType] = useState<ContentType>('video')
  const [templateId, setTemplateId] = useState<string>('')
  const [publishedAt, setPublishedAt] = useState('')
  const [error, setError] = useState('')

  if (!newItemOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido'); return }
    setError('')
    try {
      const item = await createItem.mutateAsync({
        values: {
          title: title.trim(),
          status,
          content_type: contentType,
          published_at: publishedAt || null,
        },
        templateId: templateId || undefined,
      })
      closeNewItem()
      resetForm()
      router.push(`/items/${item.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la pieza')
    }
  }

  const resetForm = () => {
    setTitle('')
    setStatus('idea')
    setContentType('video')
    setTemplateId('')
    setPublishedAt('')
    setError('')
  }

  const handleClose = () => {
    closeNewItem()
    resetForm()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Nueva pieza de contenido</h2>
            <button
              onClick={handleClose}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="item-title">
                Título <span className="text-destructive">*</span>
              </label>
              <input
                id="item-title"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Video sobre productividad"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Content Type + Status — en fila */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Tipo</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Estado inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {KANBAN_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template */}
            {templates && templates.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Template <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sin template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}{t.is_default ? ' (predeterminado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fecha de publicación */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="pub-date">
                Fecha de publicación <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                id="pub-date"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createItem.isPending || !title.trim()}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createItem.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creando...
                  </span>
                ) : 'Crear pieza'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
