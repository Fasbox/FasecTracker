'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, Settings, ChevronLeft, ChevronRight, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useProjects } from '@/features/projects/useProjects'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, activeProjectId } = useUIStore()
  const { data: projects } = useProjects()

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-border bg-card transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-14 items-center border-b border-border px-4',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        {sidebarCollapsed ? (
          <span className="text-lg font-bold text-primary">F</span>
        ) : (
          <span className="text-base font-bold text-foreground">FasecTracker</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {/* Dashboard */}
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4 flex-none" />}
          label="Dashboard"
          collapsed={sidebarCollapsed}
          active={pathname === '/dashboard'}
        />

        {/* Projects */}
        {!sidebarCollapsed && (
          <div className="mt-4 mb-1 px-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Proyectos
            </span>
            <Link href="/projects/new" className="rounded p-0.5 hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        )}

        {projects?.map((project) => (
          <SidebarLink
            key={project.id}
            href={`/projects/${project.id}/kanban`}
            icon={
              <span
                className="h-4 w-4 flex-none rounded-sm"
                style={{ backgroundColor: project.color }}
              />
            }
            label={project.name}
            collapsed={sidebarCollapsed}
            active={pathname.includes(project.id)}
          />
        ))}

        {!sidebarCollapsed && projects?.length === 0 && (
          <Link
            href="/projects/new"
            className="mx-1 mt-1 flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo proyecto
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-border p-2',
        sidebarCollapsed && 'flex justify-center'
      )}>
        <SidebarLink
          href="/settings"
          icon={<Settings className="h-4 w-4 flex-none" />}
          label="Ajustes"
          collapsed={sidebarCollapsed}
          active={pathname === '/settings'}
        />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
        aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  active?: boolean
}

function SidebarLink({ href, icon, label, collapsed, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-0'
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}
