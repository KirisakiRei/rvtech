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

export function getEditorDisplayContent(
  content: string,
  document: SapatamuEditorDocumentV3 | null,
  invitationLink: string,
  options: { resolveTokens?: boolean } = {},
) {
  const source = options.resolveTokens === false
    ? content
    : resolveEditorTokens(content, document, invitationLink)

  return stripEditorHtml(source)
}

export function isGoogleMapsShortUrl(url: string) {
  try {
    const parsed = new URL(url.trim())
    const hostname = parsed.hostname.toLowerCase()
    return hostname === 'maps.app.goo.gl' || (hostname === 'goo.gl' && parsed.pathname.startsWith('/maps'))
  } catch {
    return false
  }
}

export function getGoogleMapEmbedUrl(url: string) {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.includes('/embed') || trimmed.includes('output=embed')) return trimmed
  if (isGoogleMapsShortUrl(trimmed)) return ''

  const readUrl = () => {
    try {
      return new URL(trimmed)
    } catch {
      return null
    }
  }
  const parsedUrl = readUrl()
  const decodePathPart = (value: string) => decodeURIComponent(value.replace(/\+/g, ' '))

  if (trimmed.includes('google.com/maps') || trimmed.includes('google.co.id/maps')) {
    const bangCoordsMatch = trimmed.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    if (bangCoordsMatch) return `https://maps.google.com/maps?q=${bangCoordsMatch[1]},${bangCoordsMatch[2]}&output=embed`

    const atCoordsMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (atCoordsMatch) return `https://maps.google.com/maps?q=${atCoordsMatch[1]},${atCoordsMatch[2]}&output=embed`

    const q = parsedUrl?.searchParams.get('q') || parsedUrl?.searchParams.get('query')
    if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`

    const placeMatch = parsedUrl?.pathname.match(/\/maps\/place\/([^/]+)/)
    if (placeMatch?.[1]) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodePathPart(placeMatch[1]))}&output=embed`
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`
  }

  if (trimmed.startsWith('http')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`
  }
  if (trimmed) return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`
  return ''
}

export function stripEditorHtml(content: string) {
  const withLineBreaks = content
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*p(?:\s+[^>]*)?>/gi, '')
    .replace(/<\/?(div|section|article|h[1-6]|li)(?:\s+[^>]*)?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

  return withLineBreaks
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

export function getEditorPlainTextInputValue(content: string) {
  return content
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*p(?:\s+[^>]*)?>/gi, '')
    .replace(/<\/?(div|section|article|h[1-6]|li)(?:\s+[^>]*)?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n+$/g, '')
}

export function splitEditorParagraphs(content: string) {
  return stripEditorHtml(content)
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
  if (!page || !elementKey || isStructuralPageDataKey(elementKey)) return null
  const candidate = page.data[elementKey]
  if (!candidate || typeof candidate !== 'object') return null
  return (candidate as { type?: string }).type ?? null
}

export function getEditableElement(page: SapatamuEditorPage | null, elementKey: string | null) {
  if (!page || !elementKey || isStructuralPageDataKey(elementKey)) return null
  const candidate = page.data[elementKey]
  if (!candidate || typeof candidate !== 'object') return null
  return candidate as SapatamuEditorElement
}

const STRUCTURAL_PAGE_DATA_KEYS = new Set(['background', 'backgroundDetails', 'cornerElements'])

function isStructuralPageDataKey(key: string) {
  return STRUCTURAL_PAGE_DATA_KEYS.has(key)
}

export function listPageEditableKeys(page: SapatamuEditorPage | null) {
  if (!page) return []

  return Object.keys(page.data).filter((key) => {
    if (isStructuralPageDataKey(key)) return false
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

function cloneJson<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function mergeValueWithDefaults(defaultValue: unknown, currentValue: unknown): unknown {
  if (isRecord(defaultValue) && isRecord(currentValue)) {
    if (
      typeof defaultValue.type === 'string'
      && typeof currentValue.type === 'string'
      && defaultValue.type !== currentValue.type
    ) {
      return cloneJson(defaultValue)
    }

    const next = cloneJson(defaultValue)
    Object.entries(currentValue).forEach(([key, value]) => {
      next[key] = mergeValueWithDefaults(next[key], value)
    })
    return next
  }

  return cloneJson(currentValue)
}

export function mergePageDataWithDesignDefaults(
  currentData: SapatamuEditorPage['data'],
  defaultData?: Record<string, unknown>,
) {
  const normalizedDefaults = defaultData ?? {}
  const next = cloneJson(normalizedDefaults) as SapatamuEditorPage['data']

  Object.entries(currentData).forEach(([key, currentValue]) => {
    const defaultValue = normalizedDefaults[key]
    if (
      isRecord(defaultValue)
      && isRecord(currentValue)
      && typeof defaultValue.type === 'string'
      && typeof currentValue.type === 'string'
      && defaultValue.type === currentValue.type
    ) {
      next[key] = mergeValueWithDefaults(defaultValue, currentValue)
      return
    }

    if (defaultValue === undefined) {
      next[key] = cloneJson(currentValue)
    }
  })

  return next
}

type LayoutDefaultLike = {
  layoutCode: string
  family: string
  title: string
  defaultPageData: Record<string, unknown>
  sortOrder: number
  isActive?: boolean
}

export function reconcileEditorDocumentWithLayoutDefaults(
  document: SapatamuEditorDocumentV3,
  layouts: LayoutDefaultLike[],
) {
  if (!layouts.length) return document

  const activeLayouts = layouts
    .filter((layout) => layout.isActive !== false)
    .sort((left, right) => left.sortOrder - right.sortOrder)
  const activeLayoutCodes = new Set(activeLayouts.map((layout) => layout.layoutCode))
  const currentByLayout = new Map<string, SapatamuEditorPage[]>()
  document.editor.pages.forEach((page) => {
    currentByLayout.set(page.layoutCode, [...(currentByLayout.get(page.layoutCode) ?? []), page])
  })
  const usedPageKeys = new Set<string>()

  return {
    ...document,
    editor: {
      ...document.editor,
      pages: activeLayouts.map((layout, index) => {
        const exactPage = currentByLayout
          .get(layout.layoutCode)
          ?.find((page, pageIndex) => !usedPageKeys.has(`${page.layoutCode}:${page.id}:${pageIndex}`))
        const currentPage =
          exactPage ??
          document.editor.pages.find((page, pageIndex) => (
            page.family === layout.family
            && !activeLayoutCodes.has(page.layoutCode)
            && !usedPageKeys.has(`${page.layoutCode}:${page.id}:${pageIndex}`)
          ))
        if (currentPage) {
          const pageIndex = document.editor.pages.indexOf(currentPage)
          usedPageKeys.add(`${currentPage.layoutCode}:${currentPage.id}:${pageIndex}`)
        }
        const uniqueId = index + 1

        return {
          ...(currentPage ?? {
            id: layout.layoutCode,
            uniqueId,
            title: layout.title,
            slug: pageSlugFromParts(uniqueId, layout.title),
            layoutCode: layout.layoutCode,
            family: layout.family,
            source: 'base' as const,
            isActive: true,
            isLocked: false,
            data: layout.defaultPageData as SapatamuEditorPage['data'],
          }),
          id: layout.layoutCode,
          uniqueId,
          title: layout.title,
          slug: pageSlugFromParts(uniqueId, layout.title),
          layoutCode: layout.layoutCode,
          family: layout.family,
          isActive: currentPage?.isActive ?? true,
          isLocked: currentPage?.isLocked ?? false,
          source: 'base' as const,
          data: mergePageDataWithDesignDefaults(
            currentPage?.data ?? (layout.defaultPageData as SapatamuEditorPage['data']) ?? ({} as SapatamuEditorPage['data']),
            layout.defaultPageData,
          ),
        } satisfies SapatamuEditorPage
      }),
      layoutCatalogSnapshot: activeLayouts.map((layout) => ({
        layoutCode: layout.layoutCode,
        family: layout.family,
        title: layout.title,
        previewImageUrl: '',
        defaultPageData: layout.defaultPageData,
        requiredTier: document.settings.commerce.requiredTierCategory,
        requiredFeatureCode: null,
        maxInstances: 1,
        sortOrder: layout.sortOrder,
        supportsPreviewSelection: true,
        mediaRequirements: 'none' as const,
        defaultVisible: true,
      })),
    },
  }
}
