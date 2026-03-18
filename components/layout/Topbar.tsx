'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/app.types'
import { useUIStore } from '@/store/uiStore'

interface ProjectTopbarProps {
  project: Project
  onNewItem?: () => void
}

const PROJECT_TABS = [
  { label: 'Kanban',     path: 'kanban'     },
  { label: 'Calendario', path: 'calendar'   },
  { label: 'Templates',  path: 'templates'  },
  { label: 'Ajustes',    path: 'settings'   },
]

export function ProjectTopbar({ project, onNewItem }: ProjectTopbarProps) {
  const pathname = usePathname()
  const { openNewItem } = useUIStore()
  const handleNewItem = onNewItem ?? openNewItem

  return (
    <header className="flex h-12 flex-none items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        {/* Project indicator */}
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm flex-none"
            style={{ backgroundColor: project.color }}
          />
          <span className="hidden text-sm font-semibold text-foreground sm:block truncate max-w-40">
            {project.name}
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center">
          {PROJECT_TABS.map((tab) => {
            const href = `/projects/${project.id}/${tab.path}`
            const active = pathname.includes(`/${tab.path}`)
            return (
              <Link
                key={tab.path}
                href={href}
                className={cn(
                  'px-3 py-3 text-sm transition-colors border-b-2',
                  active
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Actions */}
      <button
        onClick={handleNewItem}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Nueva pieza</span>
      </button>
    </header>
  )
}
