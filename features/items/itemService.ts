import { createClient } from '@/lib/supabase/client'
import type { ContentItem, ContentItemWithRelations, ContentStatus, ChecklistDataItem, FieldsData } from '@/types/app.types'
import type { ContentItemFormValues } from '@/lib/validations/item.schema'
import { computeKanbanOrder } from '@/lib/utils'

const supabase = createClient()

const ITEM_SELECT = `
  *,
  categories ( id, name, color ),
  series ( id, name ),
  profiles!content_items_assigned_to_fkey ( id, full_name, avatar_url ),
  item_tags ( tag_id, tags ( id, name, color ) ),
  content_resources ( * )
`

export async function getItemsByProject(projectId: string): Promise<ContentItemWithRelations[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select(ITEM_SELECT)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('kanban_order', { ascending: true })

  if (error) throw error
  return data as ContentItemWithRelations[]
}

export async function getItem(id: string): Promise<ContentItemWithRelations> {
  const { data, error } = await supabase
    .from('content_items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ContentItemWithRelations
}

export async function createItem(
  projectId: string,
  values: ContentItemFormValues,
  templateId?: string
): Promise<ContentItem> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Obtener template si existe
  let templateSnapshot = null
  let fieldsData: FieldsData = {}
  let checklistData: ChecklistDataItem[] = []

  if (templateId) {
    const { data: template } = await supabase
      .from('content_templates')
      .select('structure')
      .eq('id', templateId)
      .single()

    if (template) {
      templateSnapshot = template.structure
      // Inicializar fields_data con contenido predeterminado del template (o vacío)
      template.structure.fields?.forEach((field: { key: string; default_content?: object }) => {
        fieldsData[field.key] = field.default_content ?? { type: 'doc', content: [{ type: 'paragraph' }] }
      })
      // Snapshot del checklist
      checklistData = (template.structure.checklist || []).map((item: { id: string; label: string }) => ({
        id: item.id,
        label: item.label,
        checked: false,
      }))
    }
  }

  // Posición al final del kanban en el estado dado
  const { data: lastItem } = await supabase
    .from('content_items')
    .select('kanban_order')
    .eq('project_id', projectId)
    .eq('status', values.status)
    .is('deleted_at', null)
    .order('kanban_order', { ascending: false })
    .limit(1)
    .single()

  const kanban_order = computeKanbanOrder(lastItem?.kanban_order ?? null, null)

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      ...values,
      project_id: projectId,
      template_id: templateId || null,
      template_snapshot: templateSnapshot,
      fields_data: fieldsData,
      checklist_data: checklistData,
      created_by: user.id,
      kanban_order,
    })
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

export async function updateItem(id: string, values: Partial<ContentItemWithRelations>): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

export async function updateItemStatus(
  id: string,
  newStatus: ContentStatus,
  prevOrder: number | null,
  nextOrder: number | null
): Promise<ContentItem> {
  const kanban_order = computeKanbanOrder(prevOrder, nextOrder)
  const { data, error } = await supabase
    .from('content_items')
    .update({ status: newStatus, kanban_order })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

export async function updateItemFields(id: string, fieldsData: FieldsData): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .update({ fields_data: fieldsData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function updateChecklist(id: string, checklistData: ChecklistDataItem[]): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .update({ checklist_data: checklistData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function duplicateItem(id: string): Promise<ContentItem> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Obtener el item original con todas sus relaciones
  const { data: original, error: fetchError } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) throw fetchError ?? new Error('Pieza no encontrada')

  // Posición al final de la misma columna
  const { data: lastItem } = await supabase
    .from('content_items')
    .select('kanban_order')
    .eq('project_id', original.project_id)
    .eq('status', original.status)
    .is('deleted_at', null)
    .order('kanban_order', { ascending: false })
    .limit(1)
    .single()

  const kanban_order = computeKanbanOrder(lastItem?.kanban_order ?? null, null)

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      project_id: original.project_id,
      template_id: original.template_id,
      template_snapshot: original.template_snapshot,
      title: `${original.title} (copia)`,
      status: original.status,
      content_type: original.content_type,
      published_at: null,
      category_id: original.category_id,
      series_id: original.series_id,
      assigned_to: original.assigned_to,
      fields_data: original.fields_data,
      checklist_data: (original.checklist_data ?? []).map(
        (item: { id: string; label: string }) => ({ id: item.id, label: item.label, checked: false })
      ),
      meta: original.meta ?? {},
      created_by: user.id,
      kanban_order,
    })
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
