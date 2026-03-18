// ================================================================
// FasecTracker — Domain Types
// ================================================================

export type ContentStatus =
  | 'idea'
  | 'script'
  | 'production'
  | 'editing'
  | 'review'
  | 'scheduled'
  | 'published'

export type ContentType =
  | 'video'
  | 'carousel'
  | 'blog'
  | 'reel'
  | 'short'
  | 'other'

export type MemberRole = 'owner' | 'editor'

export type ResourceType = 'file' | 'link'

// ----------------------------------------------------------------
// Profile
// ----------------------------------------------------------------
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// Project
// ----------------------------------------------------------------
export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  cover_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  created_at: string
  profiles?: Profile
}

export interface ProjectWithMembers extends Project {
  project_members: ProjectMember[]
}

// ----------------------------------------------------------------
// Template
// ----------------------------------------------------------------
export interface TemplateField {
  key: string
  label: string
  type: 'rich_text' | 'text' | 'number'
  required: boolean
}

export interface TemplateChecklistItem {
  id: string
  label: string
  required: boolean
}

export interface TemplateStructure {
  sections: string[]
  fields: TemplateField[]
  checklist: TemplateChecklistItem[]
  default_content_type: ContentType
}

export interface ContentTemplate {
  id: string
  project_id: string
  name: string
  description: string | null
  structure: TemplateStructure
  is_default: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// Category & Series & Tag
// ----------------------------------------------------------------
export interface Category {
  id: string
  project_id: string
  name: string
  color: string
  created_at: string
}

export interface Series {
  id: string
  project_id: string
  name: string
  description: string | null
  cover_url: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

// ----------------------------------------------------------------
// Content Item
// ----------------------------------------------------------------
export interface ChecklistDataItem {
  id: string
  label: string
  checked: boolean
}

// fields_data keys map to TemplateField keys, values are Tiptap JSON
export type FieldsData = Record<string, object>

export interface ContentItem {
  id: string
  project_id: string
  template_id: string | null
  template_snapshot: TemplateStructure | null
  title: string
  status: ContentStatus
  content_type: ContentType
  published_at: string | null
  cover_url: string | null
  category_id: string | null
  series_id: string | null
  assigned_to: string | null
  created_by: string
  fields_data: FieldsData
  checklist_data: ChecklistDataItem[]
  meta: Record<string, unknown>
  kanban_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ContentItemWithRelations extends ContentItem {
  categories?: Category | null
  series?: Series | null
  profiles?: Profile | null
  item_tags?: { tags: Tag }[]
  content_resources?: ContentResource[]
}

// ----------------------------------------------------------------
// Resource
// ----------------------------------------------------------------
export interface ContentResource {
  id: string
  item_id: string
  type: ResourceType
  label: string | null
  url: string
  mime_type: string | null
  size_bytes: number | null
  created_by: string | null
  created_at: string
}

// ----------------------------------------------------------------
// UI helpers
// ----------------------------------------------------------------
export const KANBAN_STATUSES: { value: ContentStatus; label: string; color: string }[] = [
  { value: 'idea',       label: 'Idea',       color: 'bg-slate-500'  },
  { value: 'script',     label: 'Guion',      color: 'bg-blue-500'   },
  { value: 'production', label: 'Producción', color: 'bg-amber-500'  },
  { value: 'editing',    label: 'Edición',    color: 'bg-orange-500' },
  { value: 'review',     label: 'Revisión',   color: 'bg-purple-500' },
  { value: 'scheduled',  label: 'Programado', color: 'bg-cyan-500'   },
  { value: 'published',  label: 'Publicado',  color: 'bg-green-500'  },
]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video:    'Video',
  carousel: 'Carrusel',
  blog:     'Blog',
  reel:     'Reel',
  short:    'Short',
  other:    'Otro',
}
