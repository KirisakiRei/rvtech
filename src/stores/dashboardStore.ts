import { create } from 'zustand'
import { cmsHome } from '@/lib/api'
import { getPublicErrorMessage } from '@/lib/error'
import type { CmsHomeData } from '@/types/sapatamu'

interface DashboardStore {
  home: CmsHomeData | null
  isLoading: boolean
  error: string | null
  loadHome: () => Promise<void>
  setHome: (home: CmsHomeData | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  home: null,
  isLoading: false,
  error: null,
  loadHome: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await cmsHome<CmsHomeData>()
      set({
        home: response.data ?? null,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        home: null,
        isLoading: false,
        error: getPublicErrorMessage(error, 'Dashboard CMS belum bisa dimuat.'),
      })
    }
  },
  setHome: (home) => set({ home }),
}))
