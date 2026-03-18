'use client'

import { cn } from '@/lib/utils'
import type { Tag } from '@/types/app.types'

interface TagBadgeProps {
  tag: Tag
  className?: string
  onRemove?: () => void
}

export function TagBadge({ tag, className, onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white',
        className
      )}
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:opacity-80 focus:outline-none"
          aria-label={`Quitar etiqueta ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
