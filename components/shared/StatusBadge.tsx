'use client'

import { cn } from '@/lib/utils'
import type { ContentStatus } from '@/types/app.types'
import { KANBAN_STATUSES } from '@/types/app.types'

interface StatusBadgeProps {
  status: ContentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = KANBAN_STATUSES.find((s) => s.value === status)
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
