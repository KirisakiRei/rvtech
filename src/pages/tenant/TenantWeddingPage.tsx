import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import { MapPin, Clock, Heart, Send, ChevronDown, Music, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { resolveApiAssetUrl } from '@/lib/api'
import { BRAND, WEDDING_THEMES } from '@/lib/constants'
import { PUBLIC_ADDITIONAL_SOURCE_THEME_IDS, PUBLIC_SOURCE_THEME_BACKDROPS, PUBLIC_SOURCE_THEME_DEFAULT_MUSIC } from '@/lib/sapatamu-source-themes'
import { dataCreate, dataDetail, dataList } from '@/lib/api'
import { PUBLIC_SAPATAMU_EDITOR_FONTS } from '@/lib/sapatamu-editor-fonts'
import { BackgroundHeroOverlay, PreviewPage } from '@/pages/cms/sapatamu/CmsSapatamuEditor'
import { ensureEditorFonts, reconcileEditorDocumentWithLayoutDefaults } from '@/pages/cms/sapatamu/editor/editor-utils'
import type { SapatamuEditorDocumentV3, SapatamuEditorPage } from '@/types/sapatamu'
import type { WeddingDetail, WeddingThemeId } from '@/types/wedding'

type InvitationRow = {
  id: string
  template_id: string | null
  title: string
  bride_name: string | null
  groom_name: string | null
  event_date: string | null
  status: 'draft' | 'published' | 'archived'
}

type InvitationSlugRow = {
  invitation_id: string
  slug: string
}

type InvitationContentRow = {
  content_json: Partial<SapatamuEditorDocumentV3> & {
    selectedTheme?: WeddingThemeId
    weddingData?: Partial<WeddingDetail>
  }
}

type InvitationMediaRow = {
  id: string
  url: string
  sort_order: number
}

type InvitationGreetingRow = {
  id: string
  guest_name: string
  message: string
  is_approved: boolean
  created_at: string
}

type EditorLayoutTemplateRow = {
  id: string
  template_id: string | null
  layout_code: string
  family: string
  title: string
  default_data_json: Record<string, unknown> | null
  sort_order: number
  is_active: boolean
}

function getYouTubeVideoId(url: string) {
  const clean = url.trim()
  if (!clean) return ''
  try {
    const parsed = new URL(clean)
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '')
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v') ?? ''
    const embedMatch = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)
    return embedMatch?.[1] ?? ''
  } catch {
    return ''
  }
}

function buildYouTubePlayerUrl(url: string) {
  const id = getYouTubeVideoId(url)
  if (!id) return ''
  return `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&enablejsapi=1&loop=1&playlist=${id}`
}

