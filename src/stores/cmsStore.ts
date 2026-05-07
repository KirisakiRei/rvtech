import { create } from 'zustand'
import type { WeddingDetail, WeddingGallery, WeddingThemeId } from '@/types/wedding'
import { dataCreate, dataList, dataUpdate } from '@/lib/api'
import { AppError, getPublicErrorMessage } from '@/lib/error'

type InvitationContentRow = {
  id: string
  invitation_id: string
  version: number
  content_json: any
  is_current: boolean
}

type InvitationMediaRow = {
  id: string
  invitation_id: string
  media_type: 'image' | 'audio' | 'video'
  url: string
  sort_order: number
}

interface CmsState {
  currentStep: number
  selectedTheme: WeddingThemeId
  weddingData: Partial<WeddingDetail>
  galleries: WeddingGallery[]
  invitationId: string | null
  contentId: string | null
  currentVersion: number
  isLoading: boolean
  error: string | null
  setStep: (step: number) => void
  setTheme: (theme: WeddingThemeId) => void
  hydrateInvitation: (invitationId: string) => Promise<void>
  saveInvitation: () => Promise<void>
  updateWeddingData: (data: Partial<WeddingDetail>) => void
  addGalleryImage: (image: WeddingGallery) => void
  removeGalleryImage: (id: string) => void
  reorderGallery: (galleries: WeddingGallery[]) => void
  reset: () => void
}

const DEFAULT_WEDDING_DATA: Partial<WeddingDetail> = {
  brideName: '',
  groomName: '',
  brideParents: '',
  groomParents: '',
  akadTime: '',
  akadLocation: '',
  resepsiTime: '',
  resepsiLocation: '',
  loveStory: '',
  bankAccountInfo: [],
}

export const useCmsStore = create<CmsState>((set) => ({
  currentStep: 0,
  selectedTheme: 'malay-ethnic-red-ruby',
  weddingData: DEFAULT_WEDDING_DATA,
  galleries: [],
  invitationId: null,
  contentId: null,
  currentVersion: 0,
  isLoading: false,
  error: null,

  setStep: (step) => set({ currentStep: step }),
  setTheme: (theme) => set({ selectedTheme: theme }),
  hydrateInvitation: async (invitationId: string) => {
    set({ isLoading: true, error: null })

    try {
      const [contentRes, mediaRes] = await Promise.all([
        dataList<InvitationContentRow>('invitation-contents', {
          where: { invitation_id: invitationId, is_current: true },
          orderBy: { version: 'desc' },
          limit: 1,
        }),
        dataList<InvitationMediaRow>('invitation-media', {
          where: { invitation_id: invitationId, media_type: 'image' },
          orderBy: { sort_order: 'asc' },
          limit: 100,
        }),
      ])

      const content = contentRes.data?.items?.[0]
      const contentJson = content?.content_json ?? {}

      const selectedTheme =
        typeof contentJson?.selectedTheme === 'string' ? (contentJson.selectedTheme as WeddingThemeId) : 'malay-ethnic-red-ruby'

      const storedWeddingData =
        contentJson?.weddingData && typeof contentJson.weddingData === 'object'
          ? contentJson.weddingData
          : {}

      const mergedWeddingData: Partial<WeddingDetail> = {
        ...DEFAULT_WEDDING_DATA,
        ...storedWeddingData,
      }

      const galleries = (mediaRes.data?.items ?? []).map((media, index) => ({
        id: media.id,
        tenantId: invitationId,
        imageUrl: media.url,
        sortOrder: typeof media.sort_order === 'number' ? media.sort_order : index,
      }))

      set({
        invitationId,
        contentId: content?.id ?? null,
        currentVersion: content?.version ?? 0,
        selectedTheme,
        weddingData: mergedWeddingData,
        galleries,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        invitationId,
        contentId: null,
        currentVersion: 0,
        selectedTheme: 'malay-ethnic-red-ruby',
        weddingData: DEFAULT_WEDDING_DATA,
        galleries: [],
        isLoading: false,
        error: getPublicErrorMessage(error, 'Konten undangan belum bisa dimuat.'),
      })
    }
  },
  saveInvitation: async () => {
    const state = useCmsStore.getState()
    if (!state.invitationId) {
      throw new AppError('Undangan belum siap disimpan.')
    }

    const contentPayload = {
      selectedTheme: state.selectedTheme,
      weddingData: state.weddingData,
    }

    try {
      if (state.contentId) {
        const created = await dataCreate<InvitationContentRow>('invitation-contents', {
          invitation_id: state.invitationId,
          version: (state.currentVersion || 0) + 1,
          content_json: contentPayload,
          is_current: true,
        })

        await dataUpdate('invitation-contents', state.contentId, {
          is_current: false,
        })

        if (created.data?.id) {
          set({
            contentId: created.data.id,
            currentVersion: created.data.version,
          })
        }
      } else {
        const created = await dataCreate<InvitationContentRow>('invitation-contents', {
          invitation_id: state.invitationId,
          version: 1,
          content_json: contentPayload,
          is_current: true,
        })

        if (created.data?.id) {
          set({ contentId: created.data.id, currentVersion: created.data.version })
        }
      }

      await dataUpdate('invitations', state.invitationId, {
        bride_name: state.weddingData.brideName ?? null,
        groom_name: state.weddingData.groomName ?? null,
        event_date: state.weddingData.akadTime ? new Date(state.weddingData.akadTime).toISOString() : null,
      })

      set({ error: null })
    } catch (error) {
      const message = getPublicErrorMessage(error, 'Perubahan undangan belum berhasil disimpan.')
      set({ error: message })
      throw new AppError(message)
    }
  },
  updateWeddingData: (data) =>
    set((state) => ({
      weddingData: { ...state.weddingData, ...data },
    })),
  addGalleryImage: (image) =>
    set((state) => ({
      galleries: [...state.galleries, image],
    })),
  removeGalleryImage: (id) =>
    set((state) => ({
      galleries: state.galleries.filter((g) => g.id !== id),
    })),
  reorderGallery: (galleries) => set({ galleries }),
  reset: () =>
    set({
      currentStep: 0,
      selectedTheme: 'malay-ethnic-red-ruby',
      weddingData: DEFAULT_WEDDING_DATA,
      galleries: [],
      invitationId: null,
      contentId: null,
      currentVersion: 0,
      isLoading: false,
      error: null,
    }),
}))
