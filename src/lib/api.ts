import axios from 'axios'
import { toAppError } from '@/lib/error'

export type ApiResponse<T = unknown> = {
  status: 'success' | 'error' | 'warning'
  code: number
  message: string
  data?: T
  error?: unknown
}

type AuthTokens = {
  access_token: string
  refresh_token: string
}

export type DataListResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  total_page: number
}

export type DataEntity =
  | 'users'
  | 'packages'
  | 'invitation-templates'
  | 'package-template-access'
  | 'orders'
  | 'order-items'
  | 'payments'
  | 'user-template-licenses'
  | 'invitations'
  | 'invitation-slugs'
  | 'invitation-contents'
  | 'invitation-media'
  | 'invitation-guests'
  | 'invitation-drafts'
  | 'invitation-feature-grants'
  | 'invitation-visits'
  | 'invitation-rsvps'
  | 'invitation-greetings'
  | 'invitation-analytics-daily'

const ACCESS_TOKEN_KEY = 'rekavia_access_token'
const REFRESH_TOKEN_KEY = 'rekavia_refresh_token'
const SESSION_EXPIRED_KEY = 'rekavia_session_expired'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export function resolveApiAssetUrl(path: string | null | undefined): string {
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return new URL(path, API_BASE_URL).toString()
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

    if (
      status === 401 &&
      currentPath !== '/masuk' &&
      currentPath !== '/daftar'
    ) {
      clearAuthTokens()
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
        window.location.replace('/masuk?reason=session-expired')
      }
    }

    return Promise.reject(toAppError(error))
  },
)

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function getAccountIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token)
  const sub = payload?.sub
  return typeof sub === 'string' ? sub : null
}

export function setAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function markSessionExpired(): void {
  sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
}

export function consumeSessionExpired(): boolean {
  const hasExpired = sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1'
  if (hasExpired) {
    sessionStorage.removeItem(SESSION_EXPIRED_KEY)
  }
  return hasExpired
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export async function authRegister(payload: {
  name: string
  email: string
  password: string
  username?: string
  address?: string
  phone_number?: string
}): Promise<ApiResponse> {
  const { data } = await api.post<ApiResponse>('/auth/register', payload)
  return data
}

export async function authLogin(payload: {
  identifier: string
  password: string
}): Promise<ApiResponse<AuthTokens>> {
  const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', payload)
  return data
}

export async function authMe(): Promise<ApiResponse<{ accountId: string; role: string; data: any }>> {
  const { data } = await api.get<ApiResponse<{ accountId: string; role: string; data: any }>>('/auth/me')
  return data
}

export async function authRefresh(payload: {
  accountId: string
  refresh_token: string
}): Promise<ApiResponse<AuthTokens>> {
  const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', payload)
  return data
}

export async function authLogout(): Promise<ApiResponse> {
  const { data } = await api.post<ApiResponse>('/auth/logout')
  return data
}

export async function dataList<T>(
  entity: DataEntity,
  query?: {
    page?: number
    limit?: number
    includeDeleted?: boolean
    where?: Record<string, unknown>
    orderBy?: Record<string, unknown>
  },
): Promise<ApiResponse<DataListResult<T>>> {
  const params: Record<string, unknown> = {}

  if (query?.page) params.page = query.page
  if (query?.limit) params.limit = query.limit
  if (query?.includeDeleted !== undefined) params.includeDeleted = query.includeDeleted
  if (query?.where) params.where = JSON.stringify(query.where)
  if (query?.orderBy) params.orderBy = JSON.stringify(query.orderBy)

  const { data } = await api.get<ApiResponse<DataListResult<T>>>(`/data/${entity}`, { params })
  return data
}

export async function dataDetail<T>(entity: DataEntity, id: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/data/${entity}/${id}`)
  return data
}

export async function dataCreate<T>(entity: DataEntity, payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/data/${entity}`, payload)
  return data
}

