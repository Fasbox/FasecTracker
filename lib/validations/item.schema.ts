import { z } from 'zod'
import { type ContentStatus, type ContentType } from '@/types/app.types'

export const contentItemSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  status: z.enum(['idea', 'script', 'production', 'editing', 'review', 'scheduled', 'published'] as const),
  content_type: z.enum(['video', 'carousel', 'blog', 'reel', 'short', 'other'] as const),
  published_at: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  series_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
})

export type ContentItemFormValues = z.infer<typeof contentItemSchema>
