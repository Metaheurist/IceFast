import { MessageSquareWarning, Mic, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function NoteModal({ open, job, trailer, onClose, onSave }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (open && job) {
      setText(job.note || '')
      setTimeout(() => textareaRef.current?.focus(), 50)
    } else {
      setListening(false)
      recognitionRef.current?.stop?.()
    }
  }, [open, job])

  useEffect(() => {
    return () => recognitionRef.current?.stop?.()
  }, [])

  if (!open || !job || !trailer) return null

  const speechSupported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  function toggleDictate() {
    if (!speechSupported) {
      setText((t) => (t ? `${t} ` : '') + '[Dictation not supported in this browser - type instead]')
      return
    }

    if (listening) {
      recognitionRef.current?.stop?.()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-GB'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setText((prev) => {
        const base = prev.replace(/\s*\[listening…\]$/, '').trimEnd()
        const final = event.results[event.results.length - 1].isFinal
        return final
          ? `${base}${base ? ' ' : ''}${transcript}`.trim()
          : `${base}${base ? ' ' : ''}${transcript} [listening…]`
      })
    }
    recognition.onend = () => {
      setListening(false)
      setText((t) => t.replace(/\s*\[listening…\]$/, ''))
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
    setListening(true)
  }

  function handleSave() {
    onSave(text)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white shadow-2xl border border-grid sm:rounded-lg animate-feed-in">
        <div className="flex items-start justify-between gap-3 bg-navy-900 text-white px-4 py-3 sm:rounded-t-lg">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-ice-300 text-xs font-semibold uppercase tracking-wide">
              <MessageSquareWarning className="size-3.5 shrink-0" />
              Flag / Note
            </div>
            <p className="mt-1 font-semibold truncate">
              {job.customer} · Job {job.jobNo}
            </p>
            <p className="text-ice-300 text-xs mt-0.5 truncate">
              {trailer.vehicle} / {trailer.trailer} · {job.pallets} plt · {job.deliverTo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1.5 hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Note for dispatch
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. Damaged wrap on top pallet - photo taken. Or dictate..."
            className="w-full resize-y rounded border border-grid bg-sheet px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-ice-500 focus:ring-2 focus:ring-ice-400/30"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleDictate}
              className={`inline-flex items-center gap-1.5 rounded border px-3 py-2 text-sm font-medium transition ${
                listening
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-grid bg-white text-navy-800 hover:bg-slate-50'
              }`}
            >
              <Mic className={`size-4 ${listening ? 'animate-pulse' : ''}`} />
              {listening ? 'Stop' : 'Dictate'}
            </button>
            <span className="text-xs text-slate-500">
              Syncs instantly to the dispatch exception feed
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-grid px-4 py-3 bg-slate-50 sm:rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-grid bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Save & Sync
          </button>
        </div>
      </div>
    </div>
  )
}
