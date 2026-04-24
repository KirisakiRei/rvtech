import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useEmblaCarousel from 'embla-carousel-react'
import ReactPlayer from 'react-player'
import Lightbox from 'yet-another-react-lightbox'
import { AlertCircle, ArrowLeft, GripVertical, ImagePlus, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { resolveApiAssetUrl } from '@/lib/api'
import {
  findEditorPageBySlug,
  getEditorActivePageIndex,
  getEditorMediaByType,
  useSapatamuEditorStore,
} from '@/stores/sapatamuEditorStore'
import type {
  SapatamuEditorButtonElement,
  SapatamuEditorGalleryElement,
  SapatamuEditorGiftElement,
  SapatamuEditorHydrationResponse,
  SapatamuEditorImageElement,
  SapatamuEditorLayoutCatalogItem,
  SapatamuEditorMapElement,
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
  getEditorAnimationClass,
  getElementTypeFromKey,
  listPageEditableKeys,
  resolveEditorTokens,
  splitEditorParagraphs,
} from './editor/editor-utils'
import 'yet-another-react-lightbox/styles.css'
import './editor/sapatamu-editor.css'

type MediaPickerTarget =
  | { kind: 'page-background'; pageUniqueId: number; mediaType: 'image' | 'video' }
  | { kind: 'element-image'; pageUniqueId: number; elementKey: string; mediaType: 'image' }
  | { kind: 'element-gallery'; pageUniqueId: number; elementKey: string; mediaType: 'image' }
  | { kind: 'element-video'; pageUniqueId: number; elementKey: string; mediaType: 'video' }

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
  const normalized = hex.replace('#', '').trim()
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
      <DialogContent className="max-w-4xl rounded-3xl bg-white p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Add Layout</DialogTitle>
          <DialogDescription>
            Pilih layout tambahan untuk dimasukkan ke urutan invitation editor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[72vh] grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2 xl:grid-cols-3">
          {layouts.map((layout) => {
            const lockedReason = lockedLookup[layout.layoutCode]

            return (
              <div
                key={layout.layoutCode}
                className="overflow-hidden rounded-3xl border border-border/70 bg-slate-50"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={layout.previewImageUrl}
                    alt={layout.title}
                    className="size-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{layout.title}</p>
                      <p className="text-xs text-slate-500">
                        {layout.family} · {layout.layoutCode}
                      </p>
                    </div>
                    {lockedReason ? <Badge variant="outline">Upgrade Paket</Badge> : null}
                  </div>
                  <Button
                    className="w-full rounded-xl"
                    disabled={Boolean(lockedReason) || isSaving}
                    onClick={() => onAdd(layout.layoutCode)}
                  >
                    {lockedReason ? 'Terkunci' : 'Tambahkan'}
                  </Button>
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
  children: ReactNode
}) {
  const { elementKey, page, selectedElement, invitationId, children } = props
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="editor-element-target block w-full"
      data-selected={selectedElement === elementKey}
      onClick={() => updateQueryElement(navigate, invitationId, page.slug, elementKey)}
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
}) {
  const { page, elementKey, element, selectedElement, invitationLink, documentValue, fontFamily, invitationId } = props
  const animationClass = getEditorAnimationClass(element.animation?.style)
  const paragraphs = splitEditorParagraphs(resolveEditorTokens(element.content, documentValue, invitationLink))
  const boxStyle = element.box.disabled
    ? undefined
    : {
        borderRadius: `${element.box.borderRadius}px`,
        background: `linear-gradient(${element.box.gradientAngle}deg, ${element.box.backgroundColor}, ${element.box.backgroundColor2})`,
      }

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div
        className={animationClass}
        style={{
          paddingTop: element.padding.top,
          paddingBottom: element.padding.bottom,
          textAlign: element.align,
          color: element.color,
          fontFamily,
          fontSize: element.size,
          lineHeight: `${element.lineHeight}px`,
          ...boxStyle,
        }}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={`${elementKey}-${index}`}>{paragraph}</p>
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
}) {
  const { page, elementKey, element, selectedElement, invitationId, fontFamily } = props

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div className="flex justify-center py-2">
        <div
          className={getEditorAnimationClass(element.animation?.style)}
          style={{
            paddingTop: element.padding.top + 6,
            paddingBottom: element.padding.bottom + 6,
            paddingInline: 24,
            borderRadius: element.borderRadius,
            border: `${element.borderSize}px solid ${element.borderColor}`,
            color: element.color,
            background: `linear-gradient(${element.gradientAngle}deg, ${element.backgroundColor}, ${element.backgroundColor2})`,
            fontFamily,
            fontSize: element.size,
          }}
        >
          {element.content}
        </div>
      </div>
    </EditorElementFrame>
  )
}

function EditorImagePreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorImageElement
  selectedElement: string | null
  invitationId: string
}) {
  const { page, elementKey, element, selectedElement, invitationId } = props
  const src = resolveApiAssetUrl(element.content)

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div className="flex justify-center py-4">
        <div
          className={`overflow-hidden ${getEditorAnimationClass(element.animation?.style)}`}
          style={{
            width: element.size,
            height: element.size,
            borderRadius: element.borderRadius,
            border: `${element.borderSize}px solid ${element.borderColor}`,
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          {src ? (
            <img src={src} alt={elementKey} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xs text-white/70">IMAGE</div>
          )}
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
}) {
  const { page, elementKey, element, selectedElement, invitationId, fallbackImages, onOpenLightbox } = props
  const items = (element.items.length ? element.items : fallbackImages).slice(0, 9)

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div className="space-y-4 py-4">
        <p className="text-center text-lg font-semibold">{element.title}</p>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, element.columns))}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, index) => (
            <button
              key={`${elementKey}-${index}`}
              type="button"
              className="aspect-square overflow-hidden rounded-2xl bg-white/12"
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
}) {
  const { page, elementKey, element, selectedElement, invitationId } = props
  const videoUrl = element.provider === 'file' ? resolveApiAssetUrl(element.url) : element.url

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
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
    | { type: 'sponsor' | 'credit'; title: string; description: string; animation: { style: number } }
  selectedElement: string | null
  invitationId: string
}) {
  const { page, elementKey, element, selectedElement, invitationId } = props

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div
        className={`space-y-3 rounded-3xl px-5 py-5 editor-preview-glass ${getEditorAnimationClass(
          element.animation?.style,
        )}`}
      >
        <p className="text-lg font-semibold">{element.title}</p>
        {'items' in element ? (
          <div className="space-y-3 text-left">
            {element.items.map((item, index) => (
              <div key={`${elementKey}-${index}`} className="rounded-2xl bg-black/10 px-4 py-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs opacity-70">{item.date || 'Tanggal fleksibel'}</p>
                <p className="mt-2 text-sm opacity-90">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-90">{element.description}</p>
        )}
        {'buttonLabel' in element ? (
          <div className="inline-flex rounded-full border border-white/30 px-4 py-2 text-sm">
            {element.buttonLabel}
          </div>
        ) : null}
      </div>
    </EditorElementFrame>
  )
}

function EditorMapPreview(props: {
  page: SapatamuEditorPage
  elementKey: string
  element: SapatamuEditorMapElement
  selectedElement: string | null
  invitationId: string
}) {
  const { page, elementKey, element, selectedElement, invitationId } = props

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div className="rounded-3xl border border-white/16 bg-black/15 p-4">
        <div className="grid h-40 place-items-center rounded-2xl bg-white/10 text-sm">
          {element.url ? 'Google Maps Ready' : 'Tambahkan link Google Maps'}
        </div>
        <div className="mt-4 inline-flex rounded-full border border-white/24 px-4 py-2 text-sm">
          {element.content}
        </div>
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
}) {
  const { page, elementKey, element, selectedElement, invitationId } = props
  const targetDate = element.content ? new Date(element.content) : null
  const label = targetDate && !Number.isNaN(targetDate.getTime())
    ? targetDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Tentukan tanggal acara'

  return (
    <EditorElementFrame
      page={page}
      elementKey={elementKey}
      selectedElement={selectedElement}
      invitationId={invitationId}
    >
      <div
        className={`rounded-3xl px-6 py-5 text-center ${getEditorAnimationClass(element.animation?.style)}`}
        style={{
          border: `${element.borderSize}px solid ${element.borderColor}`,
          borderRadius: element.borderRadius,
          background: `linear-gradient(${element.gradientAngle}deg, ${element.backgroundColor}, ${element.backgroundColor2})`,
        }}
      >
        <p style={{ fontSize: element.size1, color: element.color1, lineHeight: 1.1 }}>45</p>
        <p style={{ fontSize: element.size2, color: element.color2 }}>{label}</p>
      </div>
    </EditorElementFrame>
  )
}

function PreviewPage(props: {
  page: SapatamuEditorPage
  invitationId: string
  selectedElement: string | null
  documentValue: ReturnType<typeof useSapatamuEditorStore.getState>['document']
  invitationLink: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  fallbackImages: string[]
  onOpenLightbox: (index: number) => void
}) {
  const { page, invitationId, selectedElement, documentValue, invitationLink, fonts, fallbackImages, onOpenLightbox } = props

  const background = getPageBackground(page, documentValue?.editor.globalBackground ?? null)
  const backgroundDetails = page.data.backgroundDetails
  const backgroundStyle =
    backgroundDetails.type === 'color'
      ? {
          background: `linear-gradient(180deg, ${backgroundDetails.gradient.from}, ${backgroundDetails.gradient.to})`,
        }
      : backgroundDetails.type === 'image' && background
        ? {
            backgroundImage: `url(${resolveApiAssetUrl(background)})`,
            backgroundSize: 'cover',
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
      className="sapatamu-editor-page sapatamu-editor-surface-grid relative overflow-hidden rounded-[32px] px-6 py-10 text-center"
      style={backgroundStyle}
    >
      {backgroundDetails.type === 'video' && background ? (
        <div className="absolute inset-0">
          <ReactPlayer
            src={resolveApiAssetUrl(background)}
            width="100%"
            height="100%"
            muted
            loop
            playing
            playsInline
          />
        </div>
      ) : null}
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative z-10 mx-auto flex max-w-[520px] flex-col gap-3">
        {pageKeys.map((key) => {
          const candidate = getEditableElement(page, key)
          if (!candidate || candidate.disabled) return null

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
                />
              )
            case 'line':
              return (
                <div key={key} className="py-3">
                  <EditorElementFrame
                    page={page}
                    elementKey={key}
                    selectedElement={selectedElement}
                    invitationId={invitationId}
                  >
                    <div className="mx-auto h-px max-w-[220px] bg-white/60" />
                  </EditorElementFrame>
                </div>
              )
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

function ControlRow(props: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{props.label}</Label>
      {props.children}
    </div>
  )
}

function InspectorTextControls(props: {
  element: SapatamuEditorTextElement
  page: SapatamuEditorPage
  elementKey: string
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, page, elementKey, fonts, onPageField } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Text">
        <Textarea
          className="min-h-28 rounded-2xl border-border/70 bg-white/80"
          value={element.content}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Font">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.font}
            onChange={(event) => onPageField(`data.${elementKey}.font`, event.target.value)}
          >
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </select>
        </ControlRow>
        <ControlRow label="Align">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.align}
            onChange={(event) => onPageField(`data.${elementKey}.align`, event.target.value)}
          >
            {TEXT_ALIGN_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Font Color">
          <Input
            className={INPUT_CLASS}
            value={element.color}
            onChange={(event) => onPageField(`data.${elementKey}.color`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Font Size">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.size}
            onChange={(event) => onPageField(`data.${elementKey}.size`, Number(event.target.value))}
          />
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Line Height">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.lineHeight}
            onChange={(event) => onPageField(`data.${elementKey}.lineHeight`, Number(event.target.value))}
          />
        </ControlRow>
        <ControlRow label="Animation">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.animation.style}
            onChange={(event) =>
              onPageField(`data.${elementKey}.animation.style`, Number(event.target.value))
            }
          >
            {ANIMATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Padding Top">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.padding.top}
            onChange={(event) => onPageField(`data.${elementKey}.padding.top`, Number(event.target.value))}
          />
        </ControlRow>
        <ControlRow label="Padding Bottom">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.padding.bottom}
            onChange={(event) => onPageField(`data.${elementKey}.padding.bottom`, Number(event.target.value))}
          />
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Text Box">
          <div className="flex h-10 items-center justify-between rounded-xl border border-border/70 bg-white/80 px-3">
            <span className="text-sm text-slate-600">Enabled</span>
            <Switch
              checked={!element.box.disabled}
              onCheckedChange={(checked) => onPageField(`data.${elementKey}.box.disabled`, !checked)}
            />
          </div>
        </ControlRow>
        <ControlRow label="Box Radius">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.box.borderRadius}
            onChange={(event) => onPageField(`data.${elementKey}.box.borderRadius`, Number(event.target.value))}
          />
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Box Color 1">
          <Input
            className={INPUT_CLASS}
            value={element.box.backgroundColor}
            onChange={(event) => onPageField(`data.${elementKey}.box.backgroundColor`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Box Color 2">
          <Input
            className={INPUT_CLASS}
            value={element.box.backgroundColor2}
            onChange={(event) => onPageField(`data.${elementKey}.box.backgroundColor2`, event.target.value)}
          />
        </ControlRow>
      </div>
      <ControlRow label="Gradient Angle">
        <Input
          type="number"
          className={INPUT_CLASS}
          value={element.box.gradientAngle}
          onChange={(event) => onPageField(`data.${elementKey}.box.gradientAngle`, Number(event.target.value))}
        />
      </ControlRow>
      <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
        Layout aktif: {page.title}. Klik elemen lain di preview untuk berpindah inspector.
      </p>
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
    <div className="space-y-5">
      <ControlRow label="Label">
        <Input
          className={INPUT_CLASS}
          value={element.content}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </ControlRow>
      <ControlRow label="Link">
        <Input
          className={INPUT_CLASS}
          value={element.link}
          onChange={(event) => onPageField(`data.${elementKey}.link`, event.target.value)}
        />
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Font">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.font}
            onChange={(event) => onPageField(`data.${elementKey}.font`, event.target.value)}
          >
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </select>
        </ControlRow>
        <ControlRow label="Font Size">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.size}
            onChange={(event) => onPageField(`data.${elementKey}.size`, Number(event.target.value))}
          />
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Text Color">
          <Input
            className={INPUT_CLASS}
            value={element.color}
            onChange={(event) => onPageField(`data.${elementKey}.color`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Background">
          <Input
            className={INPUT_CLASS}
            value={element.backgroundColor}
            onChange={(event) => onPageField(`data.${elementKey}.backgroundColor`, event.target.value)}
          />
        </ControlRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Border Radius">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.borderRadius}
            onChange={(event) => onPageField(`data.${elementKey}.borderRadius`, Number(event.target.value))}
          />
        </ControlRow>
        <ControlRow label="Animation">
          <select
            className={`${INPUT_CLASS} w-full border px-3`}
            value={element.animation.style}
            onChange={(event) =>
              onPageField(`data.${elementKey}.animation.style`, Number(event.target.value))
            }
          >
            {ANIMATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </ControlRow>
      </div>
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
    <div className="space-y-5">
      <ControlRow label="Image Source">
        <div className="flex gap-3">
          <Input
            className={INPUT_CLASS}
            value={element.content}
            onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
          />
          <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenMedia}>
            <ImagePlus className="mr-2 size-4" />
            Media
          </Button>
        </div>
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Size">
          <Input
            type="number"
            className={INPUT_CLASS}
            value={element.size}
            onChange={(event) => onPageField(`data.${elementKey}.size`, Number(event.target.value))}
          />
        </ControlRow>
        <ControlRow label="Radius">
          <Input
            className={INPUT_CLASS}
            value={element.borderRadius}
            onChange={(event) => onPageField(`data.${elementKey}.borderRadius`, event.target.value)}
          />
        </ControlRow>
      </div>
    </div>
  )
}

function InspectorTimerControls(props: {
  element: SapatamuEditorTimerElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, onPageField } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Target Date">
        <Input
          type="datetime-local"
          className={INPUT_CLASS}
          value={element.content.slice(0, 16)}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </ControlRow>
      <div className="grid grid-cols-2 gap-3">
        <ControlRow label="Accent Color">
          <Input
            className={INPUT_CLASS}
            value={element.color1}
            onChange={(event) => onPageField(`data.${elementKey}.color1`, event.target.value)}
          />
        </ControlRow>
        <ControlRow label="Surface Color">
          <Input
            className={INPUT_CLASS}
            value={element.backgroundColor}
            onChange={(event) => onPageField(`data.${elementKey}.backgroundColor`, event.target.value)}
          />
        </ControlRow>
      </div>
    </div>
  )
}

function InspectorMapControls(props: {
  element: SapatamuEditorMapElement
  elementKey: string
  onPageField: (path: string, value: unknown) => void
}) {
  const { element, elementKey, onPageField } = props

  return (
    <div className="space-y-5">
      <ControlRow label="Button Label">
        <Input
          className={INPUT_CLASS}
          value={element.content}
          onChange={(event) => onPageField(`data.${elementKey}.content`, event.target.value)}
        />
      </ControlRow>
      <ControlRow label="Map URL">
        <Input
          className={INPUT_CLASS}
          value={element.url}
          onChange={(event) => onPageField(`data.${elementKey}.url`, event.target.value)}
        />
      </ControlRow>
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

function SectionInspector(props: {
  page: SapatamuEditorPage
  invitationId: string
  selectedElement: string | null
  fonts: SapatamuEditorHydrationResponse['catalog']['fonts']
  onPageField: (path: string, value: unknown) => void
  onRemovePage: () => void
  onOpenMedia: (target: MediaPickerTarget) => void
}) {
  const { page, selectedElement, fonts, onPageField, onRemovePage, onOpenMedia } = props
  const element = getEditableElement(page, selectedElement)
  const elementType = getElementTypeFromKey(page, selectedElement)

  if (!selectedElement || !element || !elementType) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-white/85 p-5 sapatamu-editor-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{page.title}</p>
              <p className="text-xs text-slate-500">
                {page.layoutCode} · {page.family}
              </p>
            </div>
            {page.source === 'addon' ? (
              <Button type="button" variant="outline" className="rounded-xl" onClick={onRemovePage}>
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            ) : null}
          </div>
        </div>
        <div className="rounded-3xl bg-white/85 p-5 sapatamu-editor-card">
          <div className="space-y-5">
            <ControlRow label="Section Title">
              <Input
                className={INPUT_CLASS}
                value={page.title}
                onChange={(event) => onPageField('title', event.target.value)}
              />
            </ControlRow>
            <div className="grid grid-cols-2 gap-3">
              <ControlRow label="Background Type">
                <select
                  className={`${INPUT_CLASS} w-full border px-3`}
                  value={page.data.backgroundDetails.type}
                  onChange={(event) => onPageField('data.backgroundDetails.type', event.target.value)}
                >
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </ControlRow>
              <ControlRow label="Background Color">
                <Input
                  className={INPUT_CLASS}
                  value={page.data.backgroundDetails.color}
                  onChange={(event) => onPageField('data.backgroundDetails.color', event.target.value)}
                />
              </ControlRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ControlRow label="Gradient From">
                <Input
                  className={INPUT_CLASS}
                  value={page.data.backgroundDetails.gradient.from}
                  onChange={(event) => onPageField('data.backgroundDetails.gradient.from', event.target.value)}
                />
              </ControlRow>
              <ControlRow label="Gradient To">
                <Input
                  className={INPUT_CLASS}
                  value={page.data.backgroundDetails.gradient.to}
                  onChange={(event) => onPageField('data.backgroundDetails.gradient.to', event.target.value)}
                />
              </ControlRow>
            </div>
            <ControlRow label="Background Media">
              <div className="flex gap-3">
                <Input
                  className={INPUT_CLASS}
                  value={page.data.background ?? ''}
                  onChange={(event) => onPageField('data.background', event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    onOpenMedia({
                      kind: 'page-background',
                      pageUniqueId: page.uniqueId,
                      mediaType: page.data.backgroundDetails.type === 'video' ? 'video' : 'image',
                    })
                  }
                >
                  <ImagePlus className="mr-2 size-4" />
                  Media
                </Button>
              </div>
            </ControlRow>
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
          page={page}
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
          onPageField={(path, value) => onPageField(path, value)}
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
        <InspectorSimpleCardControls
          elementKey={selectedElement}
          title={(element as SapatamuEditorStoryElement).title}
          description="Edit detail item Love Story langsung pada payload JSON untuk tahap awal."
          onPageField={() => {}}
        />
      )
    case 'sponsor':
    case 'credit':
      return (
        <InspectorSimpleCardControls
          elementKey={selectedElement}
          title={(element as { title: string }).title}
          description={(element as { description: string }).description}
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

export function CmsSapatamuEditor() {
  const navigate = useNavigate()
  const { invitationId = '', pageSlug } = useParams<{ invitationId: string; pageSlug?: string }>()
  const [searchParams] = useSearchParams()
  const selectedElement = searchParams.get('element')
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<MediaPickerTarget | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({ axis: 'y', containScroll: 'trimSnaps', dragFree: false })
  const previousRouteRef = useRef<{ pageSlug?: string; element: string | null }>({
    pageSlug,
    element: selectedElement,
  })

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
    updatePageField,
    reorderPages,
    togglePage,
    addPage,
    removePage,
    uploadMedia,
    setLightbox,
  } = useSapatamuEditorStore()

  const page = findEditorPageBySlug(documentValue, pageSlug)
  const currentPageIndex = getEditorActivePageIndex(documentValue, pageSlug)
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
    if (!documentValue?.editor.pages.length || !invitationId) return
    if (pageSlug) return
    updateQueryElement(navigate, invitationId, documentValue.editor.pages[0].slug, null)
  }, [documentValue?.editor.pages, invitationId, navigate, pageSlug])

  useEffect(() => {
    if (!emblaApi || !documentValue?.editor.pages.length) return
    emblaApi.scrollTo(currentPageIndex)
  }, [currentPageIndex, documentValue?.editor.pages.length, emblaApi])

  useEffect(() => {
    if (!emblaApi || !documentValue?.editor.pages.length || !invitationId) return

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap()
      const nextPage = documentValue.editor.pages[index]
      if (!nextPage || nextPage.slug === page?.slug) return
      updateQueryElement(navigate, invitationId, nextPage.slug, selectedElement)
    }

    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [documentValue?.editor.pages, emblaApi, invitationId, navigate, page?.slug, selectedElement])

  useEffect(() => {
    if (!invitationId) return
    if (pendingOperations.length === 0) return

    const timeout = window.setTimeout(() => {
      void flushPending(invitationId)
    }, session?.autoSaveDelayMs ?? 500)

    return () => window.clearTimeout(timeout)
  }, [flushPending, invitationId, pendingOperations.length, session?.autoSaveDelayMs])

  useEffect(() => {
    if (!invitationId) return
    const previous = previousRouteRef.current

    if (previous.pageSlug !== pageSlug || previous.element !== selectedElement) {
      if (pendingOperations.length > 0) {
        void flushPending(invitationId)
      }
      previousRouteRef.current = {
        pageSlug,
        element: selectedElement,
      }
    }
  }, [flushPending, invitationId, pageSlug, pendingOperations.length, selectedElement])

  useEffect(() => {
    const onBeforeUnload = () => {
      if (pendingOperations.length > 0 && invitationId) {
        void flushPending(invitationId)
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [flushPending, invitationId, pendingOperations.length])

  const handleOpenMedia = (target: MediaPickerTarget) => {
    setMediaTarget(target)
    setMediaDialogOpen(true)
  }

  const handleMediaPick = (mediaUrl: string) => {
    if (!mediaTarget || !page) return

    if (mediaTarget.kind === 'page-background') {
      updatePageField(mediaTarget.pageUniqueId, 'data.background', mediaUrl)
    }

    if (mediaTarget.kind === 'element-image') {
      updatePageField(mediaTarget.pageUniqueId, `data.${mediaTarget.elementKey}.content`, mediaUrl)
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
          <aside className="sapatamu-editor-sidebar overflow-hidden rounded-[22px] border border-white/50 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
            <div className="border-b border-white/50 px-6 py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-0 text-muted-foreground hover:bg-transparent"
                  onClick={() => navigate(`/cms/sapatamu/${invitationId}/send`)}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  {pendingOperations.length > 0 ? <Badge>Pending</Badge> : null}
                  {isSaving ? (
                    <Badge variant="outline">
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      Saving
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Editor</p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-900">{invitation.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{invitation.slug}</Badge>
                    <Badge variant="outline">{documentValue.selectedTheme}</Badge>
                  </div>
                </div>
                <Switch
                  checked={documentValue.editor.fullScreen.enabled}
                  onCheckedChange={(checked) => {
                    pageField('data.backgroundDetails.gradient.disabled', false)
                    useSapatamuEditorStore.getState().updateGlobalField('editor.fullScreen.enabled', checked)
                  }}
                />
              </div>
            </div>

            <div className="space-y-5 p-5">
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
                <Button
                  className="mt-4 w-full rounded-2xl"
                  variant="outline"
                  onClick={() => setLayoutDialogOpen(true)}
                >
                  <Plus className="mr-2 size-4" />
                  Add Layout
                </Button>
              </div>

              <div className="rounded-3xl bg-white/80 p-4 sapatamu-editor-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Inspector
                </p>
                <div className="mt-4">
                  <SectionInspector
                    page={page}
                    invitationId={invitationId}
                    selectedElement={selectedElement}
                    fonts={catalog.fonts}
                    onPageField={pageField}
                    onRemovePage={() => void removePage(invitationId, page.uniqueId)}
                    onOpenMedia={handleOpenMedia}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-white/80 p-4 sapatamu-editor-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-4 text-slate-400" />
                  <div className="space-y-2 text-xs text-slate-500">
                    <p>Available variables</p>
                    <div className="flex flex-wrap gap-2">
                      {session.availableVariables.slice(0, 8).map((item) => (
                        <Badge key={item.token} variant="outline">
                          {`{{${item.token}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="sapatamu-editor-preview-stage">
            <Button
              type="button"
              variant="outline"
              className="sapatamu-editor-background-action rounded-full"
              onClick={() => handleOpenMedia({ kind: 'page-background', pageUniqueId: page.uniqueId, mediaType: 'image' })}
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
                      selectedElement={previewPage.slug === page.slug ? selectedElement : null}
                      documentValue={documentValue}
                      invitationLink={invitation.publicUrl}
                      fonts={catalog.fonts}
                      fallbackImages={fallbackImages}
                      onOpenLightbox={(index) => setLightbox({ open: true, index })}
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
