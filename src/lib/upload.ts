import { AppError } from '@/lib/error'

export const SAPATAMU_ALBUM_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const SAPATAMU_ALBUM_MAX_SIZE_BYTES = 5 * 1024 * 1024

export function formatUploadSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${bytes} B`
}

export function validateSapatamuAlbumFile(file: File): void {
  if (!SAPATAMU_ALBUM_ACCEPTED_TYPES.includes(file.type as (typeof SAPATAMU_ALBUM_ACCEPTED_TYPES)[number])) {
    throw new AppError('Gunakan file foto JPG, PNG, atau WEBP.')
  }

  if (file.size > SAPATAMU_ALBUM_MAX_SIZE_BYTES) {
    throw new AppError(`Ukuran file terlalu besar. Maksimal ${formatUploadSize(SAPATAMU_ALBUM_MAX_SIZE_BYTES)} per foto.`)
  }
}
