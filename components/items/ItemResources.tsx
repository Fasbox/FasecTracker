'use client'

import { useState } from 'react'
import { Link2, FileUp, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentResource } from '@/types/app.types'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { itemKeys } from '@/features/items/useItems'

const supabase = createClient()

interface ItemResourcesProps {
  itemId: string
  projectId: string
  resources: ContentResource[]
}

export function ItemResources({ itemId, projectId, resources }: ItemResourcesProps) {
  const [linkInput, setLinkInput] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const qc = useQueryClient()

  const refresh = () => {
    qc.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
  }

  const addLink = async () => {
    if (!linkInput) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('content_resources').insert({
      item_id: itemId,
      type: 'link',
      url: linkInput,
      label: linkLabel || null,
      created_by: user?.id,
    })
    setLinkInput('')
    setLinkLabel('')
    setAdding(false)
    refresh()
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar 10MB')
      return
    }
    setUploading(true)
    const path = `${itemId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('content-resources')
      .upload(path, file)

    if (!uploadError) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { publicUrl } } = supabase.storage
        .from('content-resources')
        .getPublicUrl(path)

      await supabase.from('content_resources').insert({
        item_id: itemId,
        type: 'file',
        url: publicUrl,
        label: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        created_by: user?.id,
      })
      refresh()
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeResource = async (id: string) => {
    await supabase.from('content_resources').delete().eq('id', id)
    refresh()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Recursos</h3>

      {/* Lista */}
      {resources.length > 0 && (
        <ul className="space-y-1.5">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
              {r.type === 'link' ? (
                <Link2 className="h-3.5 w-3.5 flex-none text-blue-400" />
              ) : (
                <FileUp className="h-3.5 w-3.5 flex-none text-amber-400" />
              )}
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-xs text-foreground hover:text-primary flex items-center gap-1"
              >
                {r.label || r.url}
                <ExternalLink className="h-3 w-3 flex-none" />
              </a>
              <button
                onClick={() => removeResource(r.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Eliminar recurso"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Agregar link */}
      <div className="space-y-1.5">
        <input
          type="text"
          placeholder="Etiqueta del link (opcional)"
          value={linkLabel}
          onChange={(e) => setLinkLabel(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
            className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={addLink}
            disabled={!linkInput || adding}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {adding ? '...' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Subir archivo */}
      <div>
        <label className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border',
          'px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors'
        )}>
          <FileUp className="h-3.5 w-3.5" />
          {uploading ? 'Subiendo...' : 'Subir archivo (máx. 10MB)'}
          <input type="file" className="sr-only" onChange={uploadFile} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}
