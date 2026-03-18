import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as templateService from './templateService'
import type { TemplateFormValues } from '@/lib/validations/template.schema'

export const templateKeys = {
  byProject: (projectId: string) => ['templates', 'project', projectId] as const,
}

export function useTemplates(projectId: string) {
  return useQuery({
    queryKey: templateKeys.byProject(projectId),
    queryFn: () => templateService.getTemplatesByProject(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTemplate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: TemplateFormValues) => templateService.createTemplate(projectId, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.byProject(projectId) }),
  })
}

export function useUpdateTemplate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TemplateFormValues> }) =>
      templateService.updateTemplate(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.byProject(projectId) }),
  })
}

export function useDeleteTemplate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.byProject(projectId) }),
  })
}
