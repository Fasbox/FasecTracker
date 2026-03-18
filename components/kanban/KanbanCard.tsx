'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, User, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentItemWithRelations } from '@/types/app.types'
import { ContentTypeBadge } from '@/components/shared/ContentTypeBadge'
import { TagBadge } from '@/components/shared/TagBadge'

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const checklistTotal = item.checklist_data?.length ?? 0
  const checklistDone = item.checklist_data?.filter((c) => c.checked).length ?? 0
  const tags = item.item_tags?.map((it) => it.tags).filter(Boolean) ?? []

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border border-border bg-card p-3 shadow-sm',
        'hover:border-primary/40 hover:shadow-md transition-all',
        isDragging && 'opacity-50 ring-2 ring-primary shadow-lg'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-3.5 cursor-grab touch-none opacity-0 group-hover:opacity-40 active:cursor-grabbing"
        aria-label="Arrastrar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Cover image */}
      {item.cover_url && (
        <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-lg">
          <img
            src={item.cover_url}
            alt=""
            className="h-24 w-full object-cover"
          />
        </div>
      )}

      <Link href={`/items/${item.id}`} className="block space-y-2 pl-4">
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
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.published_at && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(item.published_at), 'dd MMM', { locale: es })}
              </span>
            )}
            {item.profiles && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.profiles.full_name?.split(' ')[0]}
              </span>
            )}
          </div>
          {checklistTotal > 0 && (
            <span className={cn(
              'text-xs font-medium',
              checklistDone === checklistTotal ? 'text-green-500' : 'text-muted-foreground'
            )}>
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}
