'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useTemplates, useDeleteTemplate, useCreateTemplate } from '@/features/templates/useTemplates'
import { Plus, Trash2, Star, Pencil, Loader2 } from 'lucide-react'
import type { ContentTemplate } from '@/types/app.types'
import { DEFAULT_TEMPLATE_STRUCTURE } from '@/lib/defaultTemplate'

interface Props {
  params: Promise<{ projectId: string }>
}

export default function TemplatesPage({ params }: Props) {
  const { projectId } = use(params)
  const router = useRouter()
  const { data: templates, isLoading } = useTemplates(projectId)
  const createTemplate = useCreateTemplate(projectId)
  const deleteTemplate = useDeleteTemplate(projectId)

  const handleCreate = async () => {
    const template = await createTemplate.mutateAsync({
      name: 'Nuevo template',
      description: null,
      is_default: false,
      structure: DEFAULT_TEMPLATE_STRUCTURE,
    })
    router.push(`/projects/${projectId}/templates/${template.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-foreground">Templates del proyecto</h1>
        <button
          onClick={handleCreate}
          disabled={createTemplate.isPending}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nuevo template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => router.push(`/projects/${projectId}/templates/${template.id}`)}
            onDelete={() => deleteTemplate.mutate(template.id)}
          />
        ))}
      </div>

      {templates?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Sin templates. Crea uno para empezar.</p>
          <button onClick={handleCreate} className="text-primary text-sm hover:underline">
            Crear primer template
          </button>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template, onEdit, onDelete }: {
  template: ContentTemplate
  onEdit: () => void
  onDelete: () => void
}) {
  const fieldCount = template.structure?.fields?.length ?? 0
  const checklistCount = template.structure?.checklist?.length ?? 0

  return (
    <div className="group rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
            {template.is_default && (
              <Star className="h-3.5 w-3.5 flex-none text-amber-400 fill-amber-400" />
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
            aria-label="Eliminar template"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{fieldCount} {fieldCount === 1 ? 'sección' : 'secciones'}</span>
        <span>{checklistCount} {checklistCount === 1 ? 'paso' : 'pasos'} en checklist</span>
      </div>

      <div className="text-xs text-muted-foreground">
        Tipo: <span className="text-foreground">{template.structure?.default_content_type ?? 'video'}</span>
      </div>

      <button
        onClick={onEdit}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:border-primary/50 transition-colors"
      >
        <Pencil className="h-3 w-3" />
        Editar template
      </button>
    </div>
  )
}
