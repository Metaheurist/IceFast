import { Camera, Loader2, ScanLine, SwitchCamera, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { matchLoadsFromSheetText } from '../data'
import { useApp } from '../AppContext'
import { buildDemoOcrSample } from '../seed/generateDemoDay'
import {
  getLocalOcrStatus,
  recognizeSheetLocal,
  warmLocalOcr,
} from '../ocr/localOcr'

export default function SheetScanModal({ open, onClose }) {
  const { trailers, setSearchQuery, setStatusFilter, setTempFilter } = useApp()
  const inputId = useId()
  const inputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [previewUrl, setPreviewUrl] = useState(null)
  const [captureBlob, setCaptureBlob] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState('environment')
  const [phase, setPhase] = useState('idle') // idle | reading | done | error
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')
  const [usedDemo, setUsedDemo] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(null)
  const [engineStatus, setEngineStatus] = useState(() => getLocalOcrStatus().status)

  const stopCamera = () => {
    streamRef.current?.getTracks()?.forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }

  const startCamera = async (facing = facingMode) => {
    setCameraError('')
    stopCamera()
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API not available - use Take / choose photo instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      setCameraOn(true)
      setFacingMode(facing)
      // attach after paint
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          Promise.resolve(videoRef.current.play?.()).catch(() => {})
        }
      })
    } catch (err) {
      setCameraError(err?.message || 'Could not open camera')
      setCameraOn(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Warm local OCR assets as soon as scan opens
    warmLocalOcr()
      .then(() => setEngineStatus('ready'))
      .catch(() => setEngineStatus(getLocalOcrStatus().status))

    startCamera('environment')

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!open) return null

  const resetCapture = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCaptureBlob(null)
    setPhase('idle')
    setProgress(0)
    setProgressLabel('')
    setOcrText('')
    setMatches([])
    setError('')
    setUsedDemo(false)
    setElapsedMs(null)
  }

  const applyMatches = (text, demo = false, ms = null) => {
    const ranked = matchLoadsFromSheetText(trailers, text)
    setOcrText(text)
    setMatches(ranked)
    setUsedDemo(demo)
    setElapsedMs(ms)
    setPhase('done')
    setProgress(100)
    setProgressLabel('Done')
  }

  const runOcrOnBlob = async (blob) => {
    setPhase('reading')
    setProgress(4)
    setProgressLabel('Preparing…')
    setError('')
    setUsedDemo(false)
    try {
      const { text, ms } = await recognizeSheetLocal(blob, ({ stage, progress: p }) => {
        setProgress(p)
        if (stage === 'preprocess') setProgressLabel('Sharpening frame…')
        else if (stage === 'engine') setProgressLabel('Loading on-device engine…')
        else if (stage === 'recognizing') setProgressLabel('Reading sheet…')
        else if (stage === 'done') setProgressLabel('Matching loads…')
      })
      setEngineStatus('ready')
      applyMatches(text, false, ms)
    } catch (err) {
      setPhase('error')
      setError(err?.message || 'OCR failed - try again or use demo sample')
      setEngineStatus(getLocalOcrStatus().status)
    }
  }

  const snapFromCamera = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('Camera not ready yet')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Capture failed'))), 'image/jpeg', 0.9)
    })
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    setCaptureBlob(blob)
    stopCamera()
    await runOcrOnBlob(blob)
  }

  const onPickFile = async (e) => {
    const next = e.target.files?.[0]
    e.target.value = ''
    if (!next) return
    stopCamera()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setCaptureBlob(next)
    setPreviewUrl(URL.createObjectURL(next))
    setPhase('idle')
    setOcrText('')
    setMatches([])
    setError('')
    setUsedDemo(false)
    await runOcrOnBlob(next)
  }

  const runDemoSample = () => {
    stopCamera()
    setPhase('reading')
    setProgress(30)
    setProgressLabel('Demo match…')
    window.setTimeout(() => {
      applyMatches(buildDemoOcrSample(trailers), true, 12)
    }, 280)
  }

  const selectMatch = (match) => {
    setSearchQuery(match.query || match.jobNo)
    setStatusFilter('all')
    setTempFilter('all')
    onClose()
    resetCapture()
    stopCamera()
  }

  const engineLabel =
    engineStatus === 'ready'
      ? 'Engine ready (on device)'
      : engineStatus === 'warming'
        ? 'Warming OCR engine…'
        : engineStatus === 'error'
          ? 'Engine error'
          : 'Engine cold'

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center p-0 sm:p-3">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-[2px]"
        aria-label="Close sheet scan"
        onClick={() => {
          stopCamera()
          resetCapture()
          onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-scan-title"
        className="relative z-10 flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden border-0 bg-white shadow-2xl sm:h-[min(94dvh,760px)] sm:rounded-xl sm:border sm:border-grid animate-feed-in"
      >
        <header className="shrink-0 flex items-start justify-between gap-3 border-b border-grid bg-navy-900 px-4 py-3 text-white pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ScanLine className="size-5 text-ice-300 shrink-0" />
              <h2 id="sheet-scan-title" className="text-sm font-bold uppercase tracking-wide">
                Scan load sheet
              </h2>
            </div>
            <p className="mt-1 text-[11px] text-ice-300 leading-snug">
              Live camera · local OCR on this device · matches active loads (no QR)
            </p>
            <p className="mt-1 font-mono text-[10px] text-ice-300/80">{engineLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera()
              resetCapture()
              onClose()
            }}
            className="rounded p-2 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onPickFile}
          />

          {/* Live viewfinder */}
          {!previewUrl && (
            <div className="space-y-3 p-3">
              <div className="relative overflow-hidden rounded-lg border border-grid bg-navy-950 aspect-[3/4] sm:aspect-video">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-ice-300">
                    <Camera className="size-10 opacity-80" />
                    <p className="text-xs">
                      {cameraError || 'Starting camera…'}
                    </p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-6 top-[18%] bottom-[28%] rounded-md border-2 border-ice-300/70 shadow-[0_0_0_9999px_rgba(7,21,38,0.35)]" />
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-wide text-white/90">
                  Frame job no · trailer · collect / deliver
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={snapFromCamera}
                  disabled={!cameraOn || phase === 'reading'}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-50"
                >
                  <Camera className="size-5" />
                  Snap &amp; read sheet
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-grid px-3 py-2.5 text-xs font-semibold text-navy-900 hover:bg-slate-50"
                >
                  <SwitchCamera className="size-4" />
                  Flip cam
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-grid px-3 py-2.5 text-xs font-semibold text-navy-900 hover:bg-slate-50"
                >
                  Gallery / file
                </button>
              </div>

              <button
                type="button"
                onClick={runDemoSample}
                className="w-full rounded-md border border-dashed border-grid px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Try demo OCR sample (no camera)
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-3 p-3">
              <div className="overflow-hidden rounded-lg border border-grid bg-slate-100">
                <img
                  src={previewUrl}
                  alt="Captured load sheet"
                  className="max-h-52 w-full object-contain"
                />
              </div>

              {phase === 'reading' && (
                <div className="rounded-lg border border-ice-400/40 bg-navy-900 px-3 py-3 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Loader2 className="size-4 animate-spin text-ice-300" />
                    {progressLabel || 'Reading…'}
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-navy-950">
                    <div
                      className="h-full bg-ice-400 transition-all duration-300"
                      style={{ width: `${Math.max(progress, 4)}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-ice-300">{progress}%</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {phase !== 'reading' && captureBlob ? (
                  <button
                    type="button"
                    onClick={() => runOcrOnBlob(captureBlob)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-navy-900 px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    <ScanLine className="size-4" />
                    Read again
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    resetCapture()
                    startCamera(facingMode)
                  }}
                  disabled={phase === 'reading'}
                  className="rounded-md border border-grid px-3 py-2.5 text-sm font-semibold text-navy-800 disabled:opacity-60"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="mx-3 mb-3 rounded border border-hold/40 bg-hold-bg/50 px-3 py-2 text-xs text-navy-900">
              {error}
              <button
                type="button"
                onClick={runDemoSample}
                className="mt-2 block font-semibold text-navy-800 underline"
              >
                Fall back to demo sample
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-3 px-3 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {usedDemo ? 'Demo OCR' : 'On-device OCR'}
                  {elapsedMs != null ? ` · ${elapsedMs}ms` : ''} · {matches.length} match
                  {matches.length === 1 ? '' : 'es'}
                </p>
                <pre className="mt-1 max-h-24 overflow-auto rounded border border-grid bg-sheet p-2 text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {ocrText.trim() || '(no text detected)'}
                </pre>
              </div>

              {matches.length === 0 ? (
                <p className="rounded border border-dashed border-grid px-3 py-4 text-center text-xs text-slate-500">
                  No active loads matched. Retake closer on the job number or trailer ID.
                </p>
              ) : (
                <ul className="space-y-2">
                  {matches.map((m) => (
                    <li key={`${m.trailerId}-${m.jobId}`}>
                      <button
                        type="button"
                        onClick={() => selectMatch(m)}
                        className="w-full rounded-lg border border-grid bg-white px-3 py-3 text-left transition hover:border-ice-400 hover:bg-ice-300/15 active:scale-[0.99]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-navy-900 truncate">{m.customer}</p>
                            <p className="font-mono text-[11px] text-slate-500">
                              Job {m.jobNo} · {m.vehicle}/{m.trailer}
                            </p>
                          </div>
                          <span className="shrink-0 rounded bg-navy-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ice-300">
                            {m.score}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                          {m.collectFrom}
                          {m.collectTown ? ` (${m.collectTown})` : ''}
                          {' → '}
                          {m.deliverTo}
                          {m.deliverTown ? ` (${m.deliverTown})` : ''}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-grid bg-slate-50 px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] text-[10px] text-slate-500 leading-relaxed">
          OCR runs locally with Tesseract.js (cached in this PWA). First open warms the engine;
          later snaps reuse it for speed.
        </footer>
      </div>
    </div>
  )
}
