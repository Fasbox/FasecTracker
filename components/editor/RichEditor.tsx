'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  content: object | null
  onChange?: (content: object) => void
  placeholder?: string
  editable?: boolean
  className?: string
  autosaveMs?: number
}

export function RichEditor({
  content,
  onChange,
  placeholder = 'Escribe aquí...',
  editable = true,
  className,
  autosaveMs = 1500,
}: RichEditorProps) {
  const debouncedOnChange = useCallback(
    debounce((content: object) => onChange?.(content), autosaveMs),
    [onChange, autosaveMs]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    editable,
    onUpdate: ({ editor }) => {
      debouncedOnChange(editor.getJSON())
    },
  })

  // Sync content desde fuera solo si cambia completamente (ej. cambio de tab/sección)
  useEffect(() => {
    if (!editor || !content) return
    const current = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(content)
    if (current !== incoming) {
      editor.commands.setContent(content)
    }
  }, [JSON.stringify(content)])

  if (!editor) return null

  return (
    <div className={cn('flex flex-col', className)}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none flex-1',
          'prose-headings:font-semibold prose-p:leading-relaxed',
          'focus-within:outline-none',
          '[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:p-3 [&_.ProseMirror]:focus:outline-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'
        )}
      />
    </div>
  )
}

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
