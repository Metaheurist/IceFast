/**
 * Vendor Tesseract worker/core + English traineddata into public/ocr
 * so OCR runs fully on-device (no CDN after install / first sync).
 */
import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'ocr')
const workerSrc = join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js')
const coreDir = join(root, 'node_modules', 'tesseract.js-core')
const langUrl = 'https://tessdata.projectnaptha.com/4.0.0_fast/eng.traineddata.gz'

mkdirSync(outDir, { recursive: true })

copyFileSync(workerSrc, join(outDir, 'worker.min.js'))

for (const name of [
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-lstm.wasm',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-simd.wasm',
  'tesseract-core.wasm.js',
  'tesseract-core.wasm',
]) {
  const src = join(coreDir, name)
  if (existsSync(src)) copyFileSync(src, join(outDir, name))
}

const langPath = join(outDir, 'eng.traineddata.gz')
if (!existsSync(langPath)) {
  console.log('Downloading eng.traineddata.gz (fast int)…')
  const res = await fetch(langUrl)
  if (!res.ok) throw new Error(`Failed to download language data: ${res.status}`)
  writeFileSync(langPath, Buffer.from(await res.arrayBuffer()))
}

writeFileSync(
  join(outDir, 'README.txt'),
  'Local OCR assets for IceFast PWA. Served from /ocr and cached by the service worker.\n',
)

console.log(`OCR assets ready in ${outDir}`)