export async function dataUpdate<T>(
  entity: DataEntity,
  id: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/data/${entity}/${id}`, payload)
  return data
}

export async function dataRemove(entity: DataEntity, id: string): Promise<ApiResponse> {
  const { data } = await api.delete<ApiResponse>(`/data/${entity}/${id}`)
  return data
}

export async function cmsHome<T>(): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>('/cms/home')
  return data
}

export async function sapatamuCreateDraft<T>(payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>('/sapatamu/drafts', payload)
  return data
}

export async function sapatamuGetDraft<T>(draftId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/drafts/${draftId}`)
  return data
}

export async function sapatamuUpdateDraft<T>(
  draftId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/drafts/${draftId}`, payload)
  return data
}

export async function sapatamuDeleteDraft(draftId: string): Promise<ApiResponse> {
  const { data } = await api.delete<ApiResponse>(`/sapatamu/drafts/${draftId}`)
  return data
}

export async function sapatamuFinalizeDraft<T>(draftId: string): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/drafts/${draftId}/finalize`)
  return data
}

export async function sapatamuGetActivationOffers<T>(invitationId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/${invitationId}/activation-offers`)
  return data
}

export async function sapatamuUpsertCart<T>(
  invitationId: string,
  payload: { packageId: string; kind?: string },
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/cart`, payload)
  return data
}

export async function sapatamuGetCart<T>(invitationId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/${invitationId}/cart`)
  return data
}

export async function sapatamuApplyVoucher<T>(
  invitationId: string,
  code: string,
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/checkout/apply-voucher`, { code })
  return data
}

export async function sapatamuCreatePayment<T>(
  invitationId: string,
  method: string,
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/checkout/create-payment`, { method })
  return data
}

export async function sapatamuGetWorkspace<T>(invitationId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/${invitationId}/workspace`)
  return data
}

export async function sapatamuGetEditor<T>(invitationId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/${invitationId}/editor`)
  return data
}

export async function sapatamuPatchEditorDocument<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/document`, payload)
  return data
}

export async function sapatamuReorderEditorPages<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/pages/reorder`, payload)
  return data
}

export async function sapatamuToggleEditorPage<T>(
  invitationId: string,
  uniqueId: number,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/pages/${uniqueId}/toggle`, payload)
  return data
}

export async function sapatamuAddEditorPage<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/pages`, payload)
  return data
}

export async function sapatamuRemoveEditorPage<T>(
  invitationId: string,
  uniqueId: number,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/pages/${uniqueId}`, {
    data: payload,
  })
  return data
}

export async function sapatamuUploadEditorMedia<T>(
  invitationId: string,
  file: File,
): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/editor/media/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function sapatamuUpdateSend<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/send`, payload)
  return data
}

export async function sapatamuUpdateProfiles<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/profiles`, payload)
  return data
}

export async function sapatamuUpdateEvents<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/events`, payload)
  return data
}

export async function sapatamuUpdateSettings<T>(
  invitationId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/settings`, payload)
  return data
}

export async function sapatamuGetHistory<T>(invitationId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/sapatamu/${invitationId}/history`)
  return data
}

export async function sapatamuModerateMessage<T>(
  invitationId: string,
  messageId: string,
  isApproved: boolean,
): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(`/sapatamu/${invitationId}/messages/${messageId}`, {
    isApproved,
  })
  return data
}

export async function sapatamuDeleteInvitation(invitationId: string): Promise<ApiResponse> {
  const { data } = await api.delete<ApiResponse>(`/sapatamu/${invitationId}`)
  return data
}

export async function sapatamuUploadAlbumImage<T>(
  invitationId: string,
  file: File,
): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/album/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function sapatamuDeleteAlbumImage<T>(
  invitationId: string,
  mediaId: string,
): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(`/sapatamu/${invitationId}/album/${mediaId}`)
  return data
}

export async function sapatamuCheckoutAlbumQuota<T>(
  invitationId: string,
  packageId: string,
): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/sapatamu/${invitationId}/album/quota-checkout`, {
    packageId,
  })
  return data
}

export async function paymentDetail<T>(orderId: string): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(`/payments/${orderId}`)
  return data
}

export async function paymentMockComplete<T>(orderId: string): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(`/payments/${orderId}/mock-complete`)
  return data
}
