'use client'

import { cn } from '@/lib/utils'
import type { ContentType } from '@/types/app.types'
import { CONTENT_TYPE_LABELS } from '@/types/app.types'
import { Video, LayoutGrid, FileText, Film, Zap, Tag } from 'lucide-react'

const icons: Record<ContentType, React.ElementType> = {
  video:    Video,
  carousel: LayoutGrid,
  blog:     FileText,
  reel:     Film,
  short:    Zap,
  other:    Tag,
}

interface ContentTypeBadgeProps {
  type: ContentType
  className?: string
  showIcon?: boolean
}

export function ContentTypeBadge({ type, className, showIcon = true }: ContentTypeBadgeProps) {
  const Icon = icons[type] || Tag
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {CONTENT_TYPE_LABELS[type]}
    </span>
  )
}
