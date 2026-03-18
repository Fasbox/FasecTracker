import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as tagService from './tagService'
import { itemKeys } from '@/features/items/useItems'

export const tagKeys = {
  all: ['tags'] as const,
}

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: tagService.getTags,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      tagService.createTag(name, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: tagKeys.all }),
  })
}

export function useAddTagToItem(itemId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tagId: string) => tagService.addTagToItem(itemId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
      qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) })
    },
  })
}

export function useRemoveTagFromItem(itemId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tagId: string) => tagService.removeTagFromItem(itemId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
      qc.invalidateQueries({ queryKey: itemKeys.byProject(projectId) })
    },
  })
}
