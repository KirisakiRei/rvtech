const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const tenantSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'pages', 'tenant', 'TenantWeddingPage.tsx'),
  'utf8',
)
const cssSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'pages', 'cms', 'sapatamu', 'editor', 'sapatamu-editor.css'),
  'utf8',
)

assert.match(tenantSource, /sapatamu-public-music-toggle/)
assert.match(cssSource, /\.sapatamu-public-music-toggle/)
assert.match(cssSource, /bottom:\s*calc\(env\(safe-area-inset-bottom,\s*0px\) \+ 76px\)/)

console.log('public-music-toggle-position tests passed')
