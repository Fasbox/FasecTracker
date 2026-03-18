import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  activeProjectId: string | null
  newItemOpen: boolean
  toggleSidebar: () => void
  setActiveProject: (id: string | null) => void
  openNewItem: () => void
  closeNewItem: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeProjectId: null,
      newItemOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      openNewItem: () => set({ newItemOpen: true }),
      closeNewItem: () => set({ newItemOpen: false }),
    }),
    {
      name: 'fasectracker-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
