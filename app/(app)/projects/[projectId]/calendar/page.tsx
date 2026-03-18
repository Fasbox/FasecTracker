'use client'

import { use, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useItemsByProject } from '@/features/items/useItems'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { ContentItemWithRelations } from '@/types/app.types'
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

export default function CalendarPage({ params }: Props) {
  const { projectId } = use(params)
  const { data: items, isLoading } = useItemsByProject(projectId)
  const router = useRouter()

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="h-[calc(100vh-8rem)] min-h-[500px]">
        <Calendar
          localizer={localizer}
          events={events}
          culture="es"
          defaultView="month"
          views={['month', 'week']}
          onSelectEvent={(event) => router.push(`/items/${event.id}`)}
          eventPropGetter={(event) => {
            const item = event.resource as ContentItemWithRelations
            return {
              style: {
                backgroundColor: getStatusColor(item.status),
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                padding: '1px 4px',
              },
            }
          }}
          messages={{
            today: 'Hoy',
            previous: '‹',
            next: '›',
            month: 'Mes',
            week: 'Semana',
            noEventsInRange: 'Sin piezas en este rango',
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
