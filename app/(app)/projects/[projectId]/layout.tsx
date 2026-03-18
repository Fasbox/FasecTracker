import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectTopbar } from '@/components/layout/Topbar'
import { NewItemModal } from '@/components/items/NewItemModal'
import type { Project } from '@/types/app.types'

interface Props {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: Props) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()

  if (error || !project) notFound()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ProjectTopbar project={project as Project} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <NewItemModal projectId={projectId} />
    </div>
  )
}
