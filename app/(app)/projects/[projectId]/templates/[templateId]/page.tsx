'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTemplates, useUpdateTemplate } from '@/features/templates/useTemplates'
import {
  ArrowLeft, Plus, Trash2, GripVertical, Loader2,
  CheckSquare, AlignLeft, Star
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CONTENT_TYPE_LABELS } from '@/types/app.types'
import type { ContentType, TemplateStructure, TemplateField, TemplateChecklistItem } from '@/types/app.types'
import { nanoid } from '@/lib/nanoid'

interface Props {
  params: Promise<{ projectId: string; templateId: string }>
}

export default function TemplateEditorPage({ params }: Props) {
  const { projectId, templateId } = use(params)
  const router = useRouter()
  const { data: templates, isLoading } = useTemplates(projectId)
  const updateTemplate = useUpdateTemplate(projectId)

  const template = templates?.find((t) => t.id === templateId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [defaultContentType, setDefaultContentType] = useState<ContentType>('video')
  const [fields, setFields] = useState<TemplateField[]>([])
  const [checklist, setChecklist] = useState<TemplateChecklistItem[]>([])
  const [isDefault, setIsDefault] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newChecklistLabel, setNewChecklistLabel] = useState('')

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description ?? '')
      setIsDefault(template.is_default)
      setDefaultContentType(template.structure?.default_content_type ?? 'video')
      setFields(template.structure?.fields ?? [])
      setChecklist(template.structure?.checklist ?? [])
    }
  }, [template])

  const handleSave = async () => {
    const structure: TemplateStructure = {
      sections: fields.map((f) => f.key),
      fields,
      checklist,
      default_content_type: defaultContentType,
    }
    await updateTemplate.mutateAsync({
      id: templateId,
      values: { name, description: description || null, is_default: isDefault, structure },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // --- Sections (fields) ---
  const addSection = () => {
    const newField: TemplateField = {
      key: `section_${nanoid(6)}`,
      label: 'Nueva sección',
      type: 'rich_text',
      required: false,
    }
    setFields((prev) => [...prev, newField])
  }

  const updateField = (index: number, patch: Partial<TemplateField>) => {
    setFields((prev) => prev.map((f, i) => i === index ? { ...f, ...patch } : f))
  }

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  const moveField = (from: number, to: number) => {
    setFields((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  // --- Checklist ---
  const addChecklistItem = () => {
    if (!newChecklistLabel.trim()) return
    setChecklist((prev) => [...prev, { id: nanoid(8), label: newChecklistLabel.trim(), required: false }])
    setNewChecklistLabel('')
  }

  const updateChecklistItem = (id: string, patch: Partial<TemplateChecklistItem>) => {
    setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c))
  }

  const removeChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id))
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Template no encontrado</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-none items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/templates`}
            className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Editar template</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={updateTemplate.isPending}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {updateTemplate.isPending ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-8 p-6">

          {/* Info básica */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Información del template
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre del template"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="¿Para qué tipo de contenido sirve?"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipo de contenido por defecto</label>
                  <select
                    value={defaultContentType}
                    onChange={(e) => setDefaultContentType(e.target.value as ContentType)}
                    className="w-full rounded-md border border-border bg-card px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Template predeterminado</label>
                  <button
                    type="button"
                    onClick={() => setIsDefault((v) => !v)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                      isDefault
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Star className={cn('h-4 w-4', isDefault && 'fill-amber-400')} />
                    {isDefault ? 'Predeterminado' : 'Marcar como predeterminado'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Secciones de escritura */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Secciones de escritura
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada sección se convierte en una pestaña con editor en la ficha de la pieza.
                </p>
              </div>
              <button
                onClick={addSection}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar sección
              </button>
            </div>

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                <AlignLeft className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Sin secciones. Agrega una para guiar la escritura.</p>
              </div>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="group flex items-start gap-2 rounded-lg border border-border bg-card p-3"
                >
                  {/* Drag indicator (visual) */}
                  <div className="mt-2 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveField(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      aria-label="Subir"
                      title="Subir"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, Math.min(fields.length - 1, index + 1))}
                      disabled={index === fields.length - 1}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      aria-label="Bajar"
                      title="Bajar"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="h-3.5 w-3.5 flex-none text-primary" />
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Nombre de la sección (ej. Hook inicial)"
                        className="flex-1 rounded border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Descripción/guía de la sección */}
                    <input
                      type="text"
                      value={(field as TemplateField & { description?: string }).description ?? ''}
                      onChange={(e) => updateField(index, { description: e.target.value } as Partial<TemplateField>)}
                      placeholder="Descripción o pregunta guía (ej. ¿Cómo vas a captar la atención en los primeros 5 segundos?)"
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    onClick={() => removeField(index)}
                    className="mt-1 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Eliminar sección"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Checklist de producción */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Checklist de producción
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ítems que aparecerán en cada pieza creada con este template.
              </p>
            </div>

            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div key={item.id} className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <CheckSquare className="h-3.5 w-3.5 flex-none text-muted-foreground" />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateChecklistItem(item.id, { label: e.target.value })}
                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                    placeholder="Paso de producción..."
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateChecklistItem(item.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    obligatorio
                  </label>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {checklist.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">Sin ítems en el checklist.</p>
              )}
            </div>

            {/* Agregar ítem */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistLabel}
                onChange={(e) => setNewChecklistLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                placeholder="Nuevo paso (ej. Grabar video, Editar, Subir thumbnail...)"
                className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={addChecklistItem}
                disabled={!newChecklistLabel.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Guardar al fondo también */}
          <div className="flex justify-end pb-4">
            <button
              onClick={handleSave}
              disabled={updateTemplate.isPending}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateTemplate.isPending ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
