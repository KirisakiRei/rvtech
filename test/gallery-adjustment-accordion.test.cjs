const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const sourcePath = path.join(__dirname, '..', 'src', 'pages', 'cms', 'sapatamu', 'CmsSapatamuEditor.tsx')
const source = fs.readFileSync(sourcePath, 'utf8')

assert.match(source, /openAdjustmentIndex/)
assert.match(source, /Atur posisi/)
assert.match(source, /aria-expanded=\{openAdjustmentIndex === index\}/)
assert.match(source, /openAdjustmentIndex === index \?/)

console.log('gallery-adjustment-accordion tests passed')
