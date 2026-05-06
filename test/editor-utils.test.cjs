const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadEditorUtils() {
  const sourcePath = path.join(__dirname, '..', 'src', 'pages', 'cms', 'sapatamu', 'editor', 'editor-utils.ts')
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
  getEditorDisplayContent,
  getEditorPlainTextInputValue,
  getGoogleMapEmbedUrl,
  isGoogleMapsShortUrl,
  mergePageDataWithDesignDefaults,
} = loadEditorUtils()

assert.equal(
  getEditorDisplayContent('Halo {{nick-name-1}}', null, '/demo', { resolveTokens: false }),
  'Halo {{nick-name-1}}',
)

assert.equal(
  getEditorDisplayContent('Halo {{nick-name-1}}', {
    profiles: [{ fullName: 'Ayu Larasati', nickName: 'Ayu' }],
    events: [],
  }, '/demo'),
  'Halo Ayu',
)

assert.equal(isGoogleMapsShortUrl('https://maps.app.goo.gl/abc123'), true)

assert.equal(getGoogleMapEmbedUrl('https://maps.app.goo.gl/abc123'), '')

assert.equal(
  getGoogleMapEmbedUrl('https://www.google.com/maps/place/Bandung,+Bandung+City,+West+Java/@-6.903363,107.6081381,13z/data=!3m1!4b1!4m5!3m4!1s0x2e68e6398252477f:0x146a1f93d3e815b2!8m2!3d-6.9174639!4d107.6191228?shorturl=1'),
  'https://maps.google.com/maps?q=-6.9174639,107.6191228&output=embed',
)

assert.equal(getEditorPlainTextInputValue(' Halo '), ' Halo ')
assert.equal(getEditorPlainTextInputValue('<p>Halo&nbsp; </p><p> Dunia</p>'), 'Halo  \n Dunia')

assert.deepEqual(
  mergePageDataWithDesignDefaults(
    {
      text1: {
        type: 'text',
        content: 'CUSTOM COPY',
        size: 42,
        padding: {
          x: 24,
          y: -12,
          top: 8,
        },
      },
    },
    {
      text1: {
        type: 'text',
        content: 'DEFAULT COPY',
        size: 18,
        color: '#111111',
        padding: {
          x: 0,
          y: 0,
          top: 0,
          bottom: 16,
        },
      },
    },
  ).text1,
  {
    type: 'text',
    content: 'CUSTOM COPY',
    size: 42,
    color: '#111111',
    padding: {
      x: 24,
      y: -12,
      top: 8,
      bottom: 16,
    },
  },
)

assert.deepEqual(
  mergePageDataWithDesignDefaults(
    {
      text1: {
        type: 'text',
        content: 'CUSTOM COPY',
        size: 42,
      },
    },
    undefined,
  ).text1,
  {
    type: 'text',
    content: 'CUSTOM COPY',
    size: 42,
  },
)

console.log('editor-utils tests passed')
