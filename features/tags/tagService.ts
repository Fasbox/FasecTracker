import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types/app.types'

const supabase = createClient()

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Tag[]
}

export async function createTag(name: string, color = '#64748b'): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .upsert({ name, color }, { onConflict: 'name' })
    .select()
    .single()

  if (error) throw error
  return data as Tag
}

export async function addTagToItem(itemId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('item_tags')
    .insert({ item_id: itemId, tag_id: tagId })

  if (error && error.code !== '23505') throw error // ignorar duplicate
}

export async function removeTagFromItem(itemId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('item_tags')
    .delete()
    .eq('item_id', itemId)
    .eq('tag_id', tagId)

  if (error) throw error
}