function parseCssColor(color: string | null | undefined): { r: number; g: number; b: number } | null {
  if (!color) return null
  const source = color.trim()
  if (/^rgba?\(/i.test(source)) {
    const [r, g, b] = source.match(/[\d.]+/g)?.map((part) => Number.parseFloat(part)) ?? []
    if ([r, g, b].every((value) => Number.isFinite(value))) {
      return {
        r: Math.max(0, Math.min(r, 255)),
        g: Math.max(0, Math.min(g, 255)),
        b: Math.max(0, Math.min(b, 255)),
      }
    }
  }

  const normalized = source.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized.slice(0, 6)
  if (!/^[0-9a-f]{6}$/i.test(full)) return null

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

function colorWithAlpha(color: string | null | undefined, alpha: number) {
  const rgb = parseCssColor(color)
  if (!rgb) return `rgb(255 255 255 / ${Math.round(alpha * 100)}%)`
  return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${Math.round(Math.max(0, Math.min(alpha, 1)) * 100)}%)`
}

function isLightColor(color: string | null | undefined) {
  const rgb = parseCssColor(color)
  if (!rgb) return false
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  return luminance > 0.62
}

function navIconFilterForBackground(color: string | null | undefined) {
  return isLightColor(color) ? 'brightness(0) saturate(100%)' : 'brightness(0) invert(1)'
}

function getEditorPageBackground(page: SapatamuEditorPage | undefined) {
  if (!page || page.data.backgroundDetails?.type === 'video') return ''
  return page.data.background || ''
}

function reconcilePublicDocument(
  document: SapatamuEditorDocumentV3 | null,
  rows: EditorLayoutTemplateRow[],
  templateId: string | null,
) {
  if (!document || rows.length === 0) return document

  const snapshotDefaults = new Map(
    (document.editor.layoutCatalogSnapshot ?? []).map((layout) => [
      layout.layoutCode,
      {
        layoutCode: layout.layoutCode,
        family: layout.family,
        title: layout.title,
        defaultPageData: layout.defaultPageData,
        sortOrder: layout.sortOrder,
        isActive: layout.defaultVisible !== false,
      },
    ]),
  )
  const rowsByCode = new Map<string, EditorLayoutTemplateRow>()
  rows.forEach((row) => {
    const existing = rowsByCode.get(row.layout_code)
    if (!existing || (!existing.template_id && row.template_id === templateId)) {
      rowsByCode.set(row.layout_code, row)
    }
  })

  rowsByCode.forEach((row) => {
    if (row.is_active === false) {
      snapshotDefaults.delete(row.layout_code)
      return
    }
    const existingDefault = snapshotDefaults.get(row.layout_code)
    snapshotDefaults.set(row.layout_code, {
      layoutCode: row.layout_code,
      family: existingDefault?.family ?? row.family,
      title: existingDefault?.title ?? row.title,
      defaultPageData: row.default_data_json ?? existingDefault?.defaultPageData ?? {},
      sortOrder: row.sort_order,
      isActive: true,
    })
  })

  return reconcileEditorDocumentWithLayoutDefaults(document, Array.from(snapshotDefaults.values()))
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
  bgmUrl: '',
  bankAccountInfo: [],
}

const RSVP_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak', label: 'Tidak Hadir' },
  { value: 'ragu', label: 'Ragu-ragu' },
] as const

const SOURCE_THEME_IDS = new Set(['malay-ethnic-red-ruby', 'batak-ethnic-maroon-mistyrose', ...PUBLIC_ADDITIONAL_SOURCE_THEME_IDS])

const SOURCE_THEME_NAV_ICON_BY_FAMILY: Record<string, Record<string, string>> = {
  'malay-ethnic-red-ruby': {
    opening: 'icons/opening',
    salam: 'icons/salam',
    quote: 'icons/quote',
    mempelai: 'icons/profile',
    acara: 'icons/acara',
    map: 'icons/map',
    video: 'icons/video',
    galeri: 'icons/galeri',
    'live-streaming': 'icons/live',
    'love-story': 'icons/love',
    'extra-link': 'icons/extra-link',
    rundown: 'icons/rundown',
    doa: 'icons/doa',
    rsvp: 'icons/rsvp',
    gift: 'icons/gift',
    contact: 'icons/contact',
    thanks: 'icons/terimakasih',
  },
  'batak-ethnic-maroon-mistyrose': {
    opening: 'icons/opening',
    salam: 'icons/salam',
    quote: 'icons/quote',
    mempelai: 'icons/profile',
    acara: 'icons/acara',
    map: 'icons/map',
    video: 'icons/video',
    galeri: 'icons/galeri',
    'live-streaming': 'icons/live',
    'love-story': 'default/love',
    'extra-link': 'icons/extra-link',
    rundown: 'icons/rundown',
    doa: 'icons/doa',
    rsvp: 'icons/rsvp',
    gift: 'icons/gift',
    contact: 'icons/contact',
    thanks: 'icons/terimakasih',
  },
}

const SIGNATURE_NAV_ICON_BY_FAMILY: Record<string, string> = {
  opening: 'opening',
  salam: 'salam',
  quote: 'quote',
  mempelai: 'profile',
  acara: 'acara',
  map: 'map',
  video: 'video',
  galeri: 'galeri',
  'live-streaming': 'live',
  'love-story': 'love',
  'extra-link': 'extra-link',
  rundown: 'rundown',
  doa: 'doa',
  rsvp: 'rsvp',
  gift: 'gift',
  contact: 'contact',
  thanks: 'terimakasih',
}

const SOURCE_THEME_DEFAULT_NAV_ICON_BY_FAMILY: Record<string, string> = {
  opening: 'icons/opening',
  salam: 'icons/salam',
  quote: 'icons/quote',
  mempelai: 'icons/profile',
  acara: 'icons/acara',
  map: 'icons/map',
  video: 'icons/video',
  galeri: 'icons/galeri',
  'live-streaming': 'icons/live',
  'love-story': 'default/love',
  'extra-link': 'icons/extra-link',
  rundown: 'icons/rundown',
  doa: 'icons/doa',
  rsvp: 'icons/rsvp',
  gift: 'icons/gift',
  contact: 'icons/contact',
  thanks: 'icons/terimakasih',
}

function getSourceThemeNavIcon(themeId: string, page: SapatamuEditorPage): string {
  const themeIcons = SOURCE_THEME_NAV_ICON_BY_FAMILY[themeId]
  const icon =
    themeIcons?.[page.family] ??
    SOURCE_THEME_DEFAULT_NAV_ICON_BY_FAMILY[page.family] ??
    `icons/${SIGNATURE_NAV_ICON_BY_FAMILY[page.family] ?? 'opening'}`
  return `/sapatamu-themes/${themeId}/original/${icon}.svg`
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    const timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center gap-4">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="text-2xl sm:text-3xl font-heading price-text">{value}</div>
          <div className="text-[10px] uppercase tracking-[0.15em] opacity-50 mt-1">
            {label === 'days' ? 'Hari' : label === 'hours' ? 'Jam' : label === 'minutes' ? 'Menit' : 'Detik'}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TenantWeddingPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const guestName = searchParams.get('to') || 'Tamu Undangan'
  const mainRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null)
  const youtubeFallbackTimerRef = useRef<number | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [youtubeEmbedSrc, setYoutubeEmbedSrc] = useState('')
  const [pageRunKeys, setPageRunKeys] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<WeddingThemeId>('malay-ethnic-red-ruby')
  const [weddingData, setWeddingData] = useState<Partial<WeddingDetail>>(DEFAULT_WEDDING_DATA)
  const [editorDocument, setEditorDocument] = useState<SapatamuEditorDocumentV3 | null>(null)
  const [gallery, setGallery] = useState<InvitationMediaRow[]>([])
  const [galleryLightbox, setGalleryLightbox] = useState<{ open: boolean; index: number; items: string[] }>({
    open: false,
    index: 0,
    items: [],
  })
  const [guestMessages, setGuestMessages] = useState<Array<{ id: string; guestName: string; message: string; createdAt?: string }>>([])
  const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak' | 'ragu' | ''>('')
  const [rsvpName, setRsvpName] = useState(guestName)
  const [rsvpMessage, setRsvpMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [publicEmblaRef, publicEmblaApi] = useEmblaCarousel({ axis: 'y', containScroll: 'trimSnaps', dragFree: false })
  const [publicPageIndex, setPublicPageIndex] = useState(0)

  const theme = useMemo(
    () => WEDDING_THEMES.find((item) => item.id === selectedTheme) || WEDDING_THEMES[0],
    [selectedTheme],
  )

  const activeEditorPages = useMemo(
    () => editorDocument?.editor.pages.filter((page) => page.isActive) ?? [],
    [editorDocument],
  )

  useEffect(() => {
    setRsvpName(guestName)
  }, [guestName])

  useEffect(() => {
    if (!publicEmblaApi) return

    const onSelect = () => {
      const nextIndex = publicEmblaApi.selectedScrollSnap()
      setPublicPageIndex(nextIndex)
      const page = activeEditorPages[nextIndex]
      if (page) {
        setPageRunKeys((current) => ({
          ...current,
          [page.uniqueId]: (current[page.uniqueId] ?? 0) + 1,
        }))
      }
    }
    onSelect()
    publicEmblaApi.on('select', onSelect)
    publicEmblaApi.on('reInit', onSelect)

    return () => {
      publicEmblaApi.off('select', onSelect)
      publicEmblaApi.off('reInit', onSelect)
    }
  }, [activeEditorPages, publicEmblaApi])

  useEffect(() => {
    publicEmblaApi?.reInit()
  }, [activeEditorPages.length, publicEmblaApi])

  useEffect(() => {
    const activeSlide = document.querySelectorAll<HTMLElement>('.sapatamu-public-embla-slide')[publicPageIndex]
    if (!activeSlide) return
    activeSlide.querySelectorAll('video').forEach((video) => {
      try {
        video.currentTime = 0
        void video.play().catch(() => undefined)
      } catch {
        // ignore browser media policy failures
      }
    })
    activeSlide.querySelectorAll<HTMLIFrameElement>('iframe').forEach((frame) => {
      if (frame.src) frame.src = frame.src
    })
  }, [pageRunKeys, publicPageIndex])

  useEffect(() => {
    ensureEditorFonts(PUBLIC_SAPATAMU_EDITOR_FONTS)
  }, [])

  useEffect(() => () => {
    if (youtubeFallbackTimerRef.current) window.clearTimeout(youtubeFallbackTimerRef.current)
    audioRef.current?.pause()
  }, [])

  useEffect(() => {
    if (!slug) {
      setError('Slug undangan tidak ditemukan.')
      setIsLoading(false)
      return
    }

    const loadInvitation = async () => {
      setIsLoading(true)
      setError('')

      try {
        const slugResponse = await dataList<InvitationSlugRow>('invitation-slugs', {
          where: { slug, is_primary: true },
          limit: 1,
        })

        const slugRow = slugResponse.data?.items?.[0]
        if (!slugRow?.invitation_id) {
          throw new Error('Undangan tidak ditemukan')
        }

        const invitationResponse = await dataDetail<InvitationRow>('invitations', slugRow.invitation_id)
        const [contentResponse, mediaResponse, greetingResponse] = await Promise.all([
          dataList<InvitationContentRow>('invitation-contents', {
            where: { invitation_id: slugRow.invitation_id, is_current: true },
            orderBy: { version: 'desc' },
            limit: 1,
          }),
          dataList<InvitationMediaRow>('invitation-media', {
            where: { invitation_id: slugRow.invitation_id, media_type: 'image' },
            orderBy: { sort_order: 'asc' },
            limit: 20,
          }),
          dataList<InvitationGreetingRow>('invitation-greetings', {
            where: { invitation_id: slugRow.invitation_id, is_approved: true },
            orderBy: { created_at: 'desc' },
            limit: 30,
          }),
        ])

        const invitation = invitationResponse.data
        if (!invitation || invitation.status !== 'published') {
          setInvitationId(slugRow.invitation_id)
          setGallery([])
          setGuestMessages([])
          setEditorDocument(null)
          setWeddingData(DEFAULT_WEDDING_DATA)
          setError('Undangan ini belum aktif. Silakan kembali lagi setelah pemilik mengaktifkannya.')
          return
        }
        const content = contentResponse.data?.items?.[0]?.content_json
        const contentWeddingData = content?.weddingData ?? {}
        const nextEditorDocument =
          content?.schemaVersion === 3 && content.editor?.pages?.length
            ? (content as SapatamuEditorDocumentV3)
            : null
        const layoutRowsResponse = invitation?.template_id
          ? await dataList<EditorLayoutTemplateRow>('editor-layout-templates', {
              where: {
                product_code: 'sapatamu',
                OR: [{ template_id: null }, { template_id: invitation.template_id }],
              },
              orderBy: { sort_order: 'asc' },
              limit: 100,
            }).catch(() => ({ data: { items: [] } }))
          : { data: { items: [] as EditorLayoutTemplateRow[] } }
        const reconciledEditorDocument = reconcilePublicDocument(
          nextEditorDocument,
          layoutRowsResponse.data?.items ?? [],
          invitation?.template_id ?? null,
        )

        setInvitationId(slugRow.invitation_id)
        setSelectedTheme(content?.selectedTheme ?? 'malay-ethnic-red-ruby')
        setGallery(mediaResponse.data?.items ?? [])
        setGuestMessages((greetingResponse.data?.items ?? []).map((item) => ({
          id: item.id,
          guestName: item.guest_name,
          message: item.message,
          createdAt: item.created_at,
        })))
        setEditorDocument(reconciledEditorDocument)
        setWeddingData({
          ...DEFAULT_WEDDING_DATA,
          ...contentWeddingData,
          brideName: contentWeddingData.brideName ?? invitation?.bride_name ?? '',
          groomName: contentWeddingData.groomName ?? invitation?.groom_name ?? '',
          akadTime: contentWeddingData.akadTime ?? invitation?.event_date ?? '',
        })

        void dataCreate('invitation-visits', {
          invitation_id: slugRow.invitation_id,
          source: 'public-page',
          user_agent: navigator.userAgent,
          visitor_hash: `${slug}:${guestName}`.slice(0, 180),
        }).catch(() => undefined)
      } catch {
        setInvitationId(null)
        setGallery([])
        setGuestMessages([])
        setEditorDocument(null)
        setWeddingData(DEFAULT_WEDDING_DATA)
        setError('Undangan tidak tersedia atau belum dipublikasikan.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadInvitation()
  }, [guestName, slug])

  const defaultThemeMusicUrl = editorDocument?.selectedTheme
    ? PUBLIC_SOURCE_THEME_DEFAULT_MUSIC[editorDocument.selectedTheme]
    : ''
  const configuredMusicMode = editorDocument?.musicSettings?.mode
  const configuredMusicValue = editorDocument?.musicSettings?.value?.trim() ?? ''
  const resolvedAudioMusicUrl =
    configuredMusicMode === 'none'
      ? ''
      : configuredMusicMode === 'library' && configuredMusicValue
      ? configuredMusicValue
      : weddingData.bgmUrl || defaultThemeMusicUrl
  const canPlayMusic =
    configuredMusicMode === 'none'
      ? false
      : configuredMusicMode === 'youtube'
      ? Boolean(configuredMusicValue || defaultThemeMusicUrl)
      : Boolean(resolvedAudioMusicUrl)

  const playAudioUrl = (url: string) => {
    if (!url) return
    const bgmUrl = resolveApiAssetUrl(url)
    if (!audioRef.current || audioRef.current.src !== new URL(bgmUrl, window.location.href).href) {
      audioRef.current?.pause()
      const audio = new Audio(bgmUrl)
      audio.loop = true
      audio.volume = 0.5
      audioRef.current = audio
    }
    void audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => undefined)
  }

  const postYoutubeCommand = (func: 'playVideo' | 'pauseVideo') => {
    youtubeFrameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube.com',
    )
  }

  const handleOpenInvitation = () => {
    setIsOpen(true)
    // 1. Scroll to salam page via Embla
    const salamIndex = activeEditorPages.findIndex((p) => p.family === 'salam')
    if (salamIndex >= 0) {
      publicEmblaApi?.scrollTo(salamIndex)
    } else {
      // Fallback: scroll to second page
      publicEmblaApi?.scrollTo(Math.min(1, activeEditorPages.length - 1))
    }

    // 2. Request fullscreen
    const root = document.documentElement
    if (root.requestFullscreen) {
      void root.requestFullscreen().catch(() => undefined)
    }

    // 3. Play background music
    if (configuredMusicMode === 'youtube' && configuredMusicValue) {
      const playerUrl = buildYouTubePlayerUrl(configuredMusicValue)
      if (playerUrl) {
        audioRef.current?.pause()
        setYoutubeEmbedSrc(playerUrl)
        setIsMusicPlaying(true)
        if (youtubeFallbackTimerRef.current) window.clearTimeout(youtubeFallbackTimerRef.current)
        youtubeFallbackTimerRef.current = window.setTimeout(() => {
          if (!defaultThemeMusicUrl) return
          setYoutubeEmbedSrc('')
          playAudioUrl(defaultThemeMusicUrl)
        }, 4500)
      } else {
        playAudioUrl(defaultThemeMusicUrl)
      }
    } else if (resolvedAudioMusicUrl) {
      playAudioUrl(resolvedAudioMusicUrl)
    }
  }

  const handleVintageNavigate = (target: string) => {
    const key = target.replace(/^#/, '').toLowerCase()
    const index = activeEditorPages.findIndex((page) => (
      page.family.toLowerCase() === key
      || page.layoutCode.toLowerCase().includes(key)
      || page.slug.toLowerCase().includes(key)
      || (key === 'gift' && page.family.toLowerCase() === 'gift')
      || (key === 'rsvp' && page.family.toLowerCase() === 'rsvp')
    ))
    if (index >= 0) {
      publicEmblaApi?.scrollTo(index)
    }
  }

  const handleMusicToggle = () => {
    if (youtubeEmbedSrc) {
      if (isMusicPlaying) {
        postYoutubeCommand('pauseVideo')
        setIsMusicPlaying(false)
      } else {
        postYoutubeCommand('playVideo')
        setIsMusicPlaying(true)
      }
      return
    }
    const audio = audioRef.current
    if (!audio) {
      if (resolvedAudioMusicUrl) playAudioUrl(resolvedAudioMusicUrl)
      return
    }
    if (isMusicPlaying) {
      audio.pause()
      setIsMusicPlaying(false)
    } else {
      void audio.play().then(() => setIsMusicPlaying(true)).catch(() => undefined)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMuted(false)
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!invitationId || !rsvpStatus || !rsvpName) return

    setIsSubmitting(true)

    try {
      await dataCreate('invitation-rsvps', {
        invitation_id: invitationId,
        guest_name: rsvpName,
        status: rsvpStatus,
        attendees_count: 1,
        message: rsvpMessage || null,
      })

      if (rsvpMessage.trim()) {
        await dataCreate('invitation-greetings', {
          invitation_id: invitationId,
          guest_name: rsvpName,
          message: rsvpMessage.trim(),
          is_approved: true,
        })
        setGuestMessages((current) => [
          {
            id: `local-${Date.now()}`,
            guestName: rsvpName,
            message: rsvpMessage.trim(),
            createdAt: new Date().toISOString(),
          },
          ...current,
        ])
      }

      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-[2rem] p-8 text-center">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">Rekavia Invitation</p>
          <p className="text-2xl font-heading text-foreground mt-3">Undangan Belum Aktif</p>
          <p className="text-sm text-muted-foreground mt-3 leading-7">{error}</p>
        </div>
      </div>
    )
  }

  if (editorDocument && invitationId) {
    const invitationLink = `https://${BRAND.domain}/${slug}`
    const fallbackImages = gallery.map((item) => item.url)
    const galleryLightboxSlides = galleryLightbox.items.map((item) => ({ src: resolveApiAssetUrl(item) }))
    const openGalleryLightbox = (index: number, items = fallbackImages) => {
      if (!items.length) return
      setGalleryLightbox({ open: true, index, items })
    }
    const isSourceThemeDocument = SOURCE_THEME_IDS.has(editorDocument.selectedTheme)
    const isAishwaryaVintageDocument = editorDocument.selectedTheme === 'aishwarya-peonny'

    if (isSourceThemeDocument) {
      const globalBgUrl = editorDocument.editor.globalBackground
      const globalBgType = editorDocument.editor.globalBackgroundDetails?.type
      const activePageBackground = getEditorPageBackground(activeEditorPages[publicPageIndex])
      const stageBackdropUrl = PUBLIC_SOURCE_THEME_BACKDROPS[editorDocument.selectedTheme]
      const stageBackgroundUrl = stageBackdropUrl || activePageBackground || (globalBgUrl && globalBgType !== 'video' ? globalBgUrl : '')
      const backgroundHero = (editorDocument.editor.globalBackgroundDetails as { hero?: Parameters<typeof BackgroundHeroOverlay>[0]['hero'] }).hero
      const stageBaseColor = theme.primaryColor || editorDocument.editor.colorPalette.surface || editorDocument.editor.colorPalette.canvas
      const stageAccentColor = theme.accentColor || editorDocument.editor.colorPalette.accent
      const navActiveColor = stageAccentColor
      const navInactiveColor = colorWithAlpha(stageBaseColor, 0.18)
      const navShellColor = colorWithAlpha(stageBaseColor, 0.36)

      const publicStageStyle: CSSProperties = stageBackgroundUrl
        ? {
            backgroundColor: stageBaseColor,
            backgroundImage: `linear-gradient(${colorWithAlpha(stageBaseColor, 0.2)}, ${colorWithAlpha(stageBaseColor, 0.2)}), url(${resolveApiAssetUrl(stageBackgroundUrl)})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }
        : {
            background: `linear-gradient(135deg, ${stageBaseColor}, ${editorDocument.editor.colorPalette.surface || stageBaseColor})`,
            backgroundPosition: 'center center',
          }

      return (
        <div
          className="sapatamu-public-theme-preview sapatamu-public-signature-preview sapatamu-public-source-preview min-h-screen"
          style={publicStageStyle}
        >
          <div className="sapatamu-public-embla" ref={publicEmblaRef}>
            <div className="sapatamu-public-embla-track">
              {activeEditorPages.map((page) => (
                <div key={page.uniqueId} className="sapatamu-public-embla-slide" style={{ height: '100%' }}>
                  <PreviewPage
                    key={`${page.uniqueId}-${pageRunKeys[page.uniqueId] ?? 0}`}
                    page={page}
                    invitationId={invitationId}
                    selectedElement={null}
                    documentValue={editorDocument}
                    invitationLink={invitationLink}
                    fonts={PUBLIC_SAPATAMU_EDITOR_FONTS}
                    fallbackImages={fallbackImages}
                    onOpenLightbox={openGalleryLightbox}
                    isEditing={false}
                    onOpen={handleOpenInvitation}
                    rsvpInitialName={guestName}
                    rsvpMessages={guestMessages}
                    onRsvpSubmitted={(message) => setGuestMessages((current) => [message, ...current])}
                    giftAccounts={editorDocument.settings.giftAccounts}
                    giftAddress={editorDocument.settings.giftAddress}
                    isInvitationOpen={!isAishwaryaVintageDocument || isOpen}
                    isMusicPlaying={isMusicPlaying}
                    onMusicToggle={handleMusicToggle}
                    onVintageNavigate={handleVintageNavigate}
                  />
                </div>
              ))}
            </div>
          </div>

          {backgroundHero ? (
            <BackgroundHeroOverlay
              hero={backgroundHero}
              fallbackImages={fallbackImages}
              isEditing={false}
            />
          ) : null}

          {editorDocument.editor.navMenu.enabled && activeEditorPages.length > 1 && !isAishwaryaVintageDocument ? (
            <nav
              className="sapatamu-public-signature-nav"
              aria-label="Navigasi undangan"
              style={{ background: navShellColor }}
            >
              {activeEditorPages.map((page, index) => {
                const isActive = index === publicPageIndex
                const buttonColor = isActive ? navActiveColor : navInactiveColor
                return (
                  <button
                    key={page.uniqueId}
                    type="button"
                    className="sapatamu-public-signature-nav-button"
                    data-active={isActive}
                    aria-label={page.title}
                    title={page.title}
                    onClick={() => publicEmblaApi?.scrollTo(index)}
                    style={{
                      backgroundColor: buttonColor,
                      '--sapatamu-nav-icon-filter': navIconFilterForBackground(buttonColor),
                    } as CSSProperties}
                  >
                    <img src={getSourceThemeNavIcon(editorDocument.selectedTheme, page)} alt="" className="size-4" />
                  </button>
                )
              })}
            </nav>
          ) : null}
          {youtubeEmbedSrc ? (
            <iframe
              ref={youtubeFrameRef}
              title="Background music"
              src={youtubeEmbedSrc}
              allow="autoplay; encrypted-media"
              onLoad={() => {
                if (youtubeFallbackTimerRef.current) {
                  window.clearTimeout(youtubeFallbackTimerRef.current)
                  youtubeFallbackTimerRef.current = null
                }
                postYoutubeCommand('playVideo')
                setIsMusicPlaying(true)
              }}
              className="pointer-events-none fixed bottom-0 left-0 size-px opacity-0"
            />
          ) : null}
          {/* Floating music toggle button */}
          {(canPlayMusic || audioRef.current || youtubeEmbedSrc) && !isAishwaryaVintageDocument ? (
            <button
              type="button"
              className="sapatamu-public-music-toggle fixed right-6 z-50 flex size-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/30"
              onClick={handleMusicToggle}
              aria-label={isMusicPlaying ? 'Matikan musik' : 'Putar musik'}
            >
              {isMusicPlaying ? <Music className="size-4" /> : <VolumeX className="size-4" />}
            </button>
          ) : null}
          <Lightbox
            open={galleryLightbox.open}
            close={() => setGalleryLightbox((current) => ({ ...current, open: false }))}
            index={galleryLightbox.index}
            slides={galleryLightboxSlides}
          />
        </div>
      )
    }

    return (
      <div className="sapatamu-public-theme-preview min-h-screen bg-[#4b2924]">
        {activeEditorPages.map((page) => (
          <PreviewPage
            key={page.uniqueId}
            page={page}
            invitationId={invitationId}
            selectedElement={null}
            documentValue={editorDocument}
            invitationLink={invitationLink}
            fonts={PUBLIC_SAPATAMU_EDITOR_FONTS}
            fallbackImages={fallbackImages}
            onOpenLightbox={openGalleryLightbox}
            isEditing={false}
            onOpen={handleOpenInvitation}
            rsvpInitialName={guestName}
            rsvpMessages={guestMessages}
            onRsvpSubmitted={(message) => setGuestMessages((current) => [message, ...current])}
            giftAccounts={editorDocument.settings.giftAccounts}
            giftAddress={editorDocument.settings.giftAddress}
            isInvitationOpen={isOpen}
            isMusicPlaying={isMusicPlaying}
            onMusicToggle={handleMusicToggle}
            onVintageNavigate={handleVintageNavigate}
          />
        ))}
        <Lightbox
          open={galleryLightbox.open}
          close={() => setGalleryLightbox((current) => ({ ...current, open: false }))}
          index={galleryLightbox.index}
          slides={galleryLightboxSlides}
        />
      </div>
    )
  }

  return (
    <div
      style={
        {
          '--wedding-primary': theme.primaryColor,
          '--wedding-secondary': theme.secondaryColor,
          '--wedding-accent': theme.accentColor,
        } as CSSProperties
      }
    >
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center px-8 max-w-sm"
            >
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-50 mb-6">The Wedding Of</p>
              <h1 className="text-4xl sm:text-5xl mb-2" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.groomName || 'Mempelai Pria'}
              </h1>
              <p className="text-2xl opacity-40 my-2">&</p>
              <h1 className="text-4xl sm:text-5xl mb-8" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.brideName || 'Mempelai Wanita'}
              </h1>

              <div className="mb-8">
                <p className="text-[11px] tracking-[0.15em] uppercase opacity-40 mb-2">Kepada Yth.</p>
                <p className="text-lg font-medium">{guestName}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpen}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                id="wedding-open-btn"
              >
                Buka Undangan
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div ref={mainRef} style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}>
          <button
            onClick={() => setIsMuted((value) => !value)}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
            style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
            aria-label={isMuted ? 'Aktifkan musik' : 'Matikan musik'}
            id="wedding-music-toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4" />}
          </button>

          <section className="min-h-screen flex flex-col items-center justify-center text-center px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-50 mb-4">Pernikahan</p>
              <h2 className="text-4xl sm:text-6xl mb-2" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.groomName || 'Mempelai Pria'}
              </h2>
              <div className="flex items-center justify-center gap-4 my-3">
                <div className="h-px w-12 opacity-20" style={{ backgroundColor: theme.primaryColor }} />
                <Heart className="w-5 h-5" style={{ color: theme.accentColor }} />
                <div className="h-px w-12 opacity-20" style={{ backgroundColor: theme.primaryColor }} />
              </div>
              <h2 className="text-4xl sm:text-6xl" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.brideName || 'Mempelai Wanita'}
              </h2>
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto text-center"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6">Menghitung Hari</p>
              <Countdown targetDate={weddingData.akadTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()} />
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <div className="max-w-md mx-auto space-y-8">
              {[
                { label: 'Akad Nikah', time: weddingData.akadTime, location: weddingData.akadLocation },
                { label: 'Resepsi', time: weddingData.resepsiTime, location: weddingData.resepsiLocation },
              ].map((eventItem, index) => (
                <motion.div
                  key={eventItem.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center p-6 rounded-2xl"
                  style={{ backgroundColor: `${theme.primaryColor}06` }}
                >
                  <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-3">{eventItem.label}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 opacity-50" />
                    <p className="text-sm">
                      {eventItem.time
                        ? new Date(eventItem.time).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Tanggal belum diatur'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 opacity-50" />
                    <p className="text-sm opacity-80">{eventItem.location || 'Lokasi belum diatur'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto text-center"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6">Galeri</p>
              <div className="grid grid-cols-2 gap-3">
                {(gallery.length > 0 ? gallery.slice(0, 4) : Array.from({ length: 4 }, () => null)).map((item, index) =>
                  item ? (
                    <img
                      key={item.id}
                      src={resolveApiAssetUrl(item.url)}
                      alt={`Galeri ${index + 1}`}
                      className="aspect-square rounded-xl object-cover w-full"
                    />
                  ) : (
                    <div
                      key={`placeholder-${index}`}
                      className="aspect-square rounded-xl"
                      style={{ backgroundColor: `${theme.primaryColor}08` }}
                    />
                  ),
                )}
              </div>
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6 text-center">Konfirmasi Kehadiran</p>

              {isSubmitted ? (
                <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: `${theme.primaryColor}06` }}>
                  <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <p className="font-medium">Terima kasih.</p>
                  <p className="text-sm opacity-60 mt-1">Konfirmasi Anda telah kami terima.</p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4" id="wedding-rsvp-form">
                  <Input
                    placeholder="Nama Anda"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    className="h-11 rounded-xl border-opacity-20 bg-transparent"
                    style={{ borderColor: `${theme.primaryColor}30` }}
                    id="wedding-rsvp-name"
                  />

                  <div className="flex gap-2">
                    {RSVP_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRsvpStatus(option.value)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: rsvpStatus === option.value ? theme.primaryColor : `${theme.primaryColor}08`,
                          color: rsvpStatus === option.value ? theme.secondaryColor : theme.primaryColor,
                        }}
                        id={`wedding-rsvp-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Kirim ucapan dan doa..."
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    rows={3}
                    className="rounded-xl border-opacity-20 bg-transparent"
                    style={{ borderColor: `${theme.primaryColor}30` }}
                    id="wedding-rsvp-message"
                  />

                  <Button
                    type="submit"
                    disabled={!rsvpStatus || !rsvpName || isSubmitting}
                    className="w-full h-11 rounded-xl text-sm"
                    style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                    id="wedding-rsvp-submit"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                  </Button>
                </form>
              )}
            </motion.div>
          </section>

          <footer className="py-12 text-center opacity-40">
            <p className="text-xs">
              Dibuat dengan {BRAND.name} · {BRAND.domain}
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}
