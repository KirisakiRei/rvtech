import axios, { type AxiosError } from 'axios'

type ApiErrorPayload = {
  status?: string
  code?: number
  message?: string
  error?: unknown
}

export class AppError extends Error {
  code?: number
  details?: unknown
  isNetworkError: boolean

  constructor(message: string, options?: { code?: number; details?: unknown; isNetworkError?: boolean }) {
    super(message)
    this.name = 'AppError'
    this.code = options?.code
    this.details = options?.details
    this.isNetworkError = options?.isNetworkError ?? false
  }
}

function pickFirstString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = pickFirstString(item)
      if (result) return result
    }
  }

  if (value && typeof value === 'object') {
    const maybeFieldErrors = value as Record<string, unknown>

    if (typeof maybeFieldErrors.message === 'string' && maybeFieldErrors.message.trim()) {
      return maybeFieldErrors.message.trim()
    }

    if (Array.isArray(maybeFieldErrors.errors)) {
      const result = pickFirstString(maybeFieldErrors.errors)
      if (result) return result
    }
  }

  return null
}

function toSafeMessage(payload?: ApiErrorPayload): string {
  const detailMessage = pickFirstString(payload?.error)
  if (detailMessage) return detailMessage

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message.trim()
  }

  return 'Permintaan tidak dapat diproses saat ini.'
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>
    const payload = axiosError.response?.data
    const statusCode = axiosError.response?.status

    if (!axiosError.response) {
      return new AppError('Koneksi ke server sedang bermasalah. Coba lagi beberapa saat.', {
        isNetworkError: true,
        details: axiosError.message,
      })
    }

    return new AppError(toSafeMessage(payload), {
      code: payload?.code ?? statusCode,
      details: payload?.error,
    })
  }

  if (error instanceof Error) {
    return new AppError(error.message)
  }

  return new AppError('Terjadi kendala. Silakan coba lagi.')
}

export function getPublicErrorMessage(error: unknown, fallback: string): string {
  const appError = toAppError(error)
  return appError.message || fallback
}
