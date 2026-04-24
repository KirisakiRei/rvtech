import type {
  SapatamuEditorDocumentV3,
  SapatamuEditorElement,
  SapatamuEditorFontCatalogItem,
  SapatamuEditorPage,
} from '@/types/sapatamu'

export const EDITOR_ANIMATION_CLASS_MAP: Record<number, string> = {
  5: 'editor-animate-rise-up',
  6: 'editor-animate-rise-left',
  7: 'editor-animate-rise-right',
  8: 'editor-animate-rise-down',
  9: 'editor-animate-zoom-in',
  10: 'editor-animate-zoom-out',
  11: 'editor-animate-rotate-left',
  12: 'editor-animate-rotate-right',
  13: 'editor-animate-flicker',
  14: 'editor-animate-pulse2',
  15: 'editor-animate-succession',
  16: 'editor-animate-pop',
  17: 'editor-animate-wiggle',
}

export function ensureEditorFonts(fonts: SapatamuEditorFontCatalogItem[] | undefined) {
  if (typeof document === 'undefined' || !fonts?.length) return

  fonts.forEach((font) => {
    const existingLink = document.head.querySelector<HTMLLinkElement>(
      `link[data-editor-font="${font.name}"]`,
    )
    const existingStyle = document.head.querySelector<HTMLStyleElement>(
      `style[data-editor-font="${font.name}"]`,
    )

    if (existingLink || existingStyle) return

    if (font.fontUrl.includes('css')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = font.fontUrl
      link.setAttribute('data-editor-font', font.name)
      document.head.appendChild(link)
      return
    }

    const style = document.createElement('style')
    style.setAttribute('data-editor-font', font.name)
    style.appendChild(
      document.createTextNode(`
        @font-face {
          font-family: "${font.name}";
          font-weight: normal;
          font-style: normal;
          font-display: auto;
          src: url(${font.fontUrl}) format('woff');
        }
      `),
    )
    document.head.appendChild(style)
  })
}

export function findFontName(fonts: SapatamuEditorFontCatalogItem[] | undefined, fontId: string | undefined) {
  if (!fontId) return undefined
  return fonts?.find((font) => font.id === fontId)?.name
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function resolveEditorTokens(
  content: string,
  document: SapatamuEditorDocumentV3 | null,
  invitationLink: string,
) {
  if (!document) return content

  const dictionary: Record<string, string> = {
    link: invitationLink,
  }

  document.profiles.forEach((profile, index) => {
    dictionary[`full-name-${index + 1}`] = cleanString(profile.fullName) || `Mempelai ${index + 1}`
    dictionary[`nick-name-${index + 1}`] =
      cleanString(profile.nickName) || cleanString(profile.fullName) || `Mempelai ${index + 1}`
    dictionary[`desc-${index + 1}`] = cleanString(profile.description)
  })

  document.events.forEach((event, index) => {
    dictionary[`event-name-${index + 1}`] = cleanString(event.name) || `Acara ${index + 1}`
    dictionary[`event-date-${index + 1}`] = cleanString(event.date) || 'Tanggal belum ditentukan'
    dictionary[`time-start-${index + 1}`] = cleanString(event.timeStart) || '00:00'
    dictionary[`time-end-${index + 1}`] = cleanString(event.timeEnd) || '00:00'
    dictionary[`zone-time-${index + 1}`] = cleanString(event.timeZone) || 'WIB'
    dictionary[`event-location-${index + 1}`] = cleanString(event.address) || `Lokasi ${index + 1}`
  })

  return content.replace(/\{\{([^}]+)\}\}/g, (_, token) => dictionary[cleanString(token)] ?? '')
}

export function splitEditorParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function pageSlugFromParts(uniqueId: number, title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${uniqueId}-${slug || 'layout'}`
}

export function getElementTypeFromKey(page: SapatamuEditorPage | null, elementKey: string | null) {
  if (!page || !elementKey) return null
  const candidate = page.data[elementKey]
  if (!candidate || typeof candidate !== 'object') return null
  return (candidate as { type?: string }).type ?? null
}

export function getEditableElement(page: SapatamuEditorPage | null, elementKey: string | null) {
  if (!page || !elementKey) return null
  const candidate = page.data[elementKey]
  if (!candidate || typeof candidate !== 'object') return null
  return candidate as SapatamuEditorElement
}

export function listPageEditableKeys(page: SapatamuEditorPage | null) {
  if (!page) return []

  return Object.keys(page.data).filter((key) => {
    const candidate = page.data[key]
    return Boolean(candidate && typeof candidate === 'object' && 'type' in (candidate as Record<string, unknown>))
  })
}

export function getEditorAnimationClass(style: number | undefined) {
  if (!style) return ''
  return EDITOR_ANIMATION_CLASS_MAP[style] ?? ''
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
