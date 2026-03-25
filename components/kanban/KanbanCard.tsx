'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, User, GripVertical, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentItemWithRelations } from '@/types/app.types'
import { ContentTypeBadge } from '@/components/shared/ContentTypeBadge'
import { TagBadge } from '@/components/shared/TagBadge'
import { useDuplicateItem } from '@/features/items/useItems'

interface KanbanCardProps {
  item: ContentItemWithRelations
  projectId: string
}

export function KanbanCard({ item, projectId }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const duplicate = useDuplicateItem(projectId)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const checklistTotal = item.checklist_data?.length ?? 0
  const checklistDone = item.checklist_data?.filter((c) => c.checked).length ?? 0
  const checklistPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0
  const tags = item.item_tags?.map((it) => it.tags).filter(Boolean) ?? []

  // Overdue: tiene fecha, está en el pasado y no está publicado
  const pubDate = item.published_at ? new Date(item.published_at) : null
  const isOverdue = pubDate && isPast(pubDate) && !isToday(pubDate) && item.status !== 'published'
  const isDueToday = pubDate && isToday(pubDate) && item.status !== 'published'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card p-3 shadow-sm',
        'hover:shadow-md transition-all duration-150',
        isDragging
          ? 'opacity-40 border-primary/30 shadow-none'
          : isOverdue
          ? 'border-red-500/40 hover:border-red-500/60'
          : isDueToday
          ? 'border-amber-500/40 hover:border-amber-500/60'
          : 'border-border hover:border-primary/40'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-3.5 cursor-grab touch-none opacity-0 group-hover:opacity-40 active:cursor-grabbing transition-opacity"
        aria-label="Arrastrar"
        onClick={(e) => e.preventDefault()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Duplicate button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          duplicate.mutate(item.id)
        }}
        disabled={duplicate.isPending}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-30"
        aria-label="Duplicar pieza"
        title="Duplicar"
      >
        <Copy className="h-3 w-3" />
      </button>

      {/* Cover image */}
      {item.cover_url && (
        <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-lg">
          <img src={item.cover_url} alt="" className="h-24 w-full object-cover" />
        </div>
      )}

      <Link href={`/items/${item.id}`} className="block space-y-2 pl-4 pr-4">
        {/* Tipo de contenido */}
        <ContentTypeBadge type={item.content_type} />

        {/* Título */}
        <p className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
          {item.title}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2 text-xs">
            {pubDate && (
              <span className={cn(
                'flex items-center gap-1',
                isOverdue ? 'text-red-400 font-medium' :
                isDueToday ? 'text-amber-400 font-medium' :
                'text-muted-foreground'
              )}>
                <CalendarDays className="h-3 w-3" />
                {isOverdue && '⚠ '}
                {format(pubDate, 'dd MMM', { locale: es })}
              </span>
            )}
            {item.profiles && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" />
                {item.profiles.full_name?.split(' ')[0]}
              </span>
            )}
          </div>
          {checklistTotal > 0 && (
            <span className={cn(
              'text-xs font-medium tabular-nums',
              checklistDone === checklistTotal ? 'text-green-500' : 'text-muted-foreground'
            )}>
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>

        {/* Progress bar del checklist */}
        {checklistTotal > 0 && (
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                checklistDone === checklistTotal ? 'bg-green-500' : 'bg-primary'
              )}
              style={{ width: `${checklistPct}%` }}
            />
          </div>
        )}
      </Link>
    </div>
  )
}
