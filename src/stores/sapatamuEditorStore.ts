import { create } from 'zustand'
import {
  sapatamuAddEditorPage,
  sapatamuGetEditor,
  sapatamuPatchEditorDocument,
  sapatamuReorderEditorPages,
  sapatamuRemoveEditorPage,
  sapatamuToggleEditorPage,
  sapatamuUploadEditorMedia,
} from '@/lib/api'
import { getPublicErrorMessage } from '@/lib/error'
import type {
  SapatamuEditorDocumentV3,
  SapatamuEditorHydrationResponse,
  SapatamuEditorMediaItem,
  SapatamuEditorPage,
  SapatamuEditorPatchOperation,
} from '@/types/sapatamu'

type EditorCatalogState = SapatamuEditorHydrationResponse['catalog']
type EditorInvitationState = SapatamuEditorHydrationResponse['invitation']
type EditorSessionState = SapatamuEditorHydrationResponse['session']

interface SapatamuEditorStore {
  invitation: EditorInvitationState | null
  document: SapatamuEditorDocumentV3 | null
  catalog: EditorCatalogState | null
  session: EditorSessionState | null
  currentVersion: number
  pendingOperations: SapatamuEditorPatchOperation[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  lastSavedAt: string | null
  lightbox: {
    open: boolean
    index: number
  }
  hydrateEditor: (invitationId: string) => Promise<void>
  replaceFromResponse: (payload: SapatamuEditorHydrationResponse) => void
  queueOperation: (operation: SapatamuEditorPatchOperation) => void
  updateGlobalField: (path: string, value: unknown) => void
  updatePageField: (uniqueId: number, path: string, value: unknown) => void
  replacePage: (uniqueId: number, page: SapatamuEditorPage) => void
  flushPending: (invitationId: string) => Promise<void>
  reorderPages: (invitationId: string, orderedUniqueIds: number[]) => Promise<void>
  togglePage: (invitationId: string, uniqueId: number, isActive: boolean) => Promise<void>
  addPage: (invitationId: string, layoutCode: string, afterUniqueId?: number) => Promise<void>
  removePage: (invitationId: string, uniqueId: number) => Promise<void>
  uploadMedia: (invitationId: string, file: File) => Promise<void>
  setLightbox: (payload: Partial<{ open: boolean; index: number }>) => void
  clearError: () => void
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const segments = path.split('.').filter(Boolean)
  if (segments.length === 0) return

  let cursor: Record<string, unknown> = target
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    const current = cursor[segment]

    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      cursor[segment] = {}
    }

    cursor = cursor[segment] as Record<string, unknown>
  }

  cursor[segments[segments.length - 1]] = value
}

