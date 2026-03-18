import { createClient } from '@/lib/supabase/client'
import type { ContentTemplate } from '@/types/app.types'
import type { TemplateFormValues } from '@/lib/validations/template.schema'

const supabase = createClient()

export async function getTemplatesByProject(projectId: string): Promise<ContentTemplate[]> {
  const { data, error } = await supabase
    .from('content_templates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as ContentTemplate[]
}

export async function createTemplate(projectId: string, values: TemplateFormValues): Promise<ContentTemplate> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('content_templates')
    .insert({ ...values, project_id: projectId, created_by: user.id })
    .select()
    .single()

  if (error) throw error
  return data as ContentTemplate
}

export async function updateTemplate(id: string, values: Partial<TemplateFormValues>): Promise<ContentTemplate> {
  const { data, error } = await supabase
    .from('content_templates')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ContentTemplate
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('content_templates').delete().eq('id', id)
  if (error) throw error
}

export async function setDefaultTemplate(projectId: string, templateId: string): Promise<void> {
  // Quitar default de todos los del proyecto
  await supabase
    .from('content_templates')
    .update({ is_default: false })
    .eq('project_id', projectId)

  // Asignar default al seleccionado
  await supabase
    .from('content_templates')
    .update({ is_default: true })
    .eq('id', templateId)
}
