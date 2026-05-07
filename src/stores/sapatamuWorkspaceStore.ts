import { create } from 'zustand'
import {
  sapatamuCheckoutAlbumQuota,
  sapatamuDeleteAlbumImage,
  sapatamuDeleteInvitation,
  sapatamuGetHistory,
  sapatamuGetWorkspace,
  sapatamuModerateMessage,
  sapatamuUpdateEvents,
  sapatamuUpdateProfiles,
  sapatamuUpdateSend,
  sapatamuUpdateSettings,
  sapatamuUploadAlbumImage,
} from '@/lib/api'
import { AppError, getPublicErrorMessage } from '@/lib/error'
import { validateSapatamuAlbumFile } from '@/lib/upload'
import type {
  SapatamuEvent,
  SapatamuGiftAccount,
  SapatamuProfile,
  SapatamuWorkspace,
  WorkspaceGuest,
  WorkspaceHistoryItem,
} from '@/types/sapatamu'

interface SapatamuWorkspaceStore {
  workspace: SapatamuWorkspace | null
  history: WorkspaceHistoryItem[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  loadWorkspace: (invitationId: string) => Promise<void>
  loadHistory: (invitationId: string) => Promise<void>
  setGuests: (guests: WorkspaceGuest[]) => void
  setPrefaceTemplate: (value: string) => void
  updateProfiles: (invitationId: string, profiles: SapatamuProfile[]) => Promise<void>
  updateEvents: (invitationId: string, events: SapatamuEvent[]) => Promise<void>
  saveSend: (invitationId: string) => Promise<void>
  saveSettings: (
    invitationId: string,
    payload: {
      slugCandidate?: string
      metaTitleTemplate?: string
      metaDescription?: string
      metaImageUrl?: string
      musicMode?: 'none' | 'library' | 'youtube'
      musicValue?: string
      extraYoutube?: string
      giftAccounts?: SapatamuGiftAccount[]
      giftAddress?: string
    },
  ) => Promise<void>
  uploadAlbumImage: (invitationId: string, file: File) => Promise<void>
  deleteAlbumImage: (invitationId: string, mediaId: string) => Promise<void>
  checkoutAlbumQuota: (invitationId: string, packageId: string) => Promise<void>
  moderateMessage: (invitationId: string, messageId: string, isApproved: boolean) => Promise<void>
  deleteInvitation: (invitationId: string) => Promise<void>
}

function setWorkspaceSafe(
  set: (partial: Partial<SapatamuWorkspaceStore>) => void,
  workspace: SapatamuWorkspace | null,
) {
  set({ workspace, isSaving: false, isLoading: false, error: null })
}

export const useSapatamuWorkspaceStore = create<SapatamuWorkspaceStore>((set, get) => ({
  workspace: null,
  history: [],
  isLoading: false,
  isSaving: false,
  error: null,
  loadWorkspace: async (invitationId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sapatamuGetWorkspace<SapatamuWorkspace>(invitationId)
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        workspace: null,
        isLoading: false,
        error: getPublicErrorMessage(error, 'Workspace SapaTamu belum bisa dimuat.'),
      })
      throw error
    }
  },
  loadHistory: async (invitationId) => {
    try {
      const response = await sapatamuGetHistory<{ history: WorkspaceHistoryItem[] }>(invitationId)
      set({
        history: response.data?.history ?? [],
      })
    } catch {
      set({ history: [] })
    }
  },
  setGuests: (guests) =>
    set((state) => ({
      workspace: state.workspace
        ? {
            ...state.workspace,
            send: {
              ...state.workspace.send,
              guests,
            },
          }
        : null,
    })),
  setPrefaceTemplate: (value) =>
    set((state) => ({
      workspace: state.workspace
        ? {
            ...state.workspace,
            send: {
              ...state.workspace.send,
              prefaceTemplate: value,
            },
          }
        : null,
    })),
  updateProfiles: async (invitationId, profiles) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUpdateProfiles<SapatamuWorkspace>(invitationId, { profiles })
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Profil mempelai belum bisa diperbarui.'),
      })
      throw error
    }
  },
  updateEvents: async (invitationId, events) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUpdateEvents<SapatamuWorkspace>(invitationId, { events })
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Detail acara belum bisa diperbarui.'),
      })
      throw error
    }
  },
  saveSend: async (invitationId) => {
    const workspace = get().workspace
    if (!workspace) throw new AppError('Workspace SapaTamu belum tersedia.')

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUpdateSend<SapatamuWorkspace>(invitationId, {
        prefaceTemplate: workspace.send.prefaceTemplate,
        guests: workspace.send.guests,
      })
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Pengaturan kirim undangan belum bisa disimpan.'),
      })
      throw error
    }
  },
  saveSettings: async (invitationId, payload) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUpdateSettings<SapatamuWorkspace>(invitationId, payload)
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Pengaturan undangan belum bisa disimpan.'),
      })
      throw error
    }
  },
  uploadAlbumImage: async (invitationId, file) => {
    try {
      validateSapatamuAlbumFile(file)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Foto belum bisa diunggah.'),
      })
      throw error
    }

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUploadAlbumImage<SapatamuWorkspace>(invitationId, file)
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Foto belum bisa diunggah.'),
      })
      throw error
    }
  },
  deleteAlbumImage: async (invitationId, mediaId) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuDeleteAlbumImage<SapatamuWorkspace>(invitationId, mediaId)
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Foto belum bisa dihapus.'),
      })
      throw error
    }
  },
  checkoutAlbumQuota: async (invitationId, packageId) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuCheckoutAlbumQuota<SapatamuWorkspace>(invitationId, packageId)
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Kuota foto belum bisa ditambahkan.'),
      })
      throw error
    }
  },
  moderateMessage: async (invitationId, messageId, isApproved) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuModerateMessage<SapatamuWorkspace>(
        invitationId,
        messageId,
        isApproved,
      )
      setWorkspaceSafe(set, response.data ?? null)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Moderasi pesan belum bisa diperbarui.'),
      })
      throw error
    }
  },
  deleteInvitation: async (invitationId) => {
    set({ isSaving: true, error: null })

    try {
      await sapatamuDeleteInvitation(invitationId)
      set({
        workspace: null,
        history: [],
        isSaving: false,
        error: null,
      })
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Undangan belum bisa dihapus.'),
      })
      throw error
    }
  },
}))
