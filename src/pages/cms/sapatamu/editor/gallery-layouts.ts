export interface GallerySlotFrame {
  colStart: number
  rowStart: number
  colSpan: number
  rowSpan: number
}

export interface GalleryFrameLayout {
  columns: number
  rowHeight: number
  gap: number
  slots: GallerySlotFrame[]
}

export interface GalleryFrameSettings {
  columns?: number
  rowHeight?: number
  gap?: number
  slots?: Array<Partial<GallerySlotFrame> | undefined>
}

export type GalleryFrameSettingsByVariant = Partial<Record<GalleryLayoutVariantId, GalleryFrameSettings>>

export const GALLERY_LAYOUT_VARIANTS = [
  {
    id: 'gallery-stack',
    label: 'Galeri 1',
    previewImage: '/sapatamu-layouts/galeri.webp',
    slotCount: 1,
    className: 'gallery-stack',
    frameLayout: {
      columns: 6,
      rowHeight: 64,
      gap: 8,
      slots: [{ colStart: 1, rowStart: 1, colSpan: 6, rowSpan: 4 }],
    },
  },
  {
    id: 'gallery-duo',
    label: 'Galeri 2',
    previewImage: '/sapatamu-layouts/galeri1.webp',
    slotCount: 2,
    className: 'gallery-duo',
    frameLayout: {
      columns: 6,
      rowHeight: 64,
      gap: 8,
      slots: [
        { colStart: 1, rowStart: 1, colSpan: 6, rowSpan: 2 },
        { colStart: 1, rowStart: 3, colSpan: 6, rowSpan: 2 },
      ],
    },
  },
  {
    id: 'gallery-hero-trio',
    label: 'Galeri 3',
    previewImage: '/sapatamu-layouts/galeri2.webp',
    slotCount: 3,
    className: 'gallery-hero-trio',
    frameLayout: {
      columns: 6,
      rowHeight: 64,
      gap: 8,
      slots: [
        { colStart: 1, rowStart: 1, colSpan: 6, rowSpan: 2 },
        { colStart: 1, rowStart: 3, colSpan: 4, rowSpan: 2 },
        { colStart: 5, rowStart: 3, colSpan: 2, rowSpan: 2 },
      ],
    },
  },
  {
    id: 'gallery-quad-offset',
    label: 'Galeri 4',
    previewImage: '/sapatamu-layouts/galeri3.webp',
    slotCount: 4,
    className: 'gallery-quad-offset',
    frameLayout: {
      columns: 6,
      rowHeight: 64,
      gap: 8,
      slots: [
        { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { colStart: 3, rowStart: 1, colSpan: 4, rowSpan: 2 },
        { colStart: 1, rowStart: 3, colSpan: 4, rowSpan: 2 },
        { colStart: 5, rowStart: 3, colSpan: 2, rowSpan: 2 },
      ],
    },
  },
  {
    id: 'gallery-quad-grid',
    label: 'Galeri 5',
    previewImage: '/sapatamu-layouts/galeri4.webp',
    slotCount: 4,
    className: 'gallery-quad-grid',
    frameLayout: {
      columns: 6,
      rowHeight: 64,
      gap: 8,
      slots: [
        { colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 2 },
        { colStart: 4, rowStart: 1, colSpan: 3, rowSpan: 2 },
        { colStart: 1, rowStart: 3, colSpan: 3, rowSpan: 2 },
        { colStart: 4, rowStart: 3, colSpan: 3, rowSpan: 2 },
      ],
    },
  },
  {
    id: 'gallery-mosaic-six',
    label: 'Galeri 6',
    previewImage: '/sapatamu-layouts/galeri5.webp',
    slotCount: 6,
    className: 'gallery-mosaic-six',
    frameLayout: {
      columns: 6,
      rowHeight: 56,
      gap: 8,
      slots: [
        { colStart: 1, rowStart: 1, colSpan: 4, rowSpan: 2 },
        { colStart: 5, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { colStart: 1, rowStart: 3, colSpan: 2, rowSpan: 2 },
        { colStart: 3, rowStart: 3, colSpan: 4, rowSpan: 2 },
        { colStart: 1, rowStart: 5, colSpan: 4, rowSpan: 2 },
        { colStart: 5, rowStart: 5, colSpan: 2, rowSpan: 2 },
      ],
    },
  },
] as const

export type GalleryLayoutVariantId = (typeof GALLERY_LAYOUT_VARIANTS)[number]['id']
export type GalleryLayoutVariant = (typeof GALLERY_LAYOUT_VARIANTS)[number]

const GALLERY_LAYOUT_VARIANT_IDS = new Set<string>(GALLERY_LAYOUT_VARIANTS.map((variant) => variant.id))

export function normalizeGalleryVariant(variant?: string | null): GalleryLayoutVariantId {
  return GALLERY_LAYOUT_VARIANT_IDS.has(variant ?? '')
    ? (variant as GalleryLayoutVariantId)
    : 'gallery-mosaic-six'
}

export function getGalleryLayoutVariant(variant?: string | null): GalleryLayoutVariant {
  const normalized = normalizeGalleryVariant(variant)
  return GALLERY_LAYOUT_VARIANTS.find((item) => item.id === normalized) ?? GALLERY_LAYOUT_VARIANTS[5]
}

export function getGalleryVariantFrameSettings(
  variant?: string | null,
  settingsByVariant?: GalleryFrameSettingsByVariant | null,
  legacySettings?: GalleryFrameSettings | null,
): GalleryFrameSettings {
  const normalized = normalizeGalleryVariant(variant)
  if (settingsByVariant && Object.keys(settingsByVariant).length > 0) {
    return settingsByVariant[normalized] ?? {}
  }
  return legacySettings ?? {}
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const next = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(next)) return fallback
  return Math.min(max, Math.max(min, next))
}

export function getGalleryFrameLayout(
  variant?: string | null,
  overrides?: GalleryFrameSettings | null,
): GalleryFrameLayout {
  const base = getGalleryLayoutVariant(variant).frameLayout
  return {
    columns: clampNumber(overrides?.columns, 1, 12, base.columns),
    rowHeight: clampNumber(overrides?.rowHeight, 24, 180, base.rowHeight),
    gap: clampNumber(overrides?.gap, 0, 32, base.gap),
    slots: base.slots.map((slot, index) => ({
      colStart: clampNumber(overrides?.slots?.[index]?.colStart, 1, 12, slot.colStart),
      rowStart: clampNumber(overrides?.slots?.[index]?.rowStart, 1, 12, slot.rowStart),
      colSpan: clampNumber(overrides?.slots?.[index]?.colSpan, 1, 12, slot.colSpan),
      rowSpan: clampNumber(overrides?.slots?.[index]?.rowSpan, 1, 8, slot.rowSpan),
    })),
  }
}

export function getGallerySlotFrame(
  variant: string | null | undefined,
  slotIndex: number,
  overrides?: GalleryFrameSettings | null,
): GallerySlotFrame {
  const layout = getGalleryFrameLayout(variant, overrides)
  return layout.slots[slotIndex] ?? layout.slots[0] ?? { colStart: 1, rowStart: 1, colSpan: layout.columns, rowSpan: 2 }
}
