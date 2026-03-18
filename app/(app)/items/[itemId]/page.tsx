'use client'

import { use, useState } from 'react'
import { useItem, useUpdateItem, useUpdateItemFields } from '@/features/items/useItems'
import { ItemChecklist } from '@/components/items/ItemChecklist'
import { ItemResources } from '@/components/items/ItemResources'
import { RichEditor } from '@/components/editor/RichEditor'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ContentTypeBadge } from '@/components/shared/ContentTypeBadge'
import { TagBadge } from '@/components/shared/TagBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, CalendarDays, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { KANBAN_STATUSES } from '@/types/app.types'
import type { ContentStatus } from '@/types/app.types'
import { useDeleteItem } from '@/features/items/useItems'

interface Props {
  params: Promise<{ itemId: string }>
}

const CONTENT_TABS = ['ideas', 'script', 'notes'] as const
const TAB_LABELS: Record<string, string> = {
  ideas:  'Ideas',
  script: 'Guion',
  notes:  'Notas',
}

export default function ItemDetailPage({ params }: Props) {
  const { itemId } = use(params)
  const { data: item, isLoading } = useItem(itemId)
  const [activeTab, setActiveTab] = useState<string>('ideas')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const updateItem = useUpdateItem(item?.project_id ?? '')
  const updateFields = useUpdateItemFields(itemId, item?.project_id ?? '')
  const deleteItem = useDeleteItem(item?.project_id ?? '')

  const handleDelete = async () => {
    await deleteItem.mutateAsync(itemId)
    router.push(`/projects/${item!.project_id}/kanban`)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!item) return <p className="p-6 text-muted-foreground">Pieza no encontrada</p>

  const tags = item.item_tags?.map((it) => it.tags).filter(Boolean) ?? []
  const availableTabs = item.template_snapshot?.fields?.map((f) => f.key) ?? CONTENT_TABS

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-none items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href={`/projects/${item.project_id}/kanban`}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <StatusBadge status={item.status} />
            <ContentTypeBadge type={item.content_type} />
            {item.published_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(item.published_at), "d 'de' MMMM yyyy", { locale: es })}
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar pieza"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">¿Eliminar?</span>
            <button
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {deleteItem.isPending ? '...' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Body: editor + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
          {/* Tabs */}
          <div className="flex flex-none border-b border-border bg-muted/30 px-2">
            {availableTabs.map((key) => {
              const fieldDef = item.template_snapshot?.fields?.find((f) => f.key === key)
              const label = fieldDef?.label ?? TAB_LABELS[key] ?? key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-4 py-2.5 text-sm border-b-2 transition-colors',
                    activeTab === key
                      ? 'border-primary text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Editor area */}
          <div className="flex-1 overflow-y-auto">
            <RichEditor
              key={activeTab}
              content={item.fields_data?.[activeTab] ?? null}
              onChange={(content) => {
                updateFields.mutate({ ...item.fields_data, [activeTab]: content })
              }}
              placeholder={`Escribe ${TAB_LABELS[activeTab]?.toLowerCase() ?? activeTab} aquí...`}
              className="h-full"
            />
          </div>
        </div>

        {/* Right: Sidebar metadata */}
        <div className="w-72 flex-none overflow-y-auto p-4 space-y-6">
          {/* Status selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {KANBAN_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateItem.mutate({ id: item.id, values: { status: s.value as ContentStatus } })}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium text-white transition-opacity',
                    s.color,
                    item.status === s.value ? 'ring-2 ring-offset-1 ring-offset-background ring-white/50' : 'opacity-60 hover:opacity-100'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Etiquetas</label>
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
              </div>
            </div>
          )}

          {/* Category */}
          {item.categories && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoría</label>
              <div
                className="mt-1.5 inline-flex rounded-md px-2 py-1 text-xs text-white"
                style={{ backgroundColor: item.categories.color }}
              >
                {item.categories.name}
              </div>
            </div>
          )}

          {/* Checklist */}
          <ItemChecklist
            itemId={item.id}
            projectId={item.project_id}
            checklistData={item.checklist_data ?? []}
          />

          {/* Resources */}
          <ItemResources
            itemId={item.id}
            projectId={item.project_id}
            resources={item.content_resources ?? []}
          />
        </div>
      </div>
    </div>
  )
}
