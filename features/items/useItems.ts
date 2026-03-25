import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as itemService from './itemService'
import type { ContentStatus, ChecklistDataItem, FieldsData, ContentItemWithRelations } from '@/types/app.types'
import type { ContentItemFormValues } from '@/lib/validations/item.schema'

export const itemKeys = {
  byProject: (projectId: string) => ['items', 'project', projectId] as const,
  detail: (id: string) => ['items', id] as const,
}

export function useItemsByProject(projectId: string) {
  return useQuery({
    queryKey: itemKeys.byProject(projectId),
    queryFn: () => itemService.getItemsByProject(projectId),
    enabled: !!projectId,
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemService.getItem(id),
    enabled: !!id,
  })
}

export function useCreateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ values, templateId }: { values: ContentItemFormValues; templateId?: string }) =>
      itemService.createItem(projectId, values, templateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) }),
  })
}

export function useUpdateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ContentItemWithRelations> }) =>
      itemService.updateItem(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) })
      qc.invalidateQueries({ queryKey: itemKeys.detail(id) })
    },
  })
}

export function useUpdateItemStatus(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      newStatus,
      prevOrder,
      nextOrder,
    }: {
      id: string
      newStatus: ContentStatus
      prevOrder: number | null
      nextOrder: number | null
    }) => itemService.updateItemStatus(id, newStatus, prevOrder, nextOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) }),
  })
}

export function useUpdateItemFields(itemId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fieldsData: FieldsData) => itemService.updateItemFields(itemId, fieldsData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
      qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) })
    },
  })
}

export function useUpdateChecklist(itemId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ChecklistDataItem[]) => itemService.updateChecklist(itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
    },
  })
}

export function useDuplicateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemService.duplicateItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) }),
  })
}

export function useDeleteItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) }),
  })
}
