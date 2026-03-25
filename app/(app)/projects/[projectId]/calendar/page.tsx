'use client'

import { use, useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Navigate } from 'react-big-calendar'
import type { ToolbarProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useItemsByProject } from '@/features/items/useItems'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import type { ContentItemWithRelations } from '@/types/app.types'
import { cn } from '@/lib/utils'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
})

interface Props {
  params: Promise<{ projectId: string }>
}

type CalendarEvent = { id: string; title: string; start: Date; end: Date; resource: ContentItemWithRelations }

// Toolbar personalizado — visible en dark mode y con navegación clara
function CustomToolbar({ date, onNavigate, onView, view }: ToolbarProps<CalendarEvent>) {
  const monthYear = format(date, 'MMMM yyyy', { locale: es })
  const monthYearCapitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      {/* Navegación mes */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="min-w-40 text-center text-sm font-semibold text-foreground">
          {monthYearCapitalized}
        </span>

        <button
          onClick={() => onNavigate(Navigate.NEXT)}
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Hoy + selector de vista */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(Navigate.TODAY)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Hoy
        </button>

        <div className="flex rounded-md border border-border overflow-hidden">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                view === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {v === 'month' ? 'Mes' : 'Semana'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage({ params }: Props) {
  const { projectId } = use(params)
  const { data: items, isLoading } = useItemsByProject(projectId)
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month')

  const events = useMemo(() => {
    if (!items) return []
    return items
      .filter((item) => item.published_at)
      .map((item) => ({
        id: item.id,
        title: item.title,
        start: new Date(item.published_at!),
        end: new Date(item.published_at!),
        resource: item,
      }))
  }, [items])

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <div className="flex-1 min-h-0 [&_.rbc-calendar]:h-full [&_.rbc-month-view]:rounded-lg [&_.rbc-month-view]:border [&_.rbc-month-view]:border-border [&_.rbc-month-header]:bg-card [&_.rbc-header]:border-border [&_.rbc-header]:text-muted-foreground [&_.rbc-header]:text-xs [&_.rbc-header]:py-2 [&_.rbc-day-bg]:border-border [&_.rbc-off-range-bg]:bg-muted/20 [&_.rbc-today]:bg-primary/5 [&_.rbc-date-cell]:text-muted-foreground [&_.rbc-date-cell]:text-xs [&_.rbc-date-cell]:py-1 [&_.rbc-row-content]:text-foreground [&_.rbc-show-more]:text-primary [&_.rbc-show-more]:text-xs [&_.rbc-toolbar]:hidden [&_.rbc-week-view]:rounded-lg [&_.rbc-week-view]:border [&_.rbc-week-view]:border-border [&_.rbc-time-view]:rounded-lg [&_.rbc-time-view]:border [&_.rbc-time-view]:border-border [&_.rbc-time-header]:bg-card [&_.rbc-time-content]:border-border [&_.rbc-timeslot-group]:border-border [&_.rbc-time-slot]:text-muted-foreground [&_.rbc-current-time-indicator]:bg-primary">
        <Calendar
          localizer={localizer}
          events={events}
          culture="es"
          view={currentView}
          date={currentDate}
          onNavigate={handleNavigate}
          onView={(v) => setCurrentView(v as 'month' | 'week')}
          views={['month', 'week']}
          onSelectEvent={(event) => router.push(`/items/${event.id}`)}
          components={{ toolbar: CustomToolbar }}
          eventPropGetter={(event) => {
            const item = event.resource as ContentItemWithRelations
            return {
              style: {
                backgroundColor: getStatusColor(item.status),
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                padding: '1px 6px',
                cursor: 'pointer',
              },
            }
          }}
          messages={{
            noEventsInRange: 'Sin piezas en este período',
            showMore: (count) => `+${count} más`,
            week: 'Semana',
            allDay: 'Todo el día',
          }}
        />
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idea:       '#64748b',
    script:     '#3b82f6',
    production: '#f59e0b',
    editing:    '#f97316',
    review:     '#a855f7',
    scheduled:  '#06b6d4',
    published:  '#22c55e',
  }
  return colors[status] ?? '#64748b'
}
