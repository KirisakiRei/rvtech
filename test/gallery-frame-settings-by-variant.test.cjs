const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const adminSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'pages', 'admin', 'AdminSapatamuTemplateEditor.tsx'),
  'utf8',
)
const editorSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'pages', 'cms', 'sapatamu', 'CmsSapatamuEditor.tsx'),
  'utf8',
)

assert.match(adminSource, /frameSettingsByVariant\.\$\{variant\}/)
assert.doesNotMatch(adminSource, /props\.onChange\(`\$\{props\.elementKey\}\.frameSettings`/)
assert.match(editorSource, /getGalleryVariantFrameSettings\(element\.variant, element\.frameSettingsByVariant, element\.frameSettings\)/)

console.log('gallery-frame-settings-by-variant tests passed')
