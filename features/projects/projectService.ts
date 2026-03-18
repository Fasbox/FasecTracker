import { createClient } from '@/lib/supabase/client'
import type { Project, ProjectWithMembers } from '@/types/app.types'
import type { ProjectFormValues } from '@/lib/validations/project.schema'

const supabase = createClient()

export async function getProjects(): Promise<ProjectWithMembers[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id, user_id, role,
        profiles ( id, full_name, avatar_url, email )
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectWithMembers[]
}

export async function getProject(id: string): Promise<ProjectWithMembers> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id, user_id, role,
        profiles ( id, full_name, avatar_url, email )
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as ProjectWithMembers
}

export async function createProject(values: ProjectFormValues): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Insertamos sin .select() para evitar el 403 de RLS en el SELECT inmediato
  // (el usuario aún no es member cuando se ejecuta el SELECT interno de PostgREST)
  const { error } = await supabase
    .from('projects')
    .insert({ ...values, owner_id: user.id })

  if (error) throw error

  // Recuperamos el proyecto recién creado por owner_id
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !project) throw fetchError ?? new Error('No se pudo obtener el proyecto creado')

  // Agregar al owner como miembro del proyecto
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'owner',
  })

  return project as Project
}

export async function updateProject(id: string, values: Partial<ProjectFormValues>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
