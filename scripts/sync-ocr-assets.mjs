/**
 * Vendor Tesseract worker/core + English traineddata into public/ocr
 * so OCR runs fully on-device (no CDN after install / first sync).
 */
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'ocr')
const workerSrc = join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js')
const coreDir = join(root, 'node_modules', 'tesseract.js-core')
const langUrl = 'https://tessdata.projectnaptha.com/4.0.0_fast/eng.traineddata.gz'
const langSha256 = '18c1ac52b75e35d44735fb6c2a60acfaf23033524653200738e98f0243edb75b'

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

mkdirSync(outDir, { recursive: true })

copyFileSync(workerSrc, join(outDir, 'worker.min.js'))

for (const name of [
  'tesseract-core-relaxedsimd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm',
  'tesseract-core-relaxedsimd.wasm.js',
  'tesseract-core-relaxedsimd.wasm',
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
const haveValidLang = existsSync(langPath) && sha256(readFileSync(langPath)) === langSha256
if (!haveValidLang) {
  console.log('Downloading eng.traineddata.gz (fast int)…')
  const res = await fetch(langUrl)
  if (!res.ok) throw new Error(`Failed to download language data: ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())
  const actual = sha256(data)
  if (actual !== langSha256) {
    throw new Error(`eng.traineddata.gz checksum mismatch: expected ${langSha256}, got ${actual}`)
  }
  const tmpPath = `${langPath}.${process.pid}.tmp`
  try {
    writeFileSync(tmpPath, data, { flag: 'wx' })
    renameSync(tmpPath, langPath)
  } finally {
    rmSync(tmpPath, { force: true })
  }
}

writeFileSync(
  join(outDir, 'README.txt'),
  'Local OCR assets for IceFast PWA. Served from /ocr and cached by the service worker.\n',
)

console.log(`OCR assets ready in ${outDir}`)
