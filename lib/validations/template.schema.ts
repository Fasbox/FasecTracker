import { z } from 'zod'

const templateFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['rich_text', 'text', 'number']),
  required: z.boolean().default(false),
})

const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  required: z.boolean().default(false),
})

export const templateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(300).optional().nullable(),
  is_default: z.boolean().default(false),
  structure: z.object({
    sections: z.array(z.string()),
    fields: z.array(templateFieldSchema),
    checklist: z.array(checklistItemSchema),
    default_content_type: z.enum(['video', 'carousel', 'blog', 'reel', 'short', 'other']),
  }),
})

export type TemplateFormValues = z.infer<typeof templateSchema>
