import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FolderKanban } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_members(count)')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Proyectos</h1>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/kanban`}
              className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-4 w-4 flex-none rounded-sm"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-base font-semibold text-foreground mb-2">Sin proyectos todavía</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Crea tu primer proyecto para empezar a organizar tu contenido.
          </p>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear proyecto
          </Link>
        </div>
      )}
    </div>
  )
}
