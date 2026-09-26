/**
 * On-device OCR for the warehouse PWA.
 * - Vendored Tesseract assets under /ocr (no CDN at runtime)
 * - Warm singleton worker kept alive between scans
 * - Canvas preprocess (downscale + grayscale) for tablet/phone speed
 */

const MAX_EDGE = 1280
const OCR_CHAR_WHITELIST =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /.#()-_'

let workerPromise = null
let warmStatus = 'cold' // cold | warming | ready | error
let lastError = ''
let progressSink = null

export function getLocalOcrStatus() {
  return { status: warmStatus, error: lastError }
}

function ocrPaths() {
  const base = `${window.location.origin}/ocr`
  return {
    workerPath: `${base}/worker.min.js`,
    langPath: base,
    // Directory form lets tesseract.js pick SIMD vs non-SIMD LSTM builds
    corePath: base,
  }
}

async function createWarmWorker() {
  const { createWorker } = await import('tesseract.js')
  const paths = ocrPaths()
  const worker = await createWorker('eng', 1, {
    ...paths,
    logger: (m) => {
      if (!progressSink || typeof m.progress !== 'number') return
      if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract' || m.status === 'loading language traineddata') {
        progressSink({ stage: 'engine', progress: 12 + Math.round(m.progress * 25) })
      }
      if (m.status === 'recognizing text') {
        progressSink({ stage: 'recognizing', progress: 40 + Math.round(m.progress * 55) })
      }
    },
  })

  await worker.setParameters({
    tessedit_pageseg_mode: '6',
    tessedit_char_whitelist: OCR_CHAR_WHITELIST,
    preserve_interword_spaces: '1',
  })

  return worker
}

/** Prefetch + init OCR worker in the background (call on app idle / scan open). */
export function warmLocalOcr() {
  if (workerPromise) return workerPromise
  warmStatus = 'warming'
  lastError = ''
  workerPromise = createWarmWorker()
    .then((worker) => {
      warmStatus = 'ready'
      return worker
    })
    .catch((err) => {
      warmStatus = 'error'
      lastError = err?.message || 'OCR engine failed to start'
      workerPromise = null
      throw err
    })
  return workerPromise
}

/**
 * Shrink + grayscale a photo/video frame for faster on-device OCR.
 * @param {Blob|File|HTMLCanvasElement|HTMLVideoElement|HTMLImageElement|ImageBitmap} source
 * @returns {Promise<Blob>}
 */
export async function preprocessForOcr(source) {
  const bitmap =
    typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap
      ? source
      : source instanceof HTMLVideoElement ||
          source instanceof HTMLCanvasElement ||
          source instanceof HTMLImageElement
        ? source
        : await createImageBitmap(source)

  let width
  let height
  if (bitmap instanceof HTMLVideoElement) {
    width = bitmap.videoWidth
    height = bitmap.videoHeight
  } else {
    width = bitmap.width
    height = bitmap.height
  }

  if (!width || !height) {
    throw new Error('Could not read image dimensions')
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, w, h)

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const v = Math.max(0, Math.min(255, (y - 128) * 1.25 + 128))
    data[i] = data[i + 1] = data[i + 2] = v
  }
  ctx.putImageData(imageData, 0, 0)

  if (typeof bitmap.close === 'function') bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image preprocess failed'))),
      'image/jpeg',
      0.82,
    )
  })
  return blob
}

/**
 * Run local OCR. Reuses the warm worker for subsequent scans.
 * @returns {Promise<{ text: string, ms: number }>}
 */
export async function recognizeSheetLocal(source, onProgress) {
  const started = performance.now()
  progressSink = onProgress || null
  onProgress?.({ stage: 'preprocess', progress: 5 })
  const prepared = await preprocessForOcr(source)
  onProgress?.({ stage: 'engine', progress: 12 })

  const worker = await warmLocalOcr()
  onProgress?.({ stage: 'recognizing', progress: 40 })
  const {
    data: { text },
  } = await worker.recognize(prepared)

  onProgress?.({ stage: 'done', progress: 100 })
  progressSink = null
  return { text: text || '', ms: Math.round(performance.now() - started) }
}

export async function terminateLocalOcr() {
  if (!workerPromise) return
  try {
    const worker = await workerPromise
    await worker.terminate()
  } catch {
    // ignore
  } finally {
    workerPromise = null
    warmStatus = 'cold'
    progressSink = null
  }
}
