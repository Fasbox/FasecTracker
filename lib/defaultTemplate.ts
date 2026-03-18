import type { TemplateStructure } from '@/types/app.types'

export const DEFAULT_TEMPLATE_STRUCTURE: TemplateStructure = {
  sections: ['ideas', 'script', 'notes'],
  fields: [
    { key: 'ideas',  label: 'Ideas iniciales', type: 'rich_text', required: false },
    { key: 'script', label: 'Guion',           type: 'rich_text', required: false },
    { key: 'notes',  label: 'Notas internas',  type: 'rich_text', required: false },
  ],
  checklist: [
    { id: 'c1', label: 'Grabar video',      required: true  },
    { id: 'c2', label: 'Editar video',      required: true  },
    { id: 'c3', label: 'Thumbnail lista',   required: false },
    { id: 'c4', label: 'Texto y hashtags',  required: false },
    { id: 'c5', label: 'Subir y programar', required: false },
  ],
  default_content_type: 'video',
}
