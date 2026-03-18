import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// LexoRank simplificado para Kanban ordering
export function computeKanbanOrder(prev: number | null, next: number | null): number {
  if (prev === null && next === null) return 1000
  if (prev === null) return (next! - 1000) / 2
  if (next === null) return prev + 1000
  const mid = (prev + next) / 2
  // Si la diferencia es demasiado pequeña, devolvemos el medio igualmente
  // En la práctica habrá que rebalancear si diff < 0.001
  return mid
}

export function formatDate(date: string | null, format = 'dd MMM yyyy'): string {
  if (!date) return '—'
  const { format: formatFn } = require('date-fns')
  const { es } = require('date-fns/locale')
  return formatFn(new Date(date), format, { locale: es })
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
