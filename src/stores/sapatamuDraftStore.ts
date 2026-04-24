import { create } from 'zustand'
import {
  sapatamuCreateDraft,
  sapatamuDeleteDraft,
  sapatamuFinalizeDraft,
  sapatamuGetDraft,
  sapatamuUpdateDraft,
} from '@/lib/api'
import { AppError, getPublicErrorMessage } from '@/lib/error'
import { createDefaultDraftState } from '@/lib/sapatamu'
import type { DraftWizardState, SapatamuDraftPayload } from '@/types/sapatamu'

interface SapatamuDraftStore {
  draftId: string | null
  draft: DraftWizardState
  status: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  createDraft: (payload?: Partial<DraftWizardState>) => Promise<string>
  loadDraft: (draftId: string) => Promise<void>
  patchLocal: (patch: Partial<DraftWizardState>) => void
  setProfiles: (profiles: DraftWizardState['profiles']) => void
  setEvents: (events: DraftWizardState['events']) => void
  persistDraft: (patch?: Partial<DraftWizardState>) => Promise<void>
  deleteDraft: () => Promise<void>
  finalizeDraft: () => Promise<{ invitationId: string; nextPath: string }>
  reset: () => void
}

function mapDraftPayload(payload: SapatamuDraftPayload) {
  return {
    draftId: payload.id,
    draft: payload.wizard,
    status: payload.status,
  }
}

export const useSapatamuDraftStore = create<SapatamuDraftStore>((set, get) => ({
  draftId: null,
  draft: createDefaultDraftState(),
  status: null,
  isLoading: false,
  isSaving: false,
  error: null,
  createDraft: async (payload) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sapatamuCreateDraft<SapatamuDraftPayload>(payload ?? {})
      const data = response.data
      if (!data) throw new AppError('Draft undangan belum bisa dibuat.')

      set({
        ...mapDraftPayload(data),
        isLoading: false,
        error: null,
      })

      return data.id
    } catch (error) {
      const message = getPublicErrorMessage(error, 'Draft undangan belum bisa dibuat.')
      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },
  loadDraft: async (draftId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sapatamuGetDraft<SapatamuDraftPayload>(draftId)
      const data = response.data
      if (!data) throw new AppError('Draft undangan tidak ditemukan.')

      set({
        ...mapDraftPayload(data),
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        draftId: null,
        draft: createDefaultDraftState(),
        status: null,
        isLoading: false,
        error: getPublicErrorMessage(error, 'Draft undangan belum bisa dimuat.'),
      })
      throw error
    }
  },
  patchLocal: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch,
      },
    })),
  setProfiles: (profiles) =>
    set((state) => ({
      draft: {
        ...state.draft,
        profiles,
      },
    })),
  setEvents: (events) =>
    set((state) => ({
      draft: {
        ...state.draft,
        events,
      },
    })),
  persistDraft: async (patch) => {
    const state = get()
    const draftId = state.draftId
    const nextDraft = {
      ...state.draft,
      ...patch,
    }

    if (!draftId) {
      throw new AppError('Draft undangan belum tersedia.')
    }

    set({ isSaving: true, error: null, draft: nextDraft })

    try {
      const response = await sapatamuUpdateDraft<SapatamuDraftPayload>(draftId, nextDraft)
      const data = response.data
      if (!data) throw new AppError('Draft undangan belum bisa disimpan.')

      set({
        ...mapDraftPayload(data),
        isSaving: false,
        error: null,
      })
    } catch (error) {
      const message = getPublicErrorMessage(error, 'Draft undangan belum bisa disimpan.')
      set({ isSaving: false, error: message })
      throw error
    }
  },
  deleteDraft: async () => {
    const draftId = get().draftId
    if (!draftId) {
      throw new AppError('Draft undangan belum tersedia.')
    }

    set({ isSaving: true, error: null })

    try {
      await sapatamuDeleteDraft(draftId)
      set({
        draftId: null,
        draft: createDefaultDraftState(),
        status: null,
        isSaving: false,
        error: null,
      })
    } catch (error) {
      const message = getPublicErrorMessage(error, 'Draft undangan belum bisa dihapus.')
      set({ isSaving: false, error: message })
      throw error
    }
  },
  finalizeDraft: async () => {
    const draftId = get().draftId
    if (!draftId) {
      throw new AppError('Draft undangan belum tersedia.')
    }

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuFinalizeDraft<{ invitationId: string; nextPath: string }>(draftId)
      const data = response.data
      if (!data) throw new AppError('Undangan belum bisa dibuat.')
      set({ isSaving: false, error: null })
      return data
    } catch (error) {
      const message = getPublicErrorMessage(error, 'Undangan belum bisa dibuat.')
      set({ isSaving: false, error: message })
      throw error
    }
  },
  reset: () =>
    set({
      draftId: null,
      draft: createDefaultDraftState(),
      status: null,
      isLoading: false,
      isSaving: false,
      error: null,
    }),
}))
