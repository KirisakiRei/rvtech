import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useEmblaCarousel from 'embla-carousel-react'
import ReactPlayer from 'react-player'
import Lightbox from 'yet-another-react-lightbox'
import { ArrowLeft, GripVertical, ImagePlus, Loader2, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { resolveApiAssetUrl, resolveGoogleMapsShareUrl } from '@/lib/api'
import { getThemePreset, resolveThemeGroup } from '@/lib/sapatamu'
import { PUBLIC_ADDITIONAL_SOURCE_THEME_IDS } from '@/lib/sapatamu-source-themes'
import { cn } from '@/lib/utils'
import {
  findEditorPageBySlug,
  getEditorActivePageIndex,
  getEditorMediaByType,
  useSapatamuEditorStore,
} from '@/stores/sapatamuEditorStore'
import type {
  SapatamuEditorButtonElement,
  SapatamuEditorCornerElement,
  SapatamuEditorDocumentV3,
  SapatamuEditorGalleryElement,
  SapatamuEditorGiftElement,
  SapatamuEditorHydrationResponse,
  SapatamuEditorImageElement,
  SapatamuEditorLayoutCatalogItem,
  SapatamuEditorLineElement,
  SapatamuEditorMapElement,
  SapatamuEditorPadding,
  SapatamuEditorPage,
  SapatamuEditorRsvpElement,
  SapatamuEditorStoryElement,
  SapatamuEditorTextElement,
  SapatamuEditorTimerElement,
  SapatamuEditorVideoElement,
} from '@/types/sapatamu'
import {
  ensureEditorFonts,
  findFontName,
  getEditableElement,
  getEditorDisplayContent,
  getEditorAnimationClass,
  getEditorPlainTextInputValue,
  getGoogleMapEmbedUrl,
  getElementTypeFromKey,
  isGoogleMapsShortUrl,
  listPageEditableKeys,
  mergePageDataWithDesignDefaults,
  splitEditorParagraphs,
  stripEditorHtml,
} from './editor/editor-utils'
import 'yet-another-react-lightbox/styles.css'
import './editor/sapatamu-editor.css'

type MediaPickerTarget =
  | { kind: 'global-background'; mediaType: 'image' | 'video' }
  | { kind: 'global-hero-photo'; heroKey: BackgroundHeroElementKey; mediaType: 'image' }
  | { kind: 'page-background'; pageUniqueId: number; mediaType: 'image' | 'video' }
  | { kind: 'element-image'; pageUniqueId: number; elementKey: string; mediaType: 'image' }
  | { kind: 'element-gallery'; pageUniqueId: number; elementKey: string; mediaType: 'image' }
  | { kind: 'element-video'; pageUniqueId: number; elementKey: string; mediaType: 'video' }

type EditorPanelMode = 'layouts' | 'theme' | 'palette' | 'background'

type EditableMapElement = SapatamuEditorMapElement & {
  mode?: 'google-map' | 'qr-code' | 'image' | 'hidden'
  imageUrl?: string
  borderSize?: number
  borderRadius?: number
}

type EditorGuestMessage = {
  id: string
  guestName: string
  message: string
  createdAt?: string
}

type EditorGiftAccount = {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
}

const SOURCE_THEME_IDS = new Set(['premium1', 'sarune-batak-sangria', ...PUBLIC_ADDITIONAL_SOURCE_THEME_IDS])
const SOURCE_THEME_LAYOUT_PREFIXES = ['premium1', 'sarune', ...PUBLIC_ADDITIONAL_SOURCE_THEME_IDS.map((themeId) => themeId.split('-')[0])]

function isSourceThemePreview(themeId: string | undefined, layoutCode: string) {
  return Boolean(themeId && SOURCE_THEME_IDS.has(themeId)) || SOURCE_THEME_LAYOUT_PREFIXES.some((prefix) => layoutCode.startsWith(`${prefix}-`))
}

type BackgroundHeroSettings = {
  left?: {
    photo?: { enabled?: boolean; url?: string; x?: number; y?: number; size?: number }
    subTitle?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
    title?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
    description?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
  }
  right?: {
    photo?: { enabled?: boolean; url?: string; x?: number; y?: number; size?: number }
    title?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
    description?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
    music?: { enabled?: boolean; text?: string; x?: number; y?: number; size?: number }
  }
}

type BackgroundHeroElementKey =
  | 'left.photo'
  | 'left.subTitle'
  | 'left.title'
  | 'left.description'
  | 'right.photo'
  | 'right.title'
  | 'right.description'
  | 'right.music'

const BACKGROUND_HERO_LABELS: Record<BackgroundHeroElementKey, string> = {
  'left.photo': 'Left Photo',
  'left.subTitle': 'Left Sub Title',
  'left.title': 'Left Title',
  'left.description': 'Left Description',
  'right.photo': 'Right Photo',
  'right.title': 'Right Title',
  'right.description': 'Right Description',
  'right.music': 'Right Music',
}

const GALLERY_VARIANTS = [
  { value: 'bento-feature-left', label: 'Feature Left' },
  { value: 'bento-feature-right', label: 'Feature Right' },
  { value: 'bento-banner', label: 'Banner' },
  { value: 'bento-center', label: 'Center' },
  { value: 'bento-mosaic', label: 'Mosaic' },
] as const

const INPUT_CLASS =
  'h-10 rounded-xl border-border/70 bg-white/80 shadow-none focus-visible:border-accent focus-visible:ring-accent/20'

const TEXT_ALIGN_OPTIONS: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right']

const ANIMATION_OPTIONS = [
  { value: 5, label: 'Rise Up' },
  { value: 8, label: 'Rise Down' },
  { value: 6, label: 'Rise Left' },
  { value: 7, label: 'Rise Right' },
  { value: 9, label: 'Zoom In' },
  { value: 10, label: 'Zoom Out' },
  { value: 11, label: 'Rotate Left' },
  { value: 12, label: 'Rotate Right' },
  { value: 13, label: 'Flicker' },
  { value: 14, label: 'Pulse' },
  { value: 15, label: 'Succession' },
  { value: 16, label: 'Pop' },
  { value: 17, label: 'Wiggle' },
] as const

function parseHexToRgba(hex: string, opacity: number) {
  if (!hex || hex === 'transparent' || opacity <= 0) return 'rgba(0, 0, 0, 0)'
  const source = hex.trim()
  if (/^rgba?\(/i.test(source)) {
    const parts = source.match(/[\d.]+%?/g) ?? []
    const [rawR, rawG, rawB, rawAlpha] = parts
    const r = Math.max(0, Math.min(Number.parseFloat(rawR ?? '0'), 255))
    const g = Math.max(0, Math.min(Number.parseFloat(rawG ?? '0'), 255))
    const b = Math.max(0, Math.min(Number.parseFloat(rawB ?? '0'), 255))
    const sourceAlpha = rawAlpha
      ? rawAlpha.endsWith('%')
        ? Number.parseFloat(rawAlpha) / 100
        : Number.parseFloat(rawAlpha)
      : 1
    return `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${Math.max(0, Math.min(sourceAlpha * opacity, 1))})`
  }
  const normalized = source.replace('#', '')
  const full = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized.slice(0, 6)

  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${Math.max(0, Math.min(opacity, 1))})`
}

function getPageBackground(page: SapatamuEditorPage, fallbackBackground: string | null) {
  return page.data.background || fallbackBackground
}

function updateQueryElement(
  navigate: ReturnType<typeof useNavigate>,
  invitationId: string,
  pageSlug: string,
  elementKey?: string | null,
) {
  navigate({
    pathname: `/cms/sapatamu/${invitationId}/editor/${pageSlug}`,
    search: elementKey ? `?element=${encodeURIComponent(elementKey)}` : '',
  })
}

function resolveLayoutPreviewUrl(url: string | null | undefined) {
  if (!url) return '/sapatamu-layouts/opening1.webp'
  if (url.startsWith('/')) return url
  return resolveApiAssetUrl(url)
}

function getAnimationInlineStyle(duration?: number): CSSProperties {
  return {
    '--editor-animation-duration': `${duration ?? 3}s`,
  } as CSSProperties
}

function getAnimationDuration(animation: unknown) {
  if (!animation || typeof animation !== 'object') return undefined
  const duration = (animation as { duration?: unknown }).duration
  return typeof duration === 'number' ? duration : undefined
}

function getPreviewLineHeight(value: number, fontSize?: number) {
  if (!Number.isFinite(value)) return 1.25
  if (value <= 5) return value

  if (Number.isFinite(fontSize) && fontSize && value < fontSize * 0.65) {
    return `${Math.round(fontSize * 1.12)}px`
  }

  return `${value}px`
}

function getNextTextLineHeight(currentSize: number, currentLineHeight: number, nextSize: number) {
  const ratio = currentSize > 0 && currentLineHeight > 0 ? currentLineHeight / currentSize : 1.2
  const normalizedRatio = ratio < 0.75 || ratio > 2.5 ? 1.2 : ratio

  return Math.max(1, Math.round(nextSize * normalizedRatio * 10) / 10)
}

function getCountdownParts(value: string, now: number) {
  const target = value ? new Date(value).getTime() : Number.NaN
  const distance = Number.isFinite(target) ? Math.max(0, target - now) : 0
  const totalSeconds = Math.floor(distance / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    { value: days, label: 'Hari' },
    { value: hours, label: 'Jam' },
    { value: minutes, label: 'Menit' },
    { value: seconds, label: 'Detik' },
  ]
}

function padCountdown(value: number) {
  return String(Math.max(0, value)).padStart(2, '0')
}

function getHeroText(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback
}

function getHeroItemStyle(node?: { x?: number; y?: number; size?: number }): CSSProperties {
  const size = Number.isFinite(node?.size) ? Math.max(20, Math.min(240, Number(node?.size))) : 100
  const x = Number.isFinite(node?.x) ? Number(node?.x) : 0
  const y = Number.isFinite(node?.y) ? Number(node?.y) : 0
  return {
    '--hero-x': `${x}px`,
    '--hero-y': `${y}px`,
    '--hero-scale': size / 100,
  } as CSSProperties
}

function getElementEditTitle(elementType: string | null) {
  switch (elementType) {
    case 'text':
      return 'Text Edit'
    case 'image':
      return 'Photo Edit'
    case 'timer':
      return 'Countdown Edit'
    case 'map':
      return 'Map Edit'
    case 'gallery':
      return 'Gallery Edit'
    case 'video':
      return 'Video Edit'
    case 'rsvp':
      return 'RSVP Form Edit'
    case 'gift':
      return 'Gift Edit'
    case 'story':
      return 'Love Story Edit'
    case 'sponsor':
      return 'Sponsor Edit'
    case 'credit':
      return 'Credit Edit'
    case 'button':
    case 'url':
      return 'Button Edit'
    default:
      return 'Pilih Elemen'
  }
}

function SortablePageItem(props: {
  page: SapatamuEditorPage
  isCurrent: boolean
  invitationId: string
  onToggle: (page: SapatamuEditorPage, nextActive: boolean) => void
}) {
  const { page, isCurrent, invitationId, onToggle } = props
  const navigate = useNavigate()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.uniqueId })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-2xl border ${isCurrent ? 'border-accent bg-accent/8' : 'border-border/60 bg-white/90'} ${
        isDragging ? 'opacity-70' : ''
      } sapatamu-editor-card`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => updateQueryElement(navigate, invitationId, page.slug, null)}
        >
          <p className="truncate text-sm font-semibold text-slate-900">{page.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
            <span>{page.layoutCode}</span>
            {page.source === 'addon' ? <Badge variant="outline">Addon</Badge> : null}
            {page.isLocked ? <Badge variant="outline">Upgrade Paket</Badge> : null}
          </div>
        </button>
        <Switch
          checked={page.isActive}
          onCheckedChange={(checked) => onToggle(page, checked)}
        />
      </div>
    </div>
  )
}

function LayoutLibraryDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  layouts: SapatamuEditorLayoutCatalogItem[]
  onAdd: (layoutCode: string) => void
  lockedLookup: Record<string, string | null>
  isSaving: boolean
}) {
  const { open, onOpenChange, layouts, onAdd, lockedLookup, isSaving } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl rounded-[28px] bg-white p-0 sm:max-w-6xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Add Layout</DialogTitle>
          <DialogDescription>
            Pilih layout tambahan untuk dimasukkan ke urutan invitation editor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[72vh] grid-cols-1 gap-5 overflow-y-auto p-6 md:grid-cols-2 xl:grid-cols-3">
          {layouts.map((layout) => {
            const lockedReason = lockedLookup[layout.layoutCode]

            return (
              <div
                key={layout.layoutCode}
                className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="relative aspect-[9/14] overflow-hidden bg-slate-50">
                  <img
                    src={resolveLayoutPreviewUrl(layout.previewImageUrl)}
                    alt={layout.title}
                    loading="lazy"
                    className={`size-full object-cover object-top transition duration-700 group-hover:scale-[1.03] ${
                      lockedReason ? 'opacity-45 grayscale' : ''
                    }`}
                    onError={(event) => {
                      event.currentTarget.src = '/sapatamu-layouts/opening1.webp'
                    }}
                  />
                  <div className="absolute inset-x-4 top-4">
                    <Button
                      className="h-8 w-full rounded-full bg-slate-950 text-xs font-semibold text-white hover:bg-slate-800"
                      disabled={Boolean(lockedReason) || isSaving}
                      onClick={() => onAdd(layout.layoutCode)}
                    >
                      {lockedReason ? 'Upgrade Paket' : 'Tambahkan'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{layout.title}</p>
                      <p className="text-xs text-slate-500">
                        {layout.family} · {layout.layoutCode}
                      </p>
                    </div>
                    {lockedReason ? <Badge variant="outline">Upgrade Paket</Badge> : null}
                  </div>
                  {lockedReason ? (
                    <p className="text-xs text-amber-700">{lockedReason}</p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Kebutuhan media: {layout.mediaRequirements}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MediaPickerDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: MediaPickerTarget | null
  media: SapatamuEditorHydrationResponse['catalog']['media']
  onPick: (mediaUrl: string) => void
  onUpload: (file: File) => void
  isSaving: boolean
}) {
  const { open, onOpenChange, target, media, onPick, onUpload, isSaving } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const allowedMedia = target ? getEditorMediaByType(media, target.mediaType) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Pilih media dari library undangan atau unggah file baru untuk editor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-xl"
              disabled={isSaving}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="mr-2 size-4" />
              Upload Media
            </Button>
            <p className="text-xs text-slate-500">
              Mode saat ini: {target?.mediaType === 'video' ? 'Video MP4' : 'Image JPG/PNG/WEBP'}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={target?.mediaType === 'video' ? 'video/mp4' : 'image/*'}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                onUpload(file)
                event.target.value = ''
              }}
            />
          </div>
          <div className="grid max-h-[52vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
            {allowedMedia.map((item) => (
              <button
                key={item.id}
                type="button"
                className="overflow-hidden rounded-2xl border border-border/70 bg-slate-50 text-left"
                onClick={() => onPick(item.url)}
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {item.mediaType === 'video' ? (
                    <div className="grid size-full place-items-center bg-slate-900 text-xs text-white/70">
                      VIDEO
                    </div>
                  ) : (
                    <img
                      src={resolveApiAssetUrl(item.url)}
                      alt={item.fileName ?? 'Editor media'}
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-xs font-medium text-slate-900">
                    {item.fileName || item.id}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {item.mediaType}
                  </p>
                </div>
              </button>
            ))}
            {allowedMedia.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-slate-500">
                Media dengan tipe ini belum tersedia.
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditorElementFrame(props: {
  elementKey: string
  page: SapatamuEditorPage
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
  children: ReactNode
  frameStyle?: CSSProperties & Record<string, string | number | undefined>
  onSelectElement?: (elementKey: string) => void
}) {
  const { elementKey, page, selectedElement, invitationId, isEditing, children, frameStyle, onSelectElement } = props
  const navigate = useNavigate()

  if (!isEditing) {
    return (
      <div className="editor-element-target editor-element-readonly block w-full" style={frameStyle} data-editing="false" data-selected="false">
        {children}
      </div>
    )
  }

  return (
    <button
      type="button"
      className="editor-element-target block w-full"
      style={frameStyle}
      data-editing="true"
      data-selected={selectedElement === elementKey}
      onClick={() => {
        if (onSelectElement) {
          onSelectElement(elementKey)
          return
        }
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/products/sapatamu/templates/')) {
          const searchParams = new URLSearchParams(window.location.search)
          searchParams.set('element', elementKey)
          navigate({ pathname: window.location.pathname, search: searchParams.toString() }, { replace: true })
          return
        }
        updateQueryElement(navigate, invitationId, page.slug, elementKey)
      }}
    >
      {children}
    </button>
  )
}

function EditorRichText(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorTextElement
  selectedElement: string | null
  invitationLink: string
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  fontFamily?: string
  invitationId: string
  isEditing: boolean
  resolveTokens?: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationLink, documentValue, fontFamily, invitationId, isEditing, resolveTokens = true } = props
  const animationClass = getEditorAnimationClass(element.animation?.style)
  const displayContent = getEditorDisplayContent(element.content, documentValue, invitationLink, { resolveTokens })
  const paragraphs = splitEditorParagraphs(displayContent)
  const fontSize = `${element.size}px`
  const lineHeight = getPreviewLineHeight(element.lineHeight, element.size)
  const boxStyle = element.box.disabled
    ? undefined
    : {
        borderRadius: `${element.box.borderRadius}px`,
        background: `linear-gradient(${element.box.gradientAngle}deg, ${element.box.backgroundColor}, ${element.box.backgroundColor2})`,
      }

  const frameStyle = {
    '--el-x': `${element.padding.x ?? 0}px`,
    '--el-y': `${element.padding.y ?? 0}px`,
    position: 'relative' as const,
    zIndex: 1,
  }

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
      frameStyle={frameStyle}
    >
      <div
        className={`${animationClass} sapatamu-editor-text-content`}
        style={{
          paddingTop: element.padding.top,
          paddingBottom: element.padding.bottom,
          paddingLeft: element.padding.left ?? 0,
          paddingRight: element.padding.right ?? 0,
          textAlign: element.align,
          color: element.color,
          fontFamily,
          fontSize,
          lineHeight,
          ...getAnimationInlineStyle(element.animation?.duration),
          ...boxStyle,
        }}
      >
        {paragraphs.map((paragraph, index) => (
            <p
              key={`${elementKey}-${index}`}
              style={{
                color: element.color,
                fontFamily,
                fontSize,
                lineHeight,
                textAlign: element.align,
              }}
            >
              {paragraph}
            </p>
          ))}
      </div>
    </EditorElementFrame>
  )
}

function EditorButtonPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorButtonElement
  selectedElement: string | null
  invitationId: string
  fontFamily?: string
  isEditing: boolean
  onOpen?: () => void
  rsvpInitialName?: string
  onRsvpSubmitted?: (message: EditorGuestMessage) => void
  giftAccounts?: EditorGiftAccount[]
}) {
  const { page, elementKey, element, selectedElement, invitationId, fontFamily, isEditing, onOpen, rsvpInitialName, onRsvpSubmitted, giftAccounts = [] } = props
  const buttonFrameStyle = {
    '--el-x': `${element.padding.x ?? 0}px`,
    '--el-y': `${element.padding.y ?? 0}px`,
    position: 'relative' as const,
    zIndex: 1,
  }

  // Detect gift buttons by link scheme or content text
  const isGiftAngpao = !isEditing && (
    element.link?.startsWith('gift:angpao') ||
    /kirim\s*angpao/i.test(element.content)
  )
  const isGiftKado = !isEditing && (
    element.link?.startsWith('gift:kado') ||
    /kirim\s*kado/i.test(element.content)
  )
  const isGiftButton = isGiftAngpao || isGiftKado
  const isRsvpButton = !isEditing && (
    element.link?.startsWith('rsvp:') ||
    /kirim\s*(ucapan\s*)?\+?\s*rsvp/i.test(element.content) ||
    /konfirmasi.*rsvp/i.test(element.content)
  )
  const isOpenButton = !isEditing && Boolean(onOpen) && (
    element.link === '#open' ||
    /buka\s+undangan/i.test(stripEditorHtml(element.content)) ||
    (page.family === 'opening' && /open|undangan/i.test(stripEditorHtml(element.content)))
  )
  const [giftOpen, setGiftOpen] = useState<'angpao' | 'kado' | false>(false)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [rsvpForm, setRsvpForm] = useState({
    name: rsvpInitialName ?? '',
    phone: '',
    status: 'hadir',
    guests: '1',
    message: '',
  })
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [rsvpSaving, setRsvpSaving] = useState(false)

  useEffect(() => {
    setRsvpForm((current) => current.name ? current : { ...current, name: rsvpInitialName ?? '' })
  }, [rsvpInitialName])

  const submitRsvpFromButton = async () => {
    if (!rsvpForm.name.trim() || rsvpSaving) return
    setRsvpSaving(true)
    try {
      const { dataCreate } = await import('@/lib/api')
      await dataCreate('invitation-rsvps', {
        invitation_id: invitationId,
        guest_name: rsvpForm.name.trim(),
        phone_number: rsvpForm.phone || null,
        status: rsvpForm.status,
        attendees_count: Number(rsvpForm.guests),
        message: rsvpForm.message.trim() || null,
      })
      if (rsvpForm.message.trim()) {
        await dataCreate('invitation-greetings', {
          invitation_id: invitationId,
          guest_name: rsvpForm.name.trim(),
          message: rsvpForm.message.trim(),
          is_approved: true,
        })
        onRsvpSubmitted?.({
          id: `local-${Date.now()}`,
          guestName: rsvpForm.name.trim(),
          message: rsvpForm.message.trim(),
          createdAt: new Date().toISOString(),
        })
      }
      setRsvpSubmitted(true)
    } finally {
      setRsvpSaving(false)
    }
  }

  const buttonNode = (
    <div
      className={getEditorAnimationClass(element.animation?.style)}
      style={{
        paddingTop: element.padding.top + 6,
        paddingBottom: element.padding.bottom + 6,
        paddingLeft: (element.padding.left ?? 0) + 24,
        paddingRight: (element.padding.right ?? 0) + 24,
        borderRadius: element.borderRadius,
        border: `${element.borderSize}px solid ${element.borderColor}`,
        color: element.color,
        background: `linear-gradient(${element.gradientAngle}deg, ${element.backgroundColor}, ${element.backgroundColor2})`,
        fontFamily,
        fontSize: `${element.size}px`,
        ...getAnimationInlineStyle(element.animation?.duration),
      }}
    >
      {stripEditorHtml(element.content)}
    </div>
  )

  return (
    <>
      <EditorElementFrame
        page={page}
        elementKey={elementKey}
        selectedElement={selectedElement}
        invitationId={invitationId}
        isEditing={isEditing}
        frameStyle={buttonFrameStyle}
      >
        <div className="flex justify-center py-2">
          {isGiftButton ? (
            <button
              type="button"
              className="contents"
              onClick={(e) => { e.stopPropagation(); setGiftOpen(isGiftAngpao ? 'angpao' : 'kado') }}
            >
              {buttonNode}
            </button>
          ) : isRsvpButton ? (
            <button
              type="button"
              className="contents"
              onClick={(e) => { e.stopPropagation(); setRsvpOpen(true) }}
            >
              {buttonNode}
            </button>
          ) : isOpenButton && onOpen ? (
            <button
              type="button"
              className="contents"
              onClick={(e) => { e.stopPropagation(); onOpen() }}
            >
              {buttonNode}
            </button>
          ) : !isEditing && element.link ? (
            <a href={element.link} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
              {buttonNode}
            </a>
          ) : buttonNode}
        </div>
      </EditorElementFrame>

      {/* Gift Modal */}
      <Dialog open={giftOpen !== false} onOpenChange={(open) => { if (!open) setGiftOpen(false) }}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-0">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>{giftOpen === 'angpao' ? 'Kirim Angpao' : 'Kirim Kado'}</DialogTitle>
            <DialogDescription>
              {giftOpen === 'angpao' ? 'Transfer ke salah satu rekening berikut.' : 'Kirim kado ke alamat berikut.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {giftOpen === 'angpao' ? (
              <div className="space-y-3">
                {(giftAccounts.length ? giftAccounts : [{ bankName: 'Rekening belum diatur', accountNumber: '-', accountHolder: 'Atur di Manage Invitation' }]).map((account, index) => (
                  <div key={`${account.bankName ?? 'bank'}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">{account.bankName || 'Bank'}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{account.accountNumber || '-'}</p>
                    <p className="text-sm text-slate-600">{account.accountHolder ? `a.n. ${account.accountHolder}` : 'Nama pemilik belum diatur'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Alamat Pengiriman Kado</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Jl. Contoh Alamat No. 123, RT 01 / RW 02, Kelurahan, Kecamatan, Kota 12345
                </p>
                <p className="mt-2 text-xs text-slate-400">a.n. Mempelai</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rsvpOpen} onOpenChange={setRsvpOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-0">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>Kirim Ucapan & RSVP</DialogTitle>
            <DialogDescription>Isi konfirmasi dan ucapan untuk mempelai.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {rsvpSubmitted ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                <p className="text-lg font-semibold text-emerald-800">Terima kasih.</p>
                <p className="mt-2 text-sm text-emerald-700">Ucapan dan konfirmasi Anda sudah terkirim.</p>
              </div>
            ) : (
              <>
                <Input className="h-11 rounded-xl" value={rsvpForm.name} onChange={(event) => setRsvpForm((form) => ({ ...form, name: event.target.value }))} placeholder="Nama lengkap" />
                <Input className="h-11 rounded-xl" value={rsvpForm.phone} onChange={(event) => setRsvpForm((form) => ({ ...form, phone: event.target.value }))} placeholder="Nomor WhatsApp" />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['hadir', 'Hadir'],
                    ['tidak', 'Tidak'],
                    ['ragu', 'Ragu'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`h-10 rounded-xl border text-sm font-medium ${rsvpForm.status === value ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 text-slate-600'}`}
                      onClick={() => setRsvpForm((form) => ({ ...form, status: value }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={rsvpForm.guests} onChange={(event) => setRsvpForm((form) => ({ ...form, guests: event.target.value }))}>
                  {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} Orang</option>)}
                </select>
                <Textarea className="min-h-24 rounded-xl" value={rsvpForm.message} onChange={(event) => setRsvpForm((form) => ({ ...form, message: event.target.value }))} placeholder="Tulis ucapan dan doa..." />
                <Button type="button" className="h-11 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700" disabled={!rsvpForm.name.trim() || rsvpSaving} onClick={() => void submitRsvpFromButton()}>
                  {rsvpSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Kirim
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EditorImagePreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorImageElement
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationId, isEditing } = props
  const src = resolveApiAssetUrl(element.content)
  const frameSrc = element.frame?.disabled ? '' : resolveApiAssetUrl(element.frame?.content)

  const imgFrameStyle = {
    '--el-x': `${element.padding.x ?? 0}px`,
    '--el-y': `${element.padding.y ?? 0}px`,
    position: 'relative' as const,
    zIndex: 1,
  }

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
      frameStyle={imgFrameStyle}
    >
      <div 
        className="flex justify-center"
        style={{
          paddingTop: element.padding.top,
          paddingBottom: element.padding.bottom,
          paddingLeft: element.padding.left ?? 0,
          paddingRight: element.padding.right ?? 0,
        }}
      >
        <div
          className={`relative ${getEditorAnimationClass(element.animation?.style)}`}
          style={{
            width: element.size,
            height: element.size,
            ...getAnimationInlineStyle(element.animation?.duration),
          }}
        >
          {frameSrc ? (
            <img
              src={frameSrc}
              alt=""
              className="pointer-events-none absolute inset-0 z-10 size-full scale-125 object-contain"
            />
          ) : null}
          <div
            className="relative z-0 size-full overflow-hidden"
            style={{
              borderRadius: element.borderRadius,
              border: `${element.borderSize}px solid ${element.borderColor}`,
              background: src ? 'transparent' : 'rgba(255,255,255,0.1)',
            }}
          >
          {src ? (
            <img src={src} alt={elementKey} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xs text-white/70">IMAGE</div>
          )}
          </div>
        </div>
      </div>
    </EditorElementFrame>
  )
}

function EditorGalleryPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorGalleryElement
  selectedElement: string | null
  invitationId: string
  fallbackImages: string[]
  onOpenLightbox: (index: number) => void
  isEditing: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationId, fallbackImages, onOpenLightbox, isEditing } = props
  const items = (element.items.length ? element.items : fallbackImages).slice(0, 9)
  const variant = element.variant ?? 'bento-feature-left'

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
    >
      <div className="space-y-4 py-4">
        <p className="text-center text-lg font-semibold">{element.title}</p>
        <div
          className={`sapatamu-gallery-bento sapatamu-gallery-bento-${variant}`}
        >
          {items.map((item, index) => (
            <button
              key={`${elementKey}-${index}`}
              type="button"
              className="overflow-hidden rounded-2xl bg-white/12"
              onClick={(event) => {
                event.stopPropagation()
                onOpenLightbox(index)
              }}
            >
              <img
                src={resolveApiAssetUrl(item)}
                alt={`Gallery ${index + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </EditorElementFrame>
  )
}

function EditorVideoPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorVideoElement
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationId, isEditing } = props
  const videoUrl = element.provider === 'file' ? resolveApiAssetUrl(element.url) : element.url

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
    >
      <div className="space-y-4 py-4">
        <p className="text-center text-lg font-semibold">{element.title}</p>
        <div className="overflow-hidden rounded-3xl bg-black/25">
          {videoUrl ? (
            <ReactPlayer
              src={videoUrl}
              width="100%"
              height="240px"
              controls
              muted
              playing={false}
            />
          ) : (
            <div className="grid h-[240px] place-items-center text-sm text-white/70">
              Tambahkan video
            </div>
          )}
        </div>
      </div>
    </EditorElementFrame>
  )
}

function EditorSimpleCardPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element:
    | SapatamuEditorRsvpElement
    | SapatamuEditorGiftElement
    | SapatamuEditorStoryElement
    | { type: 'sponsor' | 'credit'; title: string; description: string; animation: { style: number; duration?: number }; items?: ContactItem[] }
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
  rsvpMessages?: EditorGuestMessage[]
  palette?: SapatamuEditorDocumentV3['editor']['colorPalette']
}) {
  const { page, elementKey, element, selectedElement, invitationId, isEditing, rsvpMessages = [], palette } = props
  const isRsvp = element.type === 'rsvp'
  const isStory = element.type === 'story'
  const isGift = element.type === 'gift'
  const isCredit = element.type === 'credit'
  const storyElement = isStory ? element as SapatamuEditorStoryElement : null
  const [storyOpen, setStoryOpen] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)
  const storyItems = storyElement?.items ?? []
  const activeStory = storyItems[Math.min(storyIndex, Math.max(storyItems.length - 1, 0))]
  const storyButtonLabel = storyElement?.buttonLabel || 'Lihat Perjalanan Cinta Kami'
  const moveStory = (direction: -1 | 1) => {
    if (!storyItems.length) return
    setStoryIndex((current) => (current + direction + storyItems.length) % storyItems.length)
  }

  if (isGift) return null

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
    >
      <div
        className={`${isStory || isCredit ? 'space-y-3 px-5 py-5' : 'space-y-3 rounded-3xl px-5 py-5 editor-preview-glass'} ${getEditorAnimationClass(
          element.animation?.style,
        )}`}
        style={getAnimationInlineStyle(getAnimationDuration(element.animation))}
      >
        {isCredit ? (
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold">Sapatamu by Rekavia</p>
            <img src="/brand-logo.png" alt="Rekavia" className="mx-auto h-7 w-auto object-contain" />
          </div>
        ) : (
          <p className="text-lg font-semibold">{element.title}</p>
        )}
        {element.type === 'sponsor' && Array.isArray(element.items) ? (
          <div className="space-y-4 text-center">
            {(element.items as ContactItem[]).map((item, index) => (
              <div key={`${elementKey}-${index}`} className="flex flex-col items-center gap-2">
                {item.photoUrl ? (
                  <img
                    src={resolveApiAssetUrl(item.photoUrl)}
                    alt={item.name ?? ''}
                    className="size-20 rounded-full border-2 border-white/40 object-cover"
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-full bg-white/20">
                    <ImagePlus className="size-7 opacity-50" />
                  </div>
                )}
                <p className="font-semibold">{item.name || 'Nama Mempelai'}</p>
                {item.phone ? (
                  <a
                    href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-sm transition hover:bg-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.phone}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : isStory && storyElement ? (
          <div className="space-y-4 text-center">
            <button
              type="button"
              className="inline-flex rounded-full border border-white/30 px-5 py-2 text-sm font-semibold transition hover:bg-white/20 active:scale-95"
              onClick={(event) => {
                event.stopPropagation()
                if (!isEditing) setStoryOpen(true)
              }}
            >
              {storyButtonLabel}
            </button>
          </div>
        ) : isRsvp ? (
          <div className="mt-2 space-y-2 text-left">
            {(rsvpMessages.length ? rsvpMessages.slice(0, 5) : [
              { id: 'empty-rsvp-message', guestName: 'Belum ada ucapan', message: 'Ucapan tamu akan tampil di sini setelah mereka mengisi form.', createdAt: '' },
            ]).map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border px-4 py-3"
                style={{
                  borderColor: palette?.accentSoft ?? 'rgba(255,255,255,0.16)',
                  backgroundColor: palette?.surface ?? 'rgba(255,255,255,0.1)',
                  color: palette?.text ?? 'inherit',
                }}
              >
                <p className="text-sm font-semibold">{message.guestName}</p>
                <p className="mt-1 text-xs leading-5 opacity-80">{message.message}</p>
              </div>
            ))}
          </div>
        ) : isCredit ? null : (
          <p className="text-sm opacity-90">{element.description}</p>
        )}
        {!isRsvp && !isStory && 'buttonLabel' in element ? (
          <div
            role="presentation"
            className="inline-flex rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white/20 active:scale-95"
            aria-label={String(element.buttonLabel)}
          >
            {String(element.buttonLabel)}
          </div>
        ) : null}
      </div>

      {isStory && storyElement ? (
        <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-0">
            <DialogHeader className="border-b px-6 py-5">
              <DialogTitle>{storyElement.title}</DialogTitle>
              <DialogDescription>{storyItems.length ? `${storyIndex + 1} dari ${storyItems.length}` : 'Belum ada cerita'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-6 text-slate-900">
              {activeStory ? (
                <>
                  {activeStory.image ? (
                    <img src={resolveApiAssetUrl(activeStory.image)} alt={activeStory.title} className="h-44 w-full rounded-2xl object-cover" />
                  ) : null}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-lg font-semibold">{activeStory.title || 'Cerita'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{activeStory.date || 'Tanggal fleksibel'}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{activeStory.description || 'Deskripsi cerita belum diisi.'}</p>
                  </div>
                  {storyItems.length > 1 ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={() => moveStory(-1)}>
                        Sebelumnya
                      </Button>
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={() => moveStory(1)}>
                        Berikutnya
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  Tambahkan cerita di panel manajemen love story.
                </div>
              )}
              <Button type="button" className="w-full rounded-2xl" onClick={() => setStoryOpen(false)}>
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </EditorElementFrame>
  )
}

function EditorMapPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorMapElement
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationId, isEditing } = props
  const mapElement = element as EditableMapElement
  const mode = mapElement.mode ?? 'google-map'
  const [resolvedMapUrl, setResolvedMapUrl] = useState('')
  const [isResolvingMapUrl, setIsResolvingMapUrl] = useState(false)
  const isShortMapUrl = isGoogleMapsShortUrl(element.url)
  const embedUrl = getGoogleMapEmbedUrl(resolvedMapUrl || element.url)

  useEffect(() => {
    const sourceUrl = element.url.trim()
    if (!isGoogleMapsShortUrl(sourceUrl)) {
      setResolvedMapUrl('')
      setIsResolvingMapUrl(false)
      return
    }

    let isCancelled = false
    setIsResolvingMapUrl(true)
    setResolvedMapUrl('')

    void resolveGoogleMapsShareUrl(sourceUrl)
      .then((url) => {
        if (!isCancelled) setResolvedMapUrl(url)
      })
      .catch(() => {
        if (!isCancelled) setResolvedMapUrl('')
      })
      .finally(() => {
        if (!isCancelled) setIsResolvingMapUrl(false)
      })

    return () => {
      isCancelled = true
    }
  }, [element.url])

  if (mode === 'hidden') return null

  const mapFrameStyle = {
    '--el-x': `${element.padding.x ?? 0}px`,
    '--el-y': `${element.padding.y ?? 0}px`,
    position: 'relative' as const,
    zIndex: 1,
  }

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
      frameStyle={mapFrameStyle}
    >
      <div
        className={`overflow-hidden ${getEditorAnimationClass(element.animation?.style)}`}
        style={{
          paddingTop: element.padding.top,
          paddingBottom: element.padding.bottom,
          paddingLeft: element.padding.left ?? 0,
          paddingRight: element.padding.right ?? 0,
          border: `${mapElement.borderSize ?? 2}px solid ${element.color}`,
          borderRadius: mapElement.borderRadius ?? 24,
          background: element.backgroundColor,
          ...getAnimationInlineStyle(element.animation?.duration),
        }}
      >
        <div
          className="grid place-items-center overflow-hidden rounded-[inherit] bg-white/10 text-sm"
          style={{ height: element.size }}
        >
          {mode === 'google-map' && embedUrl ? (
            <iframe
              title={element.content || 'Google Map'}
              src={embedUrl}
              className="size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}
          {mode === 'google-map' && !embedUrl ? (
            <div className="px-6 text-center text-white/80">
              {isShortMapUrl && isResolvingMapUrl
                ? 'Memuat link share Google Maps...'
                : element.url
                  ? 'Link share Google Maps belum bisa dibaca. Coba tempel ulang link share atau gunakan URL Google Maps lengkap.'
                  : 'Tambahkan link Google Maps'}
            </div>
          ) : null}
          {mode === 'qr-code' ? (
            <div className="grid size-40 place-items-center rounded-2xl bg-white text-xs font-semibold text-slate-500">
              QR CODE
            </div>
          ) : null}
          {mode === 'image' ? (
            mapElement.imageUrl ? (
              <img src={resolveApiAssetUrl(mapElement.imageUrl)} alt="Map" className="size-full object-cover" />
            ) : (
              <div className="px-6 text-center text-white/80">Pilih gambar maps dari media.</div>
            )
          ) : null}
        </div>
        {mode === 'google-map' && element.url ? (
          <a
            href={element.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-full border border-white/25 bg-black/15 px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-black/25"
            onClick={(event) => event.stopPropagation()}
          >
            Buka Google Maps
          </a>
        ) : null}
      </div>
    </EditorElementFrame>
  )
}

function EditorTimerPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorTimerElement
  selectedElement: string | null
  invitationId: string
  isEditing: boolean
}) {
  const { page, elementKey, element, selectedElement, invitationId, isEditing } = props
  const [now, setNow] = useState(() => Date.now())
  const parts = getCountdownParts(element.content, now)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const timerFrameStyle = {
    '--el-x': `${element.padding.x ?? 0}px`,
    '--el-y': `${element.padding.y ?? 0}px`,
    position: 'relative' as const,
    zIndex: 1,
  }

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
      isEditing={isEditing}
      frameStyle={timerFrameStyle}
    >
      <div
        className={`rounded-3xl px-6 text-center ${getEditorAnimationClass(element.animation?.style)}`}
        style={{
          border: `${element.borderSize}px solid ${element.borderColor}`,
          borderRadius: element.borderRadius,
          background: `linear-gradient(${element.gradientAngle}deg, ${element.backgroundColor}, ${element.backgroundColor2})`,
          paddingTop: element.padding.top,
          paddingBottom: element.padding.bottom,
          paddingLeft: element.padding.left ?? 0,
          paddingRight: element.padding.right ?? 0,
          ...getAnimationInlineStyle(element.animation?.duration),
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {parts.map((part) => (
            <div key={part.label} className="rounded-2xl bg-white/10 px-2 py-3">
              <p style={{ fontSize: `${element.size1}px`, color: element.color1, lineHeight: 1.05 }}>
                {padCountdown(part.value)}
              </p>
              <p style={{ fontSize: `${element.size2}px`, color: element.color2 }}>{part.label}</p>
            </div>
          ))}
        </div>
      </div>
    </EditorElementFrame>
  )
}

function BackgroundHeroPhoto(props: {
  url?: string
  fallbackUrl?: string
  label: string
}) {
  const imageUrl = props.url || props.fallbackUrl || ''

  return (
    <div className="sapatamu-background-hero-photo">
      {imageUrl ? (
        <img src={resolveApiAssetUrl(imageUrl)} alt={props.label} className="size-full object-cover" />
      ) : (
        <ImagePlus className="size-8 text-white/70" />
      )}
    </div>
  )
}

function BackgroundHeroEditableItem(props: {
  elementKey: BackgroundHeroElementKey
  isEditing: boolean
  isSelected: boolean
  onSelect?: (elementKey: BackgroundHeroElementKey) => void
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const className = `sapatamu-background-hero-target ${props.className ?? ''}`

  if (!props.isEditing) {
    return <div className={className} style={props.style}>{props.children}</div>
  }

  return (
    <button
      type="button"
      className={className}
      style={props.style}
      data-editing="true"
      data-selected={props.isSelected}
      onClick={(event) => {
        event.stopPropagation()
        props.onSelect?.(props.elementKey)
      }}
    >
      {props.children}
    </button>
  )
}

export function BackgroundHeroOverlay(props: {
  hero: BackgroundHeroSettings
  fallbackImages: string[]
  isEditing?: boolean
  selectedElement?: BackgroundHeroElementKey | null
  onSelect?: (elementKey: BackgroundHeroElementKey) => void
}) {
  const { hero, fallbackImages, isEditing = false, selectedElement = null, onSelect } = props
  const left = hero.left ?? {}
  const right = hero.right ?? {}

  return (
    <div className="pointer-events-none absolute inset-0 z-[8]">
      <div className="sapatamu-background-hero-side sapatamu-background-hero-left">
        {left.photo?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="left.photo"
            isEditing={isEditing}
            isSelected={selectedElement === 'left.photo'}
            onSelect={onSelect}
            style={getHeroItemStyle(left.photo)}
          >
            <BackgroundHeroPhoto url={left.photo.url} fallbackUrl={fallbackImages[0]} label="Pengantin kiri" />
          </BackgroundHeroEditableItem>
        ) : null}
        {left.subTitle?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="left.subTitle"
            isEditing={isEditing}
            isSelected={selectedElement === 'left.subTitle'}
            onSelect={onSelect}
            style={getHeroItemStyle(left.subTitle)}
          >
            <p className="sapatamu-background-hero-subtitle">
              {getHeroText(left.subTitle.text, 'the wedding of')}
            </p>
          </BackgroundHeroEditableItem>
        ) : null}
        {left.title?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="left.title"
            isEditing={isEditing}
            isSelected={selectedElement === 'left.title'}
            onSelect={onSelect}
            style={getHeroItemStyle(left.title)}
          >
            <p className="sapatamu-background-hero-title">
              {getHeroText(left.title.text, 'Ryan & Nanda')}
            </p>
          </BackgroundHeroEditableItem>
        ) : null}
        {left.description?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="left.description"
            isEditing={isEditing}
            isSelected={selectedElement === 'left.description'}
            onSelect={onSelect}
            style={getHeroItemStyle(left.description)}
          >
            <p className="sapatamu-background-hero-description">
              {getHeroText(left.description.text, '#ryandannanda')}
            </p>
          </BackgroundHeroEditableItem>
        ) : null}
      </div>

      <div className="sapatamu-background-hero-side sapatamu-background-hero-right">
        {right.photo?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="right.photo"
            isEditing={isEditing}
            isSelected={selectedElement === 'right.photo'}
            onSelect={onSelect}
            style={getHeroItemStyle(right.photo)}
          >
            <BackgroundHeroPhoto url={right.photo.url} fallbackUrl={fallbackImages[1] ?? fallbackImages[0]} label="Pengantin kanan" />
          </BackgroundHeroEditableItem>
        ) : null}
        {right.title?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="right.title"
            isEditing={isEditing}
            isSelected={selectedElement === 'right.title'}
            onSelect={onSelect}
            style={getHeroItemStyle(right.title)}
          >
            <p className="sapatamu-background-hero-title">
              {getHeroText(right.title.text, '24 Januari 2027')}
            </p>
          </BackgroundHeroEditableItem>
        ) : null}
        {right.description?.enabled ? (
          <BackgroundHeroEditableItem
            elementKey="right.description"
            isEditing={isEditing}
            isSelected={selectedElement === 'right.description'}
            onSelect={onSelect}
            style={getHeroItemStyle(right.description)}
          >
            <p className="sapatamu-background-hero-description">
              {getHeroText(right.description.text, 'engkaulah jantungku')}
            </p>
          </BackgroundHeroEditableItem>
        ) : null}
      </div>

      {right.music?.enabled ? (
        <div className="sapatamu-background-hero-music-anchor">
          <BackgroundHeroEditableItem
            elementKey="right.music"
            isEditing={isEditing}
            isSelected={selectedElement === 'right.music'}
            onSelect={onSelect}
            style={getHeroItemStyle(right.music)}
          >
            <p className="sapatamu-background-hero-music">
            {getHeroText(right.music.text, 'Judul musik')}
            </p>
          </BackgroundHeroEditableItem>
        </div>
      ) : null}
    </div>
  )
}

export function PreviewPage(props: {
  page: SapatamuEditorPage
  invitationId: string
  selectedElement: string | null
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  invitationLink: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  fallbackImages: string[]
  onOpenLightbox: (index: number) => void
  isEditing: boolean
  onOpen?: () => void
  rsvpInitialName?: string
  rsvpMessages?: EditorGuestMessage[]
  onRsvpSubmitted?: (message: EditorGuestMessage) => void
  giftAccounts?: EditorGiftAccount[]
  resolveTokens?: boolean
}) {
  const { page, invitationId, selectedElement, documentValue, invitationLink, fonts, fallbackImages, onOpenLightbox, isEditing, onOpen, rsvpInitialName, rsvpMessages = [], onRsvpSubmitted, giftAccounts = [], resolveTokens = true } = props
  const themeId = documentValue?.editor.colorPalette.themeId
  const isSourceTheme = isSourceThemePreview(themeId, page.layoutCode)
  const sourceThemeClass = isSourceTheme && themeId ? ` sapatamu-theme-${themeId.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}` : ''

  const globalBackground = documentValue?.editor.globalBackground ?? null
  const pageBackground = getPageBackground(page, null)
  const background = isSourceTheme ? pageBackground || globalBackground : globalBackground || pageBackground
  const backgroundDetails = isSourceTheme || pageBackground
    ? page.data.backgroundDetails
    : documentValue?.editor.globalBackgroundDetails ?? page.data.backgroundDetails
  const backgroundType = backgroundDetails.type === 'video' ? 'video' : background ? 'image' : backgroundDetails.type
  const backgroundStyle =
    backgroundType === 'color'
      ? {
          background: `linear-gradient(180deg, ${backgroundDetails.gradient.from}, ${backgroundDetails.gradient.to})`,
        }
      : backgroundType === 'image' && background
        ? {
            backgroundImage: `url(${resolveApiAssetUrl(background)})`,
            backgroundSize: isSourceTheme ? 'contain' : 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }
        : {
            background: `linear-gradient(180deg, ${backgroundDetails.gradient.from}, ${backgroundDetails.gradient.to})`,
          }

  const overlayStyle = {
    background: backgroundDetails.gradient.disabled
      ? parseHexToRgba(backgroundDetails.color, backgroundDetails.opacity)
      : `linear-gradient(180deg, ${parseHexToRgba(backgroundDetails.gradient.from, backgroundDetails.opacity)}, ${parseHexToRgba(backgroundDetails.gradient.to, backgroundDetails.opacity)})`,
    mixBlendMode: backgroundDetails.blend.disabled ? 'normal' : (backgroundDetails.blend.mode as CSSProperties['mixBlendMode']),
  }

  const pageKeys = listPageEditableKeys(page)

  return (
    <div
      className={`sapatamu-editor-page sapatamu-editor-surface-grid relative overflow-hidden rounded-[32px] px-6 py-10 text-center${isSourceTheme ? ` sapatamu-premium1-page sapatamu-source-theme-page${sourceThemeClass}` : ''}`}
      style={backgroundStyle}
    >
      {backgroundType === 'video' && background ? (
        <div className="absolute inset-0 [&_video]:!object-cover [&_video]:!h-full [&_video]:!w-full">
          <ReactPlayer
            src={resolveApiAssetUrl(background)}
            width="100%"
            height="100%"
            muted
            loop
            playing
            playsInline
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : null}
      <div className="absolute inset-0" style={overlayStyle} />
      {isSourceTheme ? <Premium1CornerOrnaments corners={page.data.cornerElements?.list ?? []} /> : null}
      <div className={`relative z-10 mx-auto flex max-w-[520px] flex-col gap-3${isSourceTheme ? ' sapatamu-premium1-content sapatamu-source-theme-content' : ''}`}>
        {pageKeys.map((key) => {
          const candidate = getEditableElement(page, key)
          if (!candidate || candidate.disabled) return null
          // On 'doa' pages, skip RSVP elements — prayer section should not include attendance form
          if (candidate.type === 'rsvp' && page.family === 'doa') return null

          switch (candidate.type) {
            case 'text':
              return (
                <EditorRichText
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorTextElement}
                  selectedElement={selectedElement}
                  invitationLink={invitationLink}
                  documentValue={documentValue}
                  fontFamily={findFontName(fonts, (candidate as SapatamuEditorTextElement).font)}
                  invitationId={invitationId}
                  isEditing={isEditing}
                  resolveTokens={resolveTokens}
                />
              )
            case 'button':
            case 'url':
              return (
                <EditorButtonPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorButtonElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  fontFamily={findFontName(fonts, (candidate as SapatamuEditorButtonElement).font)}
                  isEditing={isEditing}
                  onOpen={onOpen}
                  rsvpInitialName={rsvpInitialName}
                  onRsvpSubmitted={onRsvpSubmitted}
                  giftAccounts={giftAccounts}
                />
              )
            case 'image':
              return (
                <EditorImagePreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorImageElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'gallery':
              return (
                <EditorGalleryPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorGalleryElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  fallbackImages={fallbackImages}
                  onOpenLightbox={onOpenLightbox}
                  isEditing={isEditing}
                />
              )
            case 'video':
              return (
                <EditorVideoPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorVideoElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'rsvp':
              return (
                <EditorSimpleCardPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorRsvpElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                  rsvpMessages={rsvpMessages}
                  palette={documentValue?.editor.colorPalette}
                />
              )
            case 'gift':
              return (
                <EditorSimpleCardPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorGiftElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'story':
              return (
                <EditorSimpleCardPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorStoryElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'map':
              return (
                <EditorMapPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorMapElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'timer':
              return (
                <EditorTimerPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as SapatamuEditorTimerElement}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            case 'line':
              {
                const lineElement = candidate as SapatamuEditorLineElement
                const lineSrc = resolveApiAssetUrl(lineElement.content)
                return (
                  <div key={key} className="py-3">
                    <EditorElementFrame
                      page={page}
                      elementKey={key}
                      selectedElement={selectedElement}
                      invitationId={invitationId}
                      isEditing={isEditing}
                    >
                      {lineSrc ? (
                        <img
                          src={lineSrc}
                          alt=""
                          className={`mx-auto object-contain ${getEditorAnimationClass(lineElement.animation?.style)}`}
                          style={{
                            width: lineElement.size,
                            maxWidth: '80%',
                            ...getAnimationInlineStyle(lineElement.animation?.duration),
                          }}
                        />
                      ) : (
                        <div className="mx-auto h-px max-w-[220px] bg-white/60" />
                      )}
                    </EditorElementFrame>
                  </div>
                )
              }
            case 'sponsor':
            case 'credit':
              return (
                <EditorSimpleCardPreview
                  key={key}
                  page={page}
                  elementKey={key}
                  element={candidate as { type: 'sponsor' | 'credit'; title: string; description: string; animation: { style: number } }}
                  selectedElement={selectedElement}
                  invitationId={invitationId}
                  isEditing={isEditing}
                />
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

function Premium1CornerOrnaments(props: { corners: SapatamuEditorCornerElement[] }) {
  const activeCorners = props.corners.filter((corner) => !corner.disabled && corner.url)

  if (!activeCorners.length) return null

  return (
    <div className="sapatamu-premium1-corners" aria-hidden="true">
      {activeCorners.map((corner) => (
        <img
          key={corner.type}
          src={resolveApiAssetUrl(corner.url)}
          alt=""
          className={`sapatamu-premium1-ornament sapatamu-premium1-ornament-${corner.type.replace('_', '-')} ${getEditorAnimationClass(corner.animation.style)}`}
          style={{ animationDuration: `${corner.animation.duration}s` }}
        />
      ))}
    </div>
  )
}

function ControlRow(props: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{props.label}</Label>
      {props.children}
    </div>
  )
}

function InspectorSection(props: { title?: string; children: ReactNode }) {
  return (
    <div className="border-b border-dashed border-slate-200 px-5 py-5 last:border-b-0">
      {props.title ? <p className="mb-3 text-sm font-medium text-slate-500">{props.title}</p> : null}
      <div className="space-y-4">{props.children}</div>
    </div>
  )
}

function ColorField(props: { value: string; onChange: (value: string) => void }) {
  const value = props.value || '#FFFFFF'

  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-2">
      <input
        type="color"
        value={value.slice(0, 7)}
        onChange={(event) => props.onChange(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
      <Input
        value={value}
        onChange={(event) => props.onChange(event.target.value)}
        className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

function NumberField(props: {
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  max?: number
  step?: number
}) {
  const step = props.step ?? 1
  const clamp = (nextValue: number) => {
    const withMin = props.min === undefined ? nextValue : Math.max(props.min, nextValue)
    return props.max === undefined ? withMin : Math.min(props.max, withMin)
  }

  return (
    <div className="flex h-11 items-center rounded-full border border-slate-200 bg-white px-2">
      <button
        type="button"
        className="grid size-7 place-items-center rounded-md border border-slate-200 text-slate-400"
        onClick={() => props.onChange(clamp(Number(props.value || 0) - step))}
      >
        -
      </button>
      <Input
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        step={step}
        onChange={(event) => props.onChange(clamp(Number(event.target.value)))}
        className="h-8 border-0 bg-transparent text-center shadow-none focus-visible:ring-0"
      />
      {props.suffix ? <span className="min-w-7 text-sm text-slate-900">{props.suffix}</span> : null}
      <button
        type="button"
        className="grid size-7 place-items-center rounded-md border border-slate-200 text-slate-400"
        onClick={() => props.onChange(clamp(Number(props.value || 0) + step))}
      >
        +
      </button>
    </div>
  )
}

function SliderField(props: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="grid grid-cols-[1fr_80px] items-center gap-4">
      <input
        type="range"
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
        className="sapatamu-editor-range"
      />
      <div className="text-right text-base font-medium text-slate-900">
        {props.value}
        {props.suffix ? <span className="ml-2 text-sm">{props.suffix}</span> : null}
      </div>
    </div>
  )
}

function SelectField(props: {
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <select
      className="h-12 w-full rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-900 shadow-sm outline-none focus:border-accent"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    >
      {props.children}
    </select>
  )
}

function AnimationControls(props: {
  style: number
  duration: number
  onStyleChange: (value: number) => void
  onDurationChange: (value: number) => void
}) {
  return (
    <>
      <InspectorSection title="Animation">
        <div className="grid grid-cols-3 gap-3">
          {ANIMATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`sapatamu-animation-choice ${props.style === option.value ? 'is-active' : ''}`}
              onClick={() => props.onStyleChange(option.value)}
            >
              <ImagePlus className="size-7" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </InspectorSection>
      <InspectorSection title="Speed">
        <SliderField
          value={props.duration}
          min={0.5}
          max={8}
          step={0.5}
          suffix="s"
          onChange={props.onDurationChange}
        />
      </InspectorSection>
    </>
  )
}

function PaddingControls(props: {
  elementKey: string
  padding: SapatamuEditorPadding
  onPageField: (path: string, value: unknown) => void
}) {
  return (
    <InspectorSection title="Posisi & Spasi">
      <div className="flex flex-col gap-4">
        <ControlRow label="Posisi X">
          <SliderField value={props.padding.x ?? 0} min={-500} max={500} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.x`, v)} />
        </ControlRow>
        <ControlRow label="Posisi Y">
          <SliderField value={props.padding.y ?? 0} min={-500} max={500} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.y`, v)} />
        </ControlRow>
        <ControlRow label="Lebar Kiri">
          <SliderField value={props.padding.left ?? 0} min={0} max={300} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.left`, v)} />
        </ControlRow>
        <ControlRow label="Lebar Kanan">
          <SliderField value={props.padding.right ?? 0} min={0} max={300} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.right`, v)} />
        </ControlRow>
        <ControlRow label="Spasi Atas">
          <SliderField value={props.padding.top} min={0} max={500} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.top`, v)} />
        </ControlRow>
        <ControlRow label="Spasi Bawah">
          <SliderField value={props.padding.bottom} min={0} max={500} suffix="px" onChange={(v) => props.onPageField(`data.${props.elementKey}.padding.bottom`, v)} />
        </ControlRow>
      </div>
    </InspectorSection>
  )
}

function InspectorTextControls(props: {
  element: SapatamuEditorTextElement
  elementKey: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, fonts, onPageField } = props
  const handleSizeChange = (value: number) => {
    onPageField(`data.${elementKey}.size`, value)
    onPageField(`data.${elementKey}.lineHeight`, getNextTextLineHeight(element.size, element.lineHeight, value))
  }

  return (
    <div>
      <InspectorSection title="Text">
        <Textarea
          className="min-h-28 rounded-3xl border-slate-200 bg-white px-5 py-4 text-base shadow-sm"
          value={getEditorPlainTextInputValue(element.content)}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" className="rounded-lg bg-blue-50 text-slate-500">
            {'{T} Variabel'}
          </Button>
          <div className="flex gap-2">
            {['B', 'I', 'U'].map((label) => (
              <button
                key={label}
                type="button"
                className="grid size-10 place-items-center rounded-lg bg-blue-50 font-semibold text-slate-500"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Ukuran">
        <SliderField
          value={element.size}
          min={8}
          max={80}
          suffix="px"
          onChange={handleSizeChange}
        />
      </InspectorSection>

      <InspectorSection>
        <ControlRow label="Font Selected">
          <SelectField
            value={element.font}
            onChange={(value) => onPageField(`data.${elementKey}.font`, value)}
          >
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </SelectField>
        </ControlRow>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Font Color">
            <ColorField value={element.color} onChange={(value) => onPageField(`data.${elementKey}.color`, value)} />
          </ControlRow>
          <ControlRow label="Font Size">
            <NumberField
              value={element.size}
              suffix="px"
              min={1}
              onChange={handleSizeChange}
            />
          </ControlRow>
        </div>
        <ControlRow label="Line Height">
          <NumberField
            value={element.lineHeight}
            min={0.5}
            step={0.1}
            onChange={(value) => onPageField(`data.${elementKey}.lineHeight`, value)}
          />
        </ControlRow>
      </InspectorSection>

      <InspectorSection title="Text Box">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Published</span>
          <Switch
            checked={!element.box.disabled}
            onCheckedChange={(checked) => onPageField(`data.${elementKey}.box.disabled`, !checked)}
          />
        </div>
        <ControlRow label="Rounded edge">
          <SliderField
            value={element.box.borderRadius}
            suffix="px"
            min={0}
            max={120}
            onChange={(value) => onPageField(`data.${elementKey}.box.borderRadius`, value)}
          />
        </ControlRow>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Text Box Color 1">
            <ColorField
              value={element.box.backgroundColor}
              onChange={(value) => onPageField(`data.${elementKey}.box.backgroundColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Text Box Color 2">
            <ColorField
              value={element.box.backgroundColor2}
              onChange={(value) => onPageField(`data.${elementKey}.box.backgroundColor2`, value)}
            />
          </ControlRow>
        </div>
        <ControlRow label="Arah Gradasi">
          <NumberField
            value={element.box.gradientAngle}
            suffix="deg"
            onChange={(value) => onPageField(`data.${elementKey}.box.gradientAngle`, value)}
          />
        </ControlRow>
      </InspectorSection>

      <PaddingControls
        elementKey={elementKey}
        padding={element.padding}
        onPageField={onPageField}
      />
      <InspectorSection>
        <div className="grid grid-cols-3 gap-3">
          {TEXT_ALIGN_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`sapatamu-align-choice ${element.align === option ? 'is-active' : ''}`}
              onClick={() => onPageField(`data.${elementKey}.align`, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </InspectorSection>
      <AnimationControls
        style={element.animation.style}
        duration={element.animation.duration}
        onStyleChange={(value) => onPageField(`data.${elementKey}.animation.style`, value)}
        onDurationChange={(value) => onPageField(`data.${elementKey}.animation.duration`, value)}
      />
    </div>
  )
}

function InspectorButtonControls(props: {
  element: SapatamuEditorButtonElement
  elementKey: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, fonts, onPageField } = props

  return (
    <div>
      <InspectorSection title="Button">
        <Input
          className={INPUT_CLASS}
          value={getEditorPlainTextInputValue(element.content)}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
        <ControlRow label="Link">
          <Input
            className={INPUT_CLASS}
            value={element.link}
            onChange={(event) => onPageField(`data.${elementKey}.link`, event.target.value)}
          />
        </ControlRow>
      </InspectorSection>
      <InspectorSection>
        <ControlRow label="Font Selected">
          <SelectField
            value={element.font}
            onChange={(value) => onPageField(`data.${elementKey}.font`, value)}
          >
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </SelectField>
        </ControlRow>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Font Color">
            <ColorField value={element.color} onChange={(value) => onPageField(`data.${elementKey}.color`, value)} />
          </ControlRow>
          <ControlRow label="Font Size">
            <NumberField
              value={element.size}
              suffix="px"
              min={1}
              onChange={(value) => onPageField(`data.${elementKey}.size`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <InspectorSection title="Button Box">
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Button Color 1">
            <ColorField
              value={element.backgroundColor}
              onChange={(value) => onPageField(`data.${elementKey}.backgroundColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Button Color 2">
            <ColorField
              value={element.backgroundColor2}
              onChange={(value) => onPageField(`data.${elementKey}.backgroundColor2`, value)}
            />
          </ControlRow>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Radius Sudut">
            <NumberField
              value={element.borderRadius}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderRadius`, value)}
            />
          </ControlRow>
          <ControlRow label="Gradient">
            <NumberField
              value={element.gradientAngle}
              suffix="deg"
              onChange={(value) => onPageField(`data.${elementKey}.gradientAngle`, value)}
            />
          </ControlRow>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Warna Garis Tepi">
            <ColorField
              value={element.borderColor}
              onChange={(value) => onPageField(`data.${elementKey}.borderColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Ukuran Garis Tepi">
            <NumberField
              value={element.borderSize}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderSize`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <PaddingControls
        elementKey={elementKey}
        padding={element.padding}
        onPageField={onPageField}
      />
      <InspectorSection>
        <div className="grid grid-cols-3 gap-3">
          {TEXT_ALIGN_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`sapatamu-align-choice ${element.align === option ? 'is-active' : ''}`}
              onClick={() => onPageField(`data.${elementKey}.align`, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </InspectorSection>
      <AnimationControls
        style={element.animation.style}
        duration={element.animation.duration}
        onStyleChange={(value) => onPageField(`data.${elementKey}.animation.style`, value)}
        onDurationChange={(value) => onPageField(`data.${elementKey}.animation.duration`, value)}
      />
    </div>
  )
}

function InspectorImageControls(props: {
  element: SapatamuEditorImageElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
  onOpenMedia: () => void
}) {
  const { element, elementKey, onPageField, onOpenMedia } = props

  return (
    <div>
      <InspectorSection title="Photo">
        <div className="grid grid-cols-[170px_1fr] gap-5">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            {element.content ? (
              <img
                src={resolveApiAssetUrl(element.content)}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="text-center text-xs uppercase tracking-[0.14em] text-slate-300">
                <ImagePlus className="mx-auto mb-2 size-10" />
                Upload Foto
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Button type="button" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={onOpenMedia}>
              My Album
            </Button>
            <Button type="button" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={onOpenMedia}>
              Find at Library
            </Button>
          </div>
        </div>
        <Input
          className={INPUT_CLASS}
          value={element.content}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </InspectorSection>
      <InspectorSection title="Size">
        <SliderField
          value={element.size}
          min={24}
          max={420}
          suffix="px"
          onChange={(value) => onPageField(`data.${elementKey}.size`, value)}
        />
      </InspectorSection>
      <InspectorSection title="Select Shape">
        {[
          ['50%', 'Circle'],
          ['999px 999px 24px 24px', 'Gate'],
          ['0px', 'Square'],
          ['20px', 'Rounded'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`sapatamu-shape-choice ${element.borderRadius === value ? 'is-active' : ''}`}
            onClick={() => onPageField(`data.${elementKey}.borderRadius`, value)}
          >
            <span>{element.borderRadius === value ? 'check' : ''}</span>
            {label}
          </button>
        ))}
      </InspectorSection>
      <InspectorSection>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Outline Colors">
            <ColorField
              value={element.borderColor}
              onChange={(value) => onPageField(`data.${elementKey}.borderColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Outline Size">
            <NumberField
              value={element.borderSize}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderSize`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <InspectorSection title="Frame">
        <div className="grid grid-cols-[170px_1fr] gap-5">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            {element.frame.content ? (
              <img src={resolveApiAssetUrl(element.frame.content)} alt="" className="size-full object-contain" />
            ) : (
              <ImagePlus className="size-10 text-slate-300" />
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Published</span>
              <Switch
                checked={!element.frame.disabled}
                onCheckedChange={(checked) => onPageField(`data.${elementKey}.frame.disabled`, !checked)}
              />
            </div>
            <Button type="button" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={onOpenMedia}>
              My Album
            </Button>
          </div>
        </div>
      </InspectorSection>
      <PaddingControls
        elementKey={elementKey}
        padding={element.padding}
        onPageField={onPageField}
      />
      <AnimationControls
        style={element.animation.style}
        duration={element.animation.duration}
        onStyleChange={(value) => onPageField(`data.${elementKey}.animation.style`, value)}
        onDurationChange={(value) => onPageField(`data.${elementKey}.animation.duration`, value)}
      />
    </div>
  )
}

function InspectorTimerControls(props: {
  element: SapatamuEditorTimerElement
  elementKey: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
  onOpenMedia: () => void
}) {
  const { element, elementKey, fonts, onPageField, onOpenMedia } = props

  return (
    <div>
      <InspectorSection title="Countdown">
        <SelectField
          value={element.english ? 'en' : 'id'}
          onChange={(value) => onPageField(`data.${elementKey}.english`, value === 'en')}
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </SelectField>
        <Input
          type="datetime-local"
          className={INPUT_CLASS}
          value={element.content.slice(0, 16)}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </InspectorSection>
      <InspectorSection title="Countdown Font (Number)">
        <SelectField value={fonts[0]?.id ?? ''} onChange={() => {}}>
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>{font.name}</option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Font Color">
            <ColorField value={element.color1} onChange={(value) => onPageField(`data.${elementKey}.color1`, value)} />
          </ControlRow>
          <ControlRow label="Font Size">
            <NumberField
              value={element.size1}
              suffix="px"
              min={1}
              onChange={(value) => onPageField(`data.${elementKey}.size1`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <InspectorSection title="Description Font">
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Font Color">
            <ColorField value={element.color2} onChange={(value) => onPageField(`data.${elementKey}.color2`, value)} />
          </ControlRow>
          <ControlRow label="Font Size">
            <NumberField
              value={element.size2}
              suffix="px"
              min={1}
              onChange={(value) => onPageField(`data.${elementKey}.size2`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <InspectorSection title="Countdown Box">
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Button Color 1">
            <ColorField
              value={element.backgroundColor}
              onChange={(value) => onPageField(`data.${elementKey}.backgroundColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Button Color 2">
            <ColorField
              value={element.backgroundColor2}
              onChange={(value) => onPageField(`data.${elementKey}.backgroundColor2`, value)}
            />
          </ControlRow>
        </div>
        <ControlRow label="Size">
          <SliderField
            value={element.borderRadius}
            min={0}
            max={80}
            suffix="px"
            onChange={(value) => onPageField(`data.${elementKey}.borderRadius`, value)}
          />
        </ControlRow>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Outline Colors">
            <ColorField
              value={element.borderColor}
              onChange={(value) => onPageField(`data.${elementKey}.borderColor`, value)}
            />
          </ControlRow>
          <ControlRow label="Outline Size">
            <NumberField
              value={element.borderSize}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderSize`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      <InspectorSection title="Background Image">
        <Button type="button" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={onOpenMedia}>
          Find at Library
        </Button>
      </InspectorSection>
      <PaddingControls
        elementKey={elementKey}
        padding={element.padding}
        onPageField={onPageField}
      />
      <AnimationControls
        style={element.animation.style}
        duration={element.animation.duration}
        onStyleChange={(value) => onPageField(`data.${elementKey}.animation.style`, value)}
        onDurationChange={(value) => onPageField(`data.${elementKey}.animation.duration`, value)}
      />
    </div>
  )
}

function InspectorMapControls(props: {
  element: SapatamuEditorMapElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, onPageField } = props
  const mapElement = element as EditableMapElement
  const mapMode = mapElement.mode ?? 'google-map'

  return (
    <div>
      <InspectorSection>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">Tampilkan Maps</span>
          <Switch
            checked={!element.disabled && mapMode !== 'hidden'}
            onCheckedChange={(checked) => {
              onPageField(`data.${elementKey}.disabled`, !checked)
              if (!checked) onPageField(`data.${elementKey}.mode`, 'hidden')
              if (checked && mapMode === 'hidden') onPageField(`data.${elementKey}.mode`, 'google-map')
            }}
          />
        </div>
        <SelectField
          value={mapMode}
          onChange={(value) => {
            onPageField(`data.${elementKey}.mode`, value)
            onPageField(`data.${elementKey}.disabled`, value === 'hidden')
          }}
        >
          <option value="google-map">Google Map</option>
          <option value="qr-code">QR Code</option>
          <option value="image">Gambar</option>
          <option value="hidden">Disembunyikan</option>
        </SelectField>
        <ControlRow label="Link Google Maps">
          <Input
            className={INPUT_CLASS}
            placeholder="Tempel link share Google Maps"
            value={element.url}
            onChange={(event) => onPageField(`data.${elementKey}.url`, event.target.value)}
          />
        </ControlRow>
        <p className="text-xs leading-5 text-slate-400">
          Gunakan link share dari Google Maps. Link akan otomatis dikonversi ke format embed.
        </p>
      </InspectorSection>
      <InspectorSection title="Ukuran">
        <SliderField
          value={element.size}
          min={120}
          max={520}
          suffix="px"
          onChange={(value) => onPageField(`data.${elementKey}.size`, value)}
        />
      </InspectorSection>
      <InspectorSection title="Garis Tepi">
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Warna Garis Tepi">
            <ColorField
              value={element.color}
              onChange={(value) => onPageField(`data.${elementKey}.color`, value)}
            />
          </ControlRow>
          <ControlRow label="Background">
            <ColorField
              value={element.backgroundColor}
              onChange={(value) => onPageField(`data.${elementKey}.backgroundColor`, value)}
            />
          </ControlRow>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ControlRow label="Radius Sudut">
            <NumberField
              value={mapElement.borderRadius ?? 24}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderRadius`, value)}
            />
          </ControlRow>
          <ControlRow label="Ukuran Garis Tepi">
            <NumberField
              value={mapElement.borderSize ?? 2}
              suffix="px"
              min={0}
              onChange={(value) => onPageField(`data.${elementKey}.borderSize`, value)}
            />
          </ControlRow>
        </div>
      </InspectorSection>
      {mapMode === 'image' ? (
        <InspectorSection title="Gambar Maps">
          <Input
            className={INPUT_CLASS}
            placeholder="URL gambar maps"
            value={mapElement.imageUrl ?? ''}
            onChange={(event) => onPageField(`data.${elementKey}.imageUrl`, event.target.value)}
          />
        </InspectorSection>
      ) : null}
      <PaddingControls
        elementKey={elementKey}
        padding={element.padding}
        onPageField={onPageField}
      />
      <AnimationControls
        style={element.animation.style}
        duration={element.animation.duration}
        onStyleChange={(value) => onPageField(`data.${elementKey}.animation.style`, value)}
        onDurationChange={(value) => onPageField(`data.${elementKey}.animation.duration`, value)}
      />
    </div>
  )
}



function InspectorGalleryControls(props: {
  element: SapatamuEditorGalleryElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
  onOpenMedia: () => void
}) {
  const { element, elementKey, onPageField, onOpenMedia } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Title">
        <Input
          className={INPUT_CLASS}
          value={element.title}
          onChange={(event) => onPageField(`data.${elementKey}.title`, event.target.value)}
        />
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Columns">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.columns}
            onChange={(event) => onPageField(`data.${elementKey}.columns`, Number(event.target.value))}
          />
        </ControlRow>
        <ControlRow label="Gallery Items">
          <Button type="button" variant="outline" className="w-full rounded-xl" onClick={onOpenMedia}>
            <ImagePlus className="mr-2 size-4" />
            Tambah dari Media
          </Button>
        </ControlRow>
      </div>
      <ControlRow label="Bento Template">
        <div className="grid grid-cols-2 gap-2">
          {GALLERY_VARIANTS.map((variant) => (
            <button
              key={variant.value}
              type="button"
              className={cn(
                'rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors',
                (element.variant ?? 'bento-feature-left') === variant.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
              onClick={() => onPageField(`data.${elementKey}.variant`, variant.value)}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </ControlRow>
      <div className="space-y-2">
        {element.items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <span className="truncate text-xs text-slate-600">{item}</span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="ml-auto"
              onClick={() =>
                onPageField(
                  `data.${elementKey}.items`,
                  element.items.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {element.items.length === 0 ? (
          <p className="text-xs text-slate-500">Jika kosong, preview akan memakai fallback dari media library.</p>
        ) : null}
      </div>
    </div>
  )
}

function InspectorVideoControls(props: {
  element: SapatamuEditorVideoElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
  onOpenMedia: () => void
}) {
  const { element, elementKey, onPageField, onOpenMedia } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Title">
        <Input
          className={INPUT_CLASS}
          value={element.title}
          onChange={(event) => onPageField(`data.${elementKey}.title`, event.target.value)}
        />
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Provider">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.provider}
            onChange={(event) => onPageField(`data.${elementKey}.provider`, event.target.value)}
          >
            <option value="youtube">YouTube</option>
            <option value="file">File</option>
          </select>
        </ControlRow>
        <ControlRow label="Media Library">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={onOpenMedia}
            disabled={element.provider !== 'file'}
          >
            Pilih Video
          </Button>
        </ControlRow>
      </div>
      <ControlRow label="URL">
        <Input
          className={INPUT_CLASS}
          value={element.url}
          onChange={(event) => onPageField(`data.${elementKey}.url`, event.target.value)}
        />
      </ControlRow>
    </div>
  )
}

function InspectorSimpleCardControls(props: {
  elementKey: string
  title: string
  description: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { elementKey, title, description, onPageField } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Title">
        <Input
          className={INPUT_CLASS}
          value={title}
          onChange={(event) => onPageField(`data.${elementKey}.title`, event.target.value)}
        />
      </ControlRow>
      <ControlRow label="Description">
        <Textarea
          className="min-h-28 rounded-2xl border-border/70 bg-white/80"
          value={description}
          onChange={(event) => onPageField(`data.${elementKey}.description`, event.target.value)}
        />
      </ControlRow>
    </div>
  )
}

function InspectorStoryControls(props: {
  element: SapatamuEditorStoryElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, onPageField } = props

  const handleAddItem = () => {
    const nextItems = [...element.items, { title: '', date: '', description: '' }]
    onPageField(`data.${elementKey}.items`, nextItems)
  }

  const handleRemoveItem = (index: number) => {
    const nextItems = element.items.filter((_, i) => i !== index)
    onPageField(`data.${elementKey}.items`, nextItems)
  }

  return (
    <div className="space-y-4">
      <InspectorSection title="Love Story">
        <ControlRow label="Judul">
          <Input
            className={INPUT_CLASS}
            value={element.title}
            onChange={(event) => onPageField(`data.${elementKey}.title`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Intro Text">
          <Textarea
            className="min-h-20 rounded-2xl border-border/70 bg-white/80"
            value={element.description ?? ''}
            placeholder="Teks singkat sebelum popup perjalanan cinta dibuka."
            onChange={(event) => onPageField(`data.${elementKey}.description`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Tombol Popup">
          <Input
            className={INPUT_CLASS}
            value={element.buttonLabel ?? 'Lihat Perjalanan Cinta Kami'}
            onChange={(event) => onPageField(`data.${elementKey}.buttonLabel`, event.target.value)}
          />
        </ControlRow>
      </InspectorSection>

      {element.items.map((item, index) => (
        <InspectorSection key={index} title={`Cerita ${index + 1}`}>
          <ControlRow label="Judul Cerita">
            <Input
              className={INPUT_CLASS}
              value={item.title}
              placeholder="Contoh: Pertama Bertemu"
              onChange={(event) => {
                const nextItems = [...element.items]
                nextItems[index] = { ...nextItems[index], title: event.target.value }
                onPageField(`data.${elementKey}.items`, nextItems)
              }}
            />
          </ControlRow>
          <ControlRow label="Tanggal">
            <Input
              className={INPUT_CLASS}
              value={item.date}
              placeholder="Contoh: Januari 2020"
              onChange={(event) => {
                const nextItems = [...element.items]
                nextItems[index] = { ...nextItems[index], date: event.target.value }
                onPageField(`data.${elementKey}.items`, nextItems)
              }}
            />
          </ControlRow>
          <ControlRow label="Deskripsi">
            <Textarea
              className="min-h-20 rounded-2xl border-border/70 bg-white/80"
              value={item.description}
              placeholder="Ceritakan momen ini..."
              onChange={(event) => {
                const nextItems = [...element.items]
                nextItems[index] = { ...nextItems[index], description: event.target.value }
                onPageField(`data.${elementKey}.items`, nextItems)
              }}
            />
          </ControlRow>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => handleRemoveItem(index)}
          >
            <Trash2 className="mr-2 size-4" />
            Hapus Cerita {index + 1}
          </Button>
        </InspectorSection>
      ))}

      <div className="px-1">
        <Button
          type="button"
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700"
          onClick={handleAddItem}
        >
          <Plus className="mr-2 size-4" />
          Tambah Cerita
        </Button>
      </div>
    </div>
  )
}

function InspectorCreditControls(props: {
  element: { type: 'credit'; title: string; description: string; disabled: boolean }
  elementKey: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, onPageField } = props

  return (
    <div className="space-y-5">
      <InspectorSection title="Terima Kasih">
        <ControlRow label="Judul">
          <Input
            className={INPUT_CLASS}
            value={element.title}
            onChange={(event) => onPageField(`data.${elementKey}.title`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Ucapan Terima Kasih">
          <Textarea
            className="min-h-28 rounded-2xl border-border/70 bg-white/80"
            value={element.description}
            placeholder="Tulis ucapan terima kasih Anda..."
            onChange={(event) => onPageField(`data.${elementKey}.description`, event.target.value)}
          />
        </ControlRow>
      </InspectorSection>
    </div>
  )
}

type ContactItem = { name?: string; phone?: string; photoUrl?: string; role?: string }

function InspectorContactControls(props: {
  element: {
    type: 'sponsor'
    title: string
    description: string
    items?: ContactItem[]
  }
  elementKey: string
  onPageField: (path: string, value: unknown) => void
  onOpenMedia: (index: number) => void
}) {
  const { element, elementKey, onPageField, onOpenMedia } = props
  const contacts: ContactItem[] = element.items ?? []

  const updateContact = (index: number, field: keyof ContactItem, value: string) => {
    const next = [...contacts]
    next[index] = { ...next[index], [field]: value }
    onPageField(`data.${elementKey}.items`, next)
  }

  const addContact = () => {
    onPageField(`data.${elementKey}.items`, [...contacts, { name: '', phone: '', photoUrl: '', role: '' }])
  }

  const removeContact = (index: number) => {
    onPageField(`data.${elementKey}.items`, contacts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <InspectorSection title="Contact Person">
        <ControlRow label="Judul Halaman">
          <Input
            className={INPUT_CLASS}
            value={element.title}
            onChange={(e) => onPageField(`data.${elementKey}.title`, e.target.value)}
          />
        </ControlRow>
        <ControlRow label="Deskripsi">
          <Textarea
            className="min-h-16 rounded-2xl border-border/70 bg-white/80"
            value={element.description}
            placeholder="Hubungi contact person kami..."
            onChange={(e) => onPageField(`data.${elementKey}.description`, e.target.value)}
          />
        </ControlRow>
      </InspectorSection>

      {contacts.map((contact, index) => (
        <InspectorSection key={index} title={`Mempelai ${index + 1}`}>
          <div className="flex items-center gap-3">
            <div className="relative size-16 shrink-0">
              <div className="size-16 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
                {contact.photoUrl ? (
                  <img src={resolveApiAssetUrl(contact.photoUrl)} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-slate-300">
                    <ImagePlus className="size-6" />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-emerald-600 text-white shadow"
                onClick={() => onOpenMedia(index)}
              >
                <Pencil className="size-3" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <Input
                className={INPUT_CLASS}
                value={contact.name ?? ''}
                placeholder="Nama lengkap"
                onChange={(e) => updateContact(index, 'name', e.target.value)}
              />
            </div>
          </div>
          <ControlRow label="No. HP / WA">
            <Input
              className={INPUT_CLASS}
              value={contact.phone ?? ''}
              placeholder="+6281234567890"
              onChange={(e) => updateContact(index, 'phone', e.target.value)}
            />
          </ControlRow>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => removeContact(index)}
          >
            <Trash2 className="mr-2 size-4" />
            Hapus Contact {index + 1}
          </Button>
        </InspectorSection>
      ))}

      <div className="px-1">
        <Button
          type="button"
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700"
          onClick={addContact}
        >
          <Plus className="mr-2 size-4" />
          Tambah Contact
        </Button>
      </div>
    </div>
  )
}

function SectionInspector(props: {
  page: SapatamuEditorPage
  invitationId: string
  selectedElement: string | null
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
  onResetPageDefault: () => void
  onRemovePage: () => void
  onOpenMedia: (target: MediaPickerTarget) => void
}) {
  const { page, selectedElement, fonts, onPageField, onResetPageDefault, onRemovePage, onOpenMedia } = props
  const element = getEditableElement(page, selectedElement)
  const elementType = getElementTypeFromKey(page, selectedElement)

  if (!selectedElement || !element || !elementType) {
    return (
      <div className="px-5 py-6">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{page.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Klik salah satu box teks, gambar, tombol, countdown, atau map di preview untuk membuka setting detail.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {page.layoutCode} · {page.family}
              </p>
            </div>
            {page.source === 'addon' ? (
              <Button type="button" variant="outline" className="mt-2 rounded-xl" onClick={onRemovePage}>
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="mt-2 rounded-xl" onClick={onResetPageDefault}>
              Set to default
            </Button>
          </div>
        </div>
      </div>
    )
  }

  switch (elementType) {
    case 'text':
      return (
        <InspectorTextControls
          element={element as SapatamuEditorTextElement}
          elementKey={selectedElement}
          fonts={fonts}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'button':
    case 'url':
      return (
        <InspectorButtonControls
          element={element as SapatamuEditorButtonElement}
          elementKey={selectedElement}
          fonts={fonts}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'image':
      return (
        <InspectorImageControls
          element={element as SapatamuEditorImageElement}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
          onOpenMedia={() =>
            onOpenMedia({
              kind: 'element-image',
              pageUniqueId: page.uniqueId,
              elementKey: selectedElement,
              mediaType: 'image',
            })
          }
        />
      )
    case 'timer':
      return (
        <InspectorTimerControls
          element={element as SapatamuEditorTimerElement}
          elementKey={selectedElement}
          fonts={fonts}
          onPageField={(path, value) => onPageField(path, value)}
          onOpenMedia={() =>
            onOpenMedia({
              kind: 'page-background',
              pageUniqueId: page.uniqueId,
              mediaType: 'image',
            })
          }
        />
      )
    case 'map':
      return (
        <InspectorMapControls
          element={element as SapatamuEditorMapElement}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'gallery':
      return (
        <InspectorGalleryControls
          element={element as SapatamuEditorGalleryElement}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
          onOpenMedia={() =>
            onOpenMedia({
              kind: 'element-gallery',
              pageUniqueId: page.uniqueId,
              elementKey: selectedElement,
              mediaType: 'image',
            })
          }
        />
      )
    case 'video':
      return (
        <InspectorVideoControls
          element={element as SapatamuEditorVideoElement}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
          onOpenMedia={() =>
            onOpenMedia({
              kind: 'element-video',
              pageUniqueId: page.uniqueId,
              elementKey: selectedElement,
              mediaType: 'video',
            })
          }
        />
      )
    case 'rsvp':
      return (
        <InspectorSimpleCardControls
          elementKey={selectedElement}
          title={(element as SapatamuEditorRsvpElement).title}
          description={(element as SapatamuEditorRsvpElement).description}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'gift':
      return (
        <InspectorSimpleCardControls
          elementKey={selectedElement}
          title={(element as SapatamuEditorGiftElement).title}
          description={(element as SapatamuEditorGiftElement).description}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'story':
      return (
        <InspectorStoryControls
          element={element as SapatamuEditorStoryElement}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    case 'sponsor':
      return (
        <InspectorContactControls
          element={element as {
            type: 'sponsor'
            title: string
            description: string
            items?: Array<{ name?: string; phone?: string; photoUrl?: string; role?: string }>
          }}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
          onOpenMedia={(index) => onOpenMedia({
            kind: 'element-image',
            pageUniqueId: page.uniqueId,
            elementKey: `${selectedElement}__contact_photo_${index}`,
            mediaType: 'image',
          })}
        />
      )
    case 'credit':
      return (
        <InspectorCreditControls
          element={element as { type: 'credit'; title: string; description: string; disabled: boolean }}
          elementKey={selectedElement}
          onPageField={(path, value) => onPageField(path, value)}
        />
      )
    default:
      return (
        <div className="rounded-3xl bg-white/85 p-5 sapatamu-editor-card">
          <p className="text-sm text-slate-500">
            Inspector untuk elemen ini belum tersedia.
          </p>
        </div>
      )
  }
}

function PanelMenuRow(props: {
  title: string
  description?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-2xl px-1 py-3 text-left transition hover:bg-white/70"
      onClick={props.onClick}
    >
      <span>
        <span className="block text-base font-semibold text-slate-950">{props.title}</span>
        {props.description ? <span className="mt-1 block text-xs text-slate-500">{props.description}</span> : null}
      </span>
      <Pencil className="size-5 text-slate-400" />
    </button>
  )
}

function LayoutGlobalSettings(props: {
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  lastSavedAt: string | null
  onGlobalField: (path: string, value: unknown) => void
  onPanelMode: (mode: EditorPanelMode) => void
}) {
  const { documentValue, lastSavedAt, onGlobalField, onPanelMode } = props

  return (
    <div className="rounded-3xl bg-white/80 p-4 sapatamu-editor-card">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-950">Invitation Menu</p>
            <p className="text-xs text-slate-500">Bottom bar pada invitation.</p>
          </div>
          <Switch
            checked={documentValue?.editor.navMenu.enabled ?? false}
            onCheckedChange={(checked) => onGlobalField('editor.navMenu.enabled', checked)}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-950">Full Screen</p>
            <p className="text-xs text-slate-500">Only works on Android devices</p>
          </div>
          <Switch
            checked={documentValue?.editor.fullScreen.enabled ?? false}
            onCheckedChange={(checked) => onGlobalField('editor.fullScreen.enabled', checked)}
          />
        </div>
        <PanelMenuRow
          title="Theme"
          description={documentValue?.selectedTheme ?? 'Pilih tema invitation'}
          onClick={() => onPanelMode('theme')}
        />

      </div>
      <p className="mt-8 text-center text-[11px] text-slate-300">
        last updated {lastSavedAt ? new Date(lastSavedAt).toLocaleString('id-ID') : '-'}
      </p>
    </div>
  )
}

function ThemeSettingsPanel(props: {
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  catalog: SapatamuEditorHydrationResponse['catalog']
  isSaving: boolean
  onApplyTheme: (themeId: string) => void
}) {
  const themes = props.catalog.themes ?? []

  return (
    <div className="space-y-4 p-5">
      <p className="text-sm text-slate-500">
        Pilih tema dari catalog Sapatamu. Apply theme akan mengganti struktur layout dan asset sesuai template,
        sementara data mempelai dan acara tetap dipertahankan.
      </p>
      <div className="space-y-3">
        {themes.map((theme) => {
          const preset = getThemePreset(theme.code)
          const previewImage = theme.previewImageUrl || preset.previewImage
          const isActive = props.documentValue?.selectedTheme === theme.code

          return (
            <button
              key={theme.id}
              type="button"
              className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
              disabled={props.isSaving || isActive}
              onClick={() => props.onApplyTheme(theme.id)}
            >
              <div className="grid grid-cols-[92px_1fr] gap-3 p-3">
                <div className="h-24 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={resolveApiAssetUrl(previewImage)}
                    alt={theme.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 py-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isActive ? 'default' : 'outline'}>{resolveThemeGroup(theme)}</Badge>
                    {isActive ? <Badge variant="outline">Aktif</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-5">{theme.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-normal leading-5 text-slate-500">
                    {theme.description ?? preset.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
        {themes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
            Catalog tema belum tersedia. Muat ulang editor setelah backend catalog siap.
          </div>
        ) : null}
      </div>
    </div>
  )
}

function PaletteSettingsPanel(props: {
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  onGlobalField: (path: string, value: unknown) => void
}) {
  const palette = props.documentValue?.editor.colorPalette ?? {
    text: '#F8E7C9',
    accent: '#D6AE5B',
    canvas: '#421A16',
  }

  return (
    <div className="space-y-5 p-5">
      <ControlRow label="Text">
        <ColorField value={palette.text} onChange={(value) => props.onGlobalField('editor.colorPalette.text', value)} />
      </ControlRow>
      <ControlRow label="Elemen">
        <ColorField value={palette.accent} onChange={(value) => props.onGlobalField('editor.colorPalette.accent', value)} />
      </ControlRow>
      <ControlRow label="Background">
        <ColorField value={palette.canvas} onChange={(value) => props.onGlobalField('editor.colorPalette.canvas', value)} />
      </ControlRow>
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl"
        onClick={() => {
          props.onGlobalField('editor.colorPalette.text', '#F8E7C9')
          props.onGlobalField('editor.colorPalette.accent', '#D6AE5B')
          props.onGlobalField('editor.colorPalette.canvas', '#421A16')
        }}
      >
        Reset Palette
      </Button>
    </div>
  )
}

function BackgroundSettingsPanel(props: {
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  lastSavedAt: string | null
  pendingCount: number
  isSaving: boolean
  selectedElement: BackgroundHeroElementKey | null
  onSelectElement: (elementKey: BackgroundHeroElementKey | null) => void
  onBack: () => void
  onSave: () => void
  onGlobalField: (path: string, value: unknown) => void
  onOpenMedia: () => void
  onOpenHeroMedia: (elementKey: BackgroundHeroElementKey) => void
}) {
  const backgroundUrl = props.documentValue?.editor.globalBackground ?? ''
  const details = props.documentValue?.editor.globalBackgroundDetails as ({ hero?: BackgroundHeroSettings } | undefined)
  const hero = details?.hero ?? {}

  const sectionToggle = (path: string, checked: boolean) => props.onGlobalField(`editor.globalBackgroundDetails.hero.${path}.enabled`, checked)
  const sectionText = (path: string, value: string) => props.onGlobalField(`editor.globalBackgroundDetails.hero.${path}.text`, value)
  const sectionNumber = (path: string, key: 'x' | 'y' | 'size', value: number) =>
    props.onGlobalField(`editor.globalBackgroundDetails.hero.${path}.${key}`, value)
  const selectedElement = props.selectedElement
  const getHeroNode = (path: BackgroundHeroElementKey) =>
    path.split('.').reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object') return undefined
      return (current as Record<string, unknown>)[segment]
    }, hero) as { enabled?: boolean; text?: string; url?: string; x?: number; y?: number; size?: number } | undefined
  const selectedNode = selectedElement ? getHeroNode(selectedElement) : undefined
  const selectedValue =
    selectedElement === 'left.photo'
      ? hero.left?.photo?.url ?? ''
      : selectedElement === 'right.photo'
        ? hero.right?.photo?.url ?? ''
        : selectedElement
          ? getHeroNode(selectedElement)?.text ?? ''
          : ''

  return (
    <div className="flex h-full flex-col">
      <div className="grid h-[64px] grid-cols-[48px_1fr_48px] items-center border-b border-white/50 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-500"
          onClick={() => {
            if (selectedElement) {
              props.onSelectElement(null)
              return
            }
            props.onBack()
          }}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h3 className="text-center text-lg font-semibold text-slate-950">
          {selectedElement ? BACKGROUND_HERO_LABELS[selectedElement] : 'Background'}
        </h3>
      </div>
      <div className="sapatamu-inspector-body p-5">
        {selectedElement ? (
          <div className="space-y-5">
            <InspectorSection title="Published">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{BACKGROUND_HERO_LABELS[selectedElement]}</p>
                <Switch
                  checked={Boolean(selectedNode?.enabled)}
                  onCheckedChange={(checked) => sectionToggle(selectedElement, checked)}
                />
              </div>
            </InspectorSection>

            {selectedElement.endsWith('.photo') ? (
              <InspectorSection title="Photo">
                <button
                  type="button"
                  className="aspect-square w-40 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm"
                  onClick={() => props.onOpenHeroMedia(selectedElement)}
                >
                  {selectedValue ? (
                    <img src={resolveApiAssetUrl(selectedValue)} alt={BACKGROUND_HERO_LABELS[selectedElement]} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xs uppercase tracking-[0.16em] text-slate-400">
                      Upload Foto
                    </div>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={() => props.onOpenHeroMedia(selectedElement)}>
                    My Album
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => props.onOpenHeroMedia(selectedElement)}>
                    Find at Library
                  </Button>
                </div>
              </InspectorSection>
            ) : (
              <InspectorSection title={selectedElement === 'right.music' ? 'Music' : 'Text'}>
                <Textarea
                  className="min-h-28 rounded-3xl border-slate-200 bg-white px-5 py-4 text-base shadow-sm"
                  value={selectedValue}
                  onChange={(event) => sectionText(selectedElement, event.target.value)}
                />
              </InspectorSection>
            )}
            <InspectorSection title="Position & Size">
              <div className="grid grid-cols-3 gap-3">
                <ControlRow label="X">
                  <Input
                    type="number"
                    className={INPUT_CLASS}
                    value={selectedNode?.x ?? 0}
                    onChange={(event) => sectionNumber(selectedElement, 'x', Number(event.target.value))}
                  />
                </ControlRow>
                <ControlRow label="Y">
                  <Input
                    type="number"
                    className={INPUT_CLASS}
                    value={selectedNode?.y ?? 0}
                    onChange={(event) => sectionNumber(selectedElement, 'y', Number(event.target.value))}
                  />
                </ControlRow>
                <ControlRow label="Size">
                  <Input
                    type="number"
                    min={20}
                    max={240}
                    className={INPUT_CLASS}
                    value={selectedNode?.size ?? 100}
                    onChange={(event) => sectionNumber(selectedElement, 'size', Number(event.target.value))}
                  />
                </ControlRow>
              </div>
            </InspectorSection>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-950">Background</p>
              <p className="text-xs text-slate-500">1920px x 1040px (.png, .jpg)</p>
              <button
                type="button"
                className="aspect-[16/7] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                onClick={props.onOpenMedia}
              >
                {backgroundUrl ? (
                  <img src={resolveApiAssetUrl(backgroundUrl)} alt="Background" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-xs uppercase tracking-[0.16em] text-slate-400">Pilih Background</div>
                )}
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <p className="border-b border-slate-200 pb-2 text-sm text-slate-700">Left</p>
              {[
                ['left.photo', 'Photo', hero.left?.photo?.enabled],
                ['left.subTitle', 'Sub Title', hero.left?.subTitle?.enabled],
                ['left.title', 'Title', hero.left?.title?.enabled],
                ['left.description', 'Descriptions', hero.left?.description?.enabled],
              ].map(([path, label, enabled]) => (
                <div
                  key={String(path)}
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-left"
                  onClick={() => props.onSelectElement(path as BackgroundHeroElementKey)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') props.onSelectElement(path as BackgroundHeroElementKey)
                  }}
                >
                  <p className="text-base font-semibold text-slate-950">{label}</p>
                  <Switch
                    checked={Boolean(enabled)}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={(checked) => sectionToggle(String(path), checked)}
                  />
                </div>
              ))}

              <p className="border-b border-slate-200 pb-2 pt-3 text-sm text-slate-700">Right</p>
              {[
                ['right.photo', 'Photo', hero.right?.photo?.enabled],
                ['right.title', 'Title', hero.right?.title?.enabled],
                ['right.description', 'Descriptions', hero.right?.description?.enabled],
                ['right.music', 'Music', hero.right?.music?.enabled],
              ].map(([path, label, enabled]) => (
                <div
                  key={String(path)}
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-left"
                  onClick={() => props.onSelectElement(path as BackgroundHeroElementKey)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') props.onSelectElement(path as BackgroundHeroElementKey)
                  }}
                >
                  <p className="text-base font-semibold text-slate-950">{label}</p>
                  <Switch
                    checked={Boolean(enabled)}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={(checked) => sectionToggle(String(path), checked)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="border-t border-slate-100 p-4">
        {props.pendingCount > 0 ? (
          <Button
            type="button"
            className="mb-3 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700"
            disabled={props.isSaving}
            onClick={props.onSave}
          >
            {props.isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save
          </Button>
        ) : null}
        <p className="text-center text-[11px] text-slate-300">
          last updated {props.lastSavedAt ? new Date(props.lastSavedAt).toLocaleString('id-ID') : '-'}
        </p>
      </div>
    </div>
  )
}

export function CmsSapatamuEditor() {
  const navigate = useNavigate()
  const { invitationId = '', pageSlug } = useParams<{ invitationId: string; pageSlug?: string }>()
  const [searchParams] = useSearchParams()
  const selectedElement = searchParams.get('element')
  const [selectedBackgroundElement, setSelectedBackgroundElement] = useState<BackgroundHeroElementKey | null>(null)
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<MediaPickerTarget | null>(null)
  const [panelMode, setPanelMode] = useState<EditorPanelMode>('layouts')
  const [emblaRef, emblaApi] = useEmblaCarousel({ axis: 'y', containScroll: 'trimSnaps', dragFree: false })

  const {
    invitation,
    document: documentValue,
    catalog,
    session,
    pendingOperations,
    isLoading,
    isSaving,
    error,
    lightbox,
    hydrateEditor,
    clearError,
    flushPending,
    updateGlobalField,
    updatePageField,
    replacePage,
    reorderPages,
    togglePage,
    addPage,
    removePage,
    applyTheme,
    uploadMedia,
    setLightbox,
    lastSavedAt,
  } = useSapatamuEditorStore()

  const isLayoutEditMode = Boolean(pageSlug)
  const page = findEditorPageBySlug(documentValue, pageSlug)
  const currentPageIndex = getEditorActivePageIndex(documentValue, pageSlug)
  const selectedElementType = page ? getElementTypeFromKey(page, selectedElement) : null
  const fallbackImages = useMemo(
    () => getEditorMediaByType(catalog?.media, 'image').map((item) => item.url),
    [catalog?.media],
  )
  const lightboxSlides = useMemo(
    () =>
      fallbackImages.map((item) => ({
        src: resolveApiAssetUrl(item),
      })),
    [fallbackImages],
  )
  const lockedLookup = useMemo(() => {
    return Object.fromEntries(
      (catalog?.featureGates ?? []).map((item) => [item.code, item.enabled ? null : item.reason]),
    )
  }, [catalog?.featureGates])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    if (!invitationId) return
    void hydrateEditor(invitationId)
  }, [hydrateEditor, invitationId])

  useEffect(() => {
    ensureEditorFonts(catalog?.fonts)
  }, [catalog?.fonts])

  useEffect(() => {
    if (panelMode !== 'background') {
      setSelectedBackgroundElement(null)
    }
  }, [panelMode])

  useEffect(() => {
    if (!emblaApi || !documentValue?.editor.pages.length) return
    emblaApi.scrollTo(currentPageIndex)
  }, [currentPageIndex, documentValue?.editor.pages.length, emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit({
      axis: 'y',
      containScroll: 'trimSnaps',
      dragFree: false,
      watchDrag: !isLayoutEditMode,
    })
  }, [emblaApi, isLayoutEditMode])

  useEffect(() => {
    if (!emblaApi || !documentValue?.editor.pages.length || !invitationId) return

    const onSelect = () => {
      if (!isLayoutEditMode) return
      const index = emblaApi.selectedScrollSnap()
      const nextPage = documentValue.editor.pages[index]
      if (!nextPage || nextPage.slug === page?.slug) return
      updateQueryElement(navigate, invitationId, nextPage.slug, selectedElement)
    }

    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [documentValue?.editor.pages, emblaApi, invitationId, isLayoutEditMode, navigate, page?.slug, selectedElement])

  const handleOpenMedia = (target: MediaPickerTarget) => {
    setMediaTarget(target)
    setMediaDialogOpen(true)
  }

  const handleMediaPick = (mediaUrl: string) => {
    if (!mediaTarget || !page) return

    if (mediaTarget.kind === 'global-background') {
      updateGlobalField('editor.globalBackground', mediaUrl)
      updateGlobalField('editor.globalBackgroundDetails.type', mediaTarget.mediaType)
    }

    if (mediaTarget.kind === 'global-hero-photo') {
      updateGlobalField(`editor.globalBackgroundDetails.hero.${mediaTarget.heroKey}.url`, mediaUrl)
      updateGlobalField(`editor.globalBackgroundDetails.hero.${mediaTarget.heroKey}.enabled`, true)
    }

    if (mediaTarget.kind === 'page-background') {
      updatePageField(mediaTarget.pageUniqueId, 'data.background', mediaUrl)
    }

    if (mediaTarget.kind === 'element-image') {
      // Special handling for contact person photo uploads
      const contactPhotoMatch = mediaTarget.elementKey.match(/^(.+)__contact_photo_(\d+)$/)
      if (contactPhotoMatch) {
        const sponsorKey = contactPhotoMatch[1]
        const photoIndex = Number(contactPhotoMatch[2])
        const contactElement = getEditableElement(page, sponsorKey) as { items?: ContactItem[] } | null
        const nextItems = [...(contactElement?.items ?? [])]
        nextItems[photoIndex] = { ...nextItems[photoIndex], photoUrl: mediaUrl }
        updatePageField(mediaTarget.pageUniqueId, `data.${sponsorKey}.items`, nextItems)
      } else {
        updatePageField(mediaTarget.pageUniqueId, `data.${mediaTarget.elementKey}.content`, mediaUrl)
      }
    }

    if (mediaTarget.kind === 'element-video') {
      updatePageField(mediaTarget.pageUniqueId, `data.${mediaTarget.elementKey}.url`, mediaUrl)
    }

    if (mediaTarget.kind === 'element-gallery') {
      const currentElement = getEditableElement(page, mediaTarget.elementKey) as SapatamuEditorGalleryElement | null
      const nextItems = [...(currentElement?.items ?? []), mediaUrl]
      updatePageField(mediaTarget.pageUniqueId, `data.${mediaTarget.elementKey}.items`, nextItems)
    }

    setMediaDialogOpen(false)
    setMediaTarget(null)
  }

  const handleSidebarToggle = async (targetPage: SapatamuEditorPage, nextActive: boolean) => {
    if (!invitationId) return
    await togglePage(invitationId, targetPage.uniqueId, nextActive)
  }

  const handleReorder = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !documentValue) return

    const currentIds = documentValue.editor.pages.map((item) => item.uniqueId)
    const oldIndex = currentIds.findIndex((item) => item === active.id)
    const newIndex = currentIds.findIndex((item) => item === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const ordered = arrayMove(currentIds, oldIndex, newIndex)
    if (!invitationId) return
    await reorderPages(invitationId, ordered)
  }

  const handleSaveNow = async () => {
    if (!invitationId) return
    await flushPending(invitationId)
  }

  const handleApplyTheme = async (themeId: string) => {
    if (!invitationId) return
    const confirmed = window.confirm('Apply theme akan mengganti struktur layout dan asset template. Data mempelai dan acara tetap dipertahankan. Lanjutkan?')
    if (!confirmed) return
    await applyTheme(invitationId, themeId)
    setPanelMode('layouts')
    navigate(`/cms/sapatamu/${invitationId}/editor`)
  }

  const handleBackToLayouts = async () => {
    navigate(`/cms/sapatamu/${invitationId}/editor`)
  }

  if (isLoading || !documentValue || !catalog || !session || !page || !invitation) {
    return (
      <div className="sapatamu-editor-shell grid min-h-screen place-items-center p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="size-5 animate-spin text-accent" />
          <span className="text-sm text-slate-600">Memuat editor invitation...</span>
        </div>
      </div>
    )
  }

  const pageField = (path: string, value: unknown) => updatePageField(page.uniqueId, path, value)
  const resetPageDefault = () => {
    const layout = catalog.layouts.find((item) => item.layoutCode === page.layoutCode)
    if (!layout) return
    replacePage(page.uniqueId, {
      ...page,
      data: mergePageDataWithDesignDefaults(page.data, layout.defaultPageData),
    })
  }
  const selectedEditorElement = getEditableElement(page, selectedElement)
  const invitationDisplayName = invitation.title || invitation.slug || 'Invitation'
  const inspectorTitle = isLayoutEditMode
    ? selectedElementType
      ? getElementEditTitle(selectedElementType)
      : page.title
    : invitation.title
  const backgroundHero = (documentValue.editor.globalBackgroundDetails as { hero?: BackgroundHeroSettings }).hero
  const stageBackgroundUrl = documentValue.editor.globalBackground
  const stageBackgroundType = documentValue.editor.globalBackgroundDetails?.type
  const previewStageStyle: CSSProperties =
    stageBackgroundUrl && stageBackgroundType !== 'video'
      ? {
          backgroundImage: `linear-gradient(90deg, rgba(48, 22, 20, 0.2), rgba(48, 22, 20, 0.08), rgba(48, 22, 20, 0.2)), url(${resolveApiAssetUrl(stageBackgroundUrl)})`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
        }
      : {}

  return (
    <div className="sapatamu-editor-shell min-h-screen p-2 sm:p-3">
      <div className="flex h-full w-full flex-col gap-3">
        {error ? (
          <div className="flex flex-wrap items-center gap-3">
            <ErrorNotice
              message={error}
              className="flex-1 border-destructive/20 bg-destructive/6"
            />
            <Button type="button" variant="outline" className="rounded-xl" onClick={clearError}>
              Tutup
            </Button>
          </div>
        ) : null}

        <div className="sapatamu-editor-workspace">
          <aside className="sapatamu-editor-sidebar flex flex-col overflow-hidden rounded-[22px] border border-white/50 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
            {isLayoutEditMode ? (
              <>
                <div className="sapatamu-editor-panel-header grid h-[78px] shrink-0 grid-cols-[48px_1fr_72px] items-center border-b border-white/50 px-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-slate-500"
                    onClick={() => void handleBackToLayouts()}
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-950">{inspectorTitle}</h3>
                    <p className="text-xs text-slate-400">
                      {selectedElement ? selectedElement : `${page.title} - pilih elemen di preview`}
                    </p>
                  </div>
                  <Switch
                    checked={selectedEditorElement ? !selectedEditorElement.disabled : page.isActive}
                    onCheckedChange={(checked) => {
                      if (selectedElement && selectedEditorElement) {
                        pageField(`data.${selectedElement}.disabled`, !checked)
                        return
                      }
                      void handleSidebarToggle(page, checked)
                    }}
                  />
                </div>
                <div className="sapatamu-inspector-body flex-1">
                  <SectionInspector
                    page={page}
                    invitationId={invitationId}
                    selectedElement={selectedElement}
                    fonts={catalog.fonts}
                    onPageField={pageField}
                    onResetPageDefault={resetPageDefault}
                    onRemovePage={() => void removePage(invitationId, page.uniqueId)}
                    onOpenMedia={handleOpenMedia}
                  />
                </div>
                <div className="shrink-0 border-t border-slate-200 bg-white/90 p-4 backdrop-blur">
                  <Button
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSaving}
                    onClick={() => void handleSaveNow()}
                  >
                    {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                {panelMode === 'background' ? (
                  <BackgroundSettingsPanel
                    documentValue={documentValue}
                    lastSavedAt={lastSavedAt}
                    pendingCount={pendingOperations.length}
                    isSaving={isSaving}
                    selectedElement={selectedBackgroundElement}
                    onSelectElement={setSelectedBackgroundElement}
                    onBack={() => setPanelMode('layouts')}
                    onSave={() => void handleSaveNow()}
                    onGlobalField={updateGlobalField}
                    onOpenMedia={() => handleOpenMedia({ kind: 'global-background', mediaType: 'image' })}
                    onOpenHeroMedia={(heroKey) => handleOpenMedia({ kind: 'global-hero-photo', heroKey, mediaType: 'image' })}
                  />
                ) : (
                  <>
                <div className="sapatamu-editor-panel-header shrink-0 border-b border-white/50 px-5 py-4">
                  <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-slate-500"
                      onClick={() => {
                        if (panelMode !== 'layouts') {
                          setPanelMode('layouts')
                          return
                        }
                        navigate('/cms')
                      }}
                    >
                      <ArrowLeft className="size-5" />
                    </Button>
                    <div className="min-w-0 text-center">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Invitation</p>
                      <h3 className="truncate text-xl font-semibold text-slate-950">{invitationDisplayName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {pendingOperations.length > 0 ? <Badge>Pending</Badge> : null}
                      {isSaving ? (
                        <Badge variant="outline">
                          <Loader2 className="mr-2 size-3 animate-spin" />
                          Saving
                        </Badge>
                      ) : null}
                      {pendingOperations.length > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700"
                          disabled={isSaving}
                          onClick={() => void handleSaveNow()}
                        >
                          Save
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full"
                        onClick={() => navigate(`/cms/sapatamu/${invitationId}/send`)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">{invitation.slug}</Badge>
                    <Badge variant="outline">{documentValue.selectedTheme}</Badge>
                  </div>
                </div>

                <div className="sapatamu-sidebar-scroll flex-1 space-y-5 overflow-y-auto p-5">
                  {panelMode === 'layouts' ? (
                    <>
                  <div className="rounded-3xl bg-white/80 p-4 sapatamu-editor-card">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Layout Order
                    </p>
                    <div className="mt-4 space-y-3">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
                        <SortableContext
                          items={documentValue.editor.pages.map((item) => item.uniqueId)}
                          strategy={verticalListSortingStrategy}
                        >
                          {documentValue.editor.pages.map((item) => (
                            <SortablePageItem
                              key={item.uniqueId}
                              page={item}
                              invitationId={invitationId}
                              isCurrent={item.slug === page.slug}
                              onToggle={handleSidebarToggle}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>

                  </div>

                  <LayoutGlobalSettings
                    documentValue={documentValue}
                    lastSavedAt={lastSavedAt}
                    onGlobalField={updateGlobalField}
                    onPanelMode={setPanelMode}
                  />
                    </>
                  ) : null}
                  {panelMode === 'theme' ? (
                    <ThemeSettingsPanel
                      documentValue={documentValue}
                      catalog={catalog}
                      isSaving={isSaving}
                      onApplyTheme={(themeId) => void handleApplyTheme(themeId)}
                    />
                  ) : null}
                  {panelMode === 'palette' ? (
                    <PaletteSettingsPanel documentValue={documentValue} onGlobalField={updateGlobalField} />
                  ) : null}
                </div>
                  </>
                )}
              </>
            )}
          </aside>

          <section className="sapatamu-editor-preview-stage" style={previewStageStyle}>
            {backgroundHero ? (
              <BackgroundHeroOverlay
                hero={backgroundHero}
                fallbackImages={fallbackImages}
                isEditing={panelMode === 'background'}
                selectedElement={selectedBackgroundElement}
                onSelect={(elementKey) => {
                  setPanelMode('background')
                  setSelectedBackgroundElement(elementKey)
                }}
              />
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="sapatamu-editor-background-action rounded-full"
              onClick={() => {
                setPanelMode('background')
                setSelectedBackgroundElement(null)
                if (isLayoutEditMode) {
                  void handleBackToLayouts()
                }
              }}
            >
              <ImagePlus className="mr-2 size-4" />
              Background
            </Button>
            <div className="sapatamu-editor-live-canvas" ref={emblaRef}>
              <div className="flex h-full flex-col">
                {documentValue.editor.pages.map((previewPage) => (
                  <div key={previewPage.slug} className="min-h-0 flex-[0_0_100%] p-0">
                    <PreviewPage
                      page={previewPage}
                      invitationId={invitationId}
                      selectedElement={isLayoutEditMode && previewPage.slug === page.slug ? selectedElement : null}
                      documentValue={documentValue}
                      invitationLink={invitation.publicUrl}
                      fonts={catalog.fonts}
                      fallbackImages={fallbackImages}
                      onOpenLightbox={(index) => setLightbox({ open: true, index })}
                      isEditing={isLayoutEditMode && previewPage.slug === page.slug}
                      giftAccounts={documentValue.settings.giftAccounts}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <LayoutLibraryDialog
        open={layoutDialogOpen}
        onOpenChange={setLayoutDialogOpen}
        layouts={catalog.layouts}
        lockedLookup={lockedLookup}
        isSaving={isSaving}
        onAdd={(layoutCode) => {
          void addPage(invitationId, layoutCode, page.uniqueId)
          setLayoutDialogOpen(false)
        }}
      />

      <MediaPickerDialog
        open={mediaDialogOpen}
        onOpenChange={(open) => {
          setMediaDialogOpen(open)
          if (!open) setMediaTarget(null)
        }}
        target={mediaTarget}
        media={catalog.media}
        isSaving={isSaving}
        onPick={handleMediaPick}
        onUpload={(file) => void uploadMedia(invitationId, file)}
      />

      <Lightbox
        open={lightbox.open}
        close={() => setLightbox({ open: false })}
        index={lightbox.index}
        slides={lightboxSlides}
      />
    </div>
  )
}
