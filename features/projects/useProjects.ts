import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as projectService from './projectService'
import type { ProjectFormValues } from '@/lib/validations/project.schema'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectService.getProjects,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectService.createProject(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: Partial<ProjectFormValues>) => projectService.updateProject(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useAddMember(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => projectService.addMemberByEmail(projectId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  })
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => projectService.removeMember(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  })
}

export function useUpdateProjectNotes(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (notes: object) => projectService.updateProjectNotes(id, notes),
    // Actualización optimista — no invalida para evitar loop en el editor
    onSuccess: (updated) => {
      qc.setQueryData(projectKeys.detail(id), updated)
    },
  })
}