function normalizePageSlug(uniqueId: number, title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${uniqueId}-${slug || 'layout'}`
}

function applyLocalOperation(
  document: SapatamuEditorDocumentV3,
  operation: SapatamuEditorPatchOperation,
): SapatamuEditorDocumentV3 {
  const nextDocument = clone(document)

  switch (operation.type) {
    case 'set_global_field':
      setByPath(nextDocument as unknown as Record<string, unknown>, operation.path, operation.value)
      return nextDocument
    case 'set_page_field': {
      const page = nextDocument.editor.pages.find((item) => item.uniqueId === operation.uniqueId)
      if (!page) return nextDocument
      setByPath(page as unknown as Record<string, unknown>, operation.path, operation.value)
      page.slug = normalizePageSlug(page.uniqueId, page.title)
      return nextDocument
    }
    case 'replace_page': {
      nextDocument.editor.pages = nextDocument.editor.pages.map((item) =>
        item.uniqueId === operation.uniqueId
          ? {
              ...clone(operation.page),
              slug: normalizePageSlug(operation.page.uniqueId, operation.page.title),
            }
          : item,
      )
      return nextDocument
    }
    case 'reorder_pages': {
      const orderMap = new Map<number, number>()
      operation.orderedUniqueIds.forEach((uniqueId, index) => orderMap.set(uniqueId, index))
      nextDocument.editor.pages = [...nextDocument.editor.pages]
        .sort((left, right) => {
          const leftOrder = orderMap.get(left.uniqueId)
          const rightOrder = orderMap.get(right.uniqueId)
          if (leftOrder === undefined && rightOrder === undefined) return left.uniqueId - right.uniqueId
          if (leftOrder === undefined) return 1
          if (rightOrder === undefined) return -1
          return leftOrder - rightOrder
        })
        .map((page, index) => ({
          ...page,
          uniqueId: index + 1,
          slug: normalizePageSlug(index + 1, page.title),
        }))
      return nextDocument
    }
    case 'add_page': {
      const page = clone(operation.page)
      nextDocument.editor.pages.push(page)
      nextDocument.editor.pages = nextDocument.editor.pages.map((item, index) => ({
        ...item,
        uniqueId: index + 1,
        slug: normalizePageSlug(index + 1, item.title),
      }))
      return nextDocument
    }
    case 'remove_page':
      nextDocument.editor.pages = nextDocument.editor.pages
        .filter((item) => item.uniqueId !== operation.uniqueId)
        .map((item, index) => ({
          ...item,
          uniqueId: index + 1,
          slug: normalizePageSlug(index + 1, item.title),
        }))
      return nextDocument
  }
}

function setResponseState(
  set: (partial: Partial<SapatamuEditorStore> | ((state: SapatamuEditorStore) => Partial<SapatamuEditorStore>)) => void,
  payload: SapatamuEditorHydrationResponse,
) {
  set({
    invitation: payload.invitation,
    document: payload.document,
    catalog: payload.catalog,
    session: payload.session,
    currentVersion: payload.currentVersion,
    pendingOperations: [],
    isLoading: false,
    isSaving: false,
    error: null,
    lastSavedAt: new Date().toISOString(),
  })
}

export const useSapatamuEditorStore = create<SapatamuEditorStore>((set, get) => ({
  invitation: null,
  document: null,
  catalog: null,
  session: null,
  currentVersion: 0,
  pendingOperations: [],
  isLoading: false,
  isSaving: false,
  error: null,
  lastSavedAt: null,
  lightbox: {
    open: false,
    index: 0,
  },
  hydrateEditor: async (invitationId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await sapatamuGetEditor<SapatamuEditorHydrationResponse>(invitationId)
      if (!response.data) {
        throw new Error('Data editor kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      set({
        isLoading: false,
        error: getPublicErrorMessage(error, 'Editor invitation belum bisa dimuat.'),
      })
      throw error
    }
  },
  replaceFromResponse: (payload) => {
    setResponseState(set, payload)
  },
  queueOperation: (operation) =>
    set((state) => {
      if (!state.document) return {}

      return {
        document: applyLocalOperation(state.document, operation),
        pendingOperations: [...state.pendingOperations, operation],
      }
    }),
  updateGlobalField: (path, value) => {
    get().queueOperation({
      type: 'set_global_field',
      path,
      value,
    })
  },
  updatePageField: (uniqueId, path, value) => {
    get().queueOperation({
      type: 'set_page_field',
      uniqueId,
      path,
      value,
    })
  },
  replacePage: (uniqueId, page) => {
    get().queueOperation({
      type: 'replace_page',
      uniqueId,
      page,
    })
  },
  flushPending: async (invitationId) => {
    const { pendingOperations, currentVersion } = get()
    if (pendingOperations.length === 0) return

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuPatchEditorDocument<SapatamuEditorHydrationResponse>(invitationId, {
        baseVersion: currentVersion,
        operations: pendingOperations,
      })

      if (!response.data) {
        throw new Error('Response editor kosong setelah save.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Perubahan editor belum bisa disimpan.'),
      })
      throw error
    }
  },
  reorderPages: async (invitationId, orderedUniqueIds) => {
    const state = get()
    if (!state.document) return

    if (state.pendingOperations.length > 0) {
      await state.flushPending(invitationId)
    }

    const localOperation: SapatamuEditorPatchOperation = {
      type: 'reorder_pages',
      orderedUniqueIds,
    }

    set((currentState) => ({
      document: currentState.document ? applyLocalOperation(currentState.document, localOperation) : currentState.document,
      isSaving: true,
      error: null,
    }))

    try {
      const response = await sapatamuReorderEditorPages<SapatamuEditorHydrationResponse>(invitationId, {
        baseVersion: get().currentVersion,
        orderedUniqueIds,
      })
      if (!response.data) {
        throw new Error('Response reorder editor kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      await get().hydrateEditor(invitationId)
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Urutan layout belum bisa diperbarui.'),
      })
      throw error
    }
  },
  togglePage: async (invitationId, uniqueId, isActive) => {
    const state = get()
    if (state.pendingOperations.length > 0) {
      await state.flushPending(invitationId)
    }

    const localOperation: SapatamuEditorPatchOperation = {
      type: 'set_page_field',
      uniqueId,
      path: 'isActive',
      value: isActive,
    }

    set((currentState) => ({
      document: currentState.document ? applyLocalOperation(currentState.document, localOperation) : currentState.document,
      isSaving: true,
      error: null,
    }))

    try {
      const response = await sapatamuToggleEditorPage<SapatamuEditorHydrationResponse>(invitationId, uniqueId, {
        baseVersion: get().currentVersion,
        isActive,
      })
      if (!response.data) {
        throw new Error('Response toggle editor kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      await get().hydrateEditor(invitationId)
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Status layout belum bisa diubah.'),
      })
      throw error
    }
  },
  addPage: async (invitationId, layoutCode, afterUniqueId) => {
    const state = get()
    if (state.pendingOperations.length > 0) {
      await state.flushPending(invitationId)
    }

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuAddEditorPage<SapatamuEditorHydrationResponse>(invitationId, {
        baseVersion: get().currentVersion,
        layoutCode,
        afterUniqueId,
      })
      if (!response.data) {
        throw new Error('Response add layout kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Layout belum bisa ditambahkan.'),
      })
      throw error
    }
  },
  removePage: async (invitationId, uniqueId) => {
    const state = get()
    if (state.pendingOperations.length > 0) {
      await state.flushPending(invitationId)
    }

    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuRemoveEditorPage<SapatamuEditorHydrationResponse>(invitationId, uniqueId, {
        baseVersion: get().currentVersion,
      })
      if (!response.data) {
        throw new Error('Response remove layout kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Layout belum bisa dihapus.'),
      })
      throw error
    }
  },
  uploadMedia: async (invitationId, file) => {
    set({ isSaving: true, error: null })

    try {
      const response = await sapatamuUploadEditorMedia<SapatamuEditorHydrationResponse>(invitationId, file)
      if (!response.data) {
        throw new Error('Response upload media kosong.')
      }

      setResponseState(set, response.data)
    } catch (error) {
      set({
        isSaving: false,
        error: getPublicErrorMessage(error, 'Media editor belum bisa diunggah.'),
      })
      throw error
    }
  },
  setLightbox: (payload) =>
    set((state) => ({
      lightbox: {
        open: payload.open ?? state.lightbox.open,
        index: payload.index ?? state.lightbox.index,
      },
    })),
  clearError: () => set({ error: null }),
}))

export function findEditorPageBySlug(document: SapatamuEditorDocumentV3 | null, pageSlug: string | undefined) {
  if (!document) return null
  if (!pageSlug) return document.editor.pages[0] ?? null

  return (
    document.editor.pages.find((page) => page.slug === pageSlug) ??
    document.editor.pages.find((page) => `${page.uniqueId}` === pageSlug.split('-')[0]) ??
    document.editor.pages[0] ??
    null
  )
}

export function getEditorMediaByType(
  media: SapatamuEditorMediaItem[] | undefined,
  mediaType: 'image' | 'video',
) {
  return (media ?? []).filter((item) => item.mediaType === mediaType)
}

export function getEditorActivePageIndex(document: SapatamuEditorDocumentV3 | null, pageSlug: string | undefined) {
  if (!document) return 0
  const targetPage = findEditorPageBySlug(document, pageSlug)
  const pageIndex = document.editor.pages.findIndex((page) => page.slug === targetPage?.slug)
  return pageIndex >= 0 ? pageIndex : 0
}
