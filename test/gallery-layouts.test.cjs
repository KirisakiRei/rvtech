const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadGalleryLayouts() {
  const sourcePath = path.join(__dirname, '..', 'src', 'pages', 'cms', 'sapatamu', 'editor', 'gallery-layouts.ts')
  const source = fs.readFileSync(sourcePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText
  const module = { exports: {} }
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', transpiled)
  fn(module.exports, require, module, sourcePath, path.dirname(sourcePath))
  return module.exports
}

const {
  GALLERY_LAYOUT_VARIANTS,
  getGalleryFrameLayout,
  getGalleryLayoutVariant,
  getGallerySlotFrame,
  getGalleryVariantFrameSettings,
  normalizeGalleryVariant,
} = loadGalleryLayouts()

assert.deepEqual(
  GALLERY_LAYOUT_VARIANTS.map((variant) => [variant.id, variant.previewImage, variant.slotCount]),
  [
    ['gallery-stack', '/sapatamu-layouts/galeri.webp', 1],
    ['gallery-duo', '/sapatamu-layouts/galeri1.webp', 2],
    ['gallery-hero-trio', '/sapatamu-layouts/galeri2.webp', 3],
    ['gallery-quad-offset', '/sapatamu-layouts/galeri3.webp', 4],
    ['gallery-quad-grid', '/sapatamu-layouts/galeri4.webp', 4],
    ['gallery-mosaic-six', '/sapatamu-layouts/galeri5.webp', 6],
  ],
)

assert.equal(normalizeGalleryVariant('gallery-duo'), 'gallery-duo')
assert.equal(normalizeGalleryVariant('bento-feature-left'), 'gallery-mosaic-six')
assert.equal(normalizeGalleryVariant(undefined), 'gallery-mosaic-six')
assert.equal(getGalleryLayoutVariant('gallery-hero-trio').slotCount, 3)
assert.deepEqual(
  getGalleryFrameLayout('gallery-duo').slots.map((slot) => [slot.colStart, slot.rowStart, slot.colSpan, slot.rowSpan]),
  [
    [1, 1, 6, 2],
    [1, 3, 6, 2],
  ],
)
assert.deepEqual(
  getGallerySlotFrame('gallery-quad-offset', 0, {
    slots: [{ colSpan: 5, rowSpan: 3 }],
  }),
  { colStart: 1, rowStart: 1, colSpan: 5, rowSpan: 3 },
)

const perVariantSettings = {
  'gallery-stack': {
    columns: 6,
    rowHeight: 96,
    gap: 10,
    slots: [{ colStart: 1, rowStart: 1, colSpan: 6, rowSpan: 5 }],
  },
  'gallery-duo': {
    columns: 6,
    rowHeight: 72,
    gap: 6,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 2 },
      { colStart: 4, rowStart: 1, colSpan: 3, rowSpan: 2 },
    ],
  },
}

assert.equal(getGalleryVariantFrameSettings('gallery-stack', perVariantSettings).rowHeight, 96)
assert.equal(getGalleryVariantFrameSettings('gallery-duo', perVariantSettings).rowHeight, 72)
assert.deepEqual(
  getGalleryFrameLayout('gallery-stack', getGalleryVariantFrameSettings('gallery-stack', perVariantSettings)).slots.map((slot) => [slot.colStart, slot.rowStart, slot.colSpan, slot.rowSpan]),
  [[1, 1, 6, 5]],
)
assert.deepEqual(
  getGalleryFrameLayout('gallery-duo', getGalleryVariantFrameSettings('gallery-duo', perVariantSettings)).slots.map((slot) => [slot.colStart, slot.rowStart, slot.colSpan, slot.rowSpan]),
  [
    [1, 1, 3, 2],
    [4, 1, 3, 2],
  ],
)
assert.deepEqual(
  getGalleryVariantFrameSettings('gallery-duo', { 'gallery-stack': perVariantSettings['gallery-stack'] }, { rowHeight: 120 }),
  {},
)

console.log('gallery-layouts tests passed')
