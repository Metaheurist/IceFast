import { Check, Minus, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { doneCount, remainingPallets } from '../data'

export default function PalletLogModal({
  open,
  job,
  trailer,
  onClose,
  onTogglePallet,
  onSetDoneCount,
  onMarkHold,
}) {
  const [draftCount, setDraftCount] = useState(0)

  useEffect(() => {
    if (open && job) setDraftCount(doneCount(job))
  }, [open, job])

  if (!open || !job || !trailer) return null

  const done = doneCount(job)
  const remaining = remainingPallets(job)
  const doneSet = new Set(job.donePallets ?? [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white shadow-2xl border border-grid sm:rounded-lg animate-feed-in max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 bg-navy-900 text-white px-4 py-3 sm:rounded-t-lg shrink-0">
          <div className="min-w-0">
            <div className="text-ice-300 text-xs font-semibold uppercase tracking-wide">
              Pallet set progress
            </div>
            <p className="mt-1 font-semibold truncate">
              {job.customer} · Job {job.jobNo}
            </p>
            <p className="text-ice-300 text-xs mt-0.5 truncate">
              {trailer.vehicle} / {trailer.trailer} · {job.temp}
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

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="rounded border border-grid bg-sheet px-3 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Done out of set
            </p>
            <p className="font-mono text-3xl font-bold text-navy-900 tabular-nums mt-1">
              {done}
              <span className="text-slate-400 text-xl">/{job.pallets}</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-slate-200">
              <div
                className="h-full bg-loaded transition-all duration-300"
                style={{
                  width: `${job.pallets ? Math.round((done / job.pallets) * 100) : 0}%`,
                }}
              />
            </div>
            {job.status === 'hold' && (
              <p className="mt-2 text-xs font-semibold text-hold">
                On hold - {done}/{job.pallets} loaded, {remaining.length} remaining
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Quick count (+ / -)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetDoneCount(Math.max(0, done - 1))}
                className="inline-flex size-11 items-center justify-center rounded border border-grid bg-white text-navy-900 active:bg-slate-100"
                aria-label="Minus one pallet"
              >
                <Minus className="size-5" />
              </button>
              <div className="flex-1 text-center font-mono text-lg font-bold tabular-nums">
                {done} / {job.pallets}
              </div>
              <button
                type="button"
                onClick={() => onSetDoneCount(Math.min(job.pallets, done + 1))}
                className="inline-flex size-11 items-center justify-center rounded border border-grid bg-white text-navy-900 active:bg-slate-100"
                aria-label="Plus one pallet"
              >
                <Plus className="size-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={job.pallets}
                value={draftCount}
                onChange={(e) => setDraftCount(Number(e.target.value))}
                onMouseUp={() => onSetDoneCount(draftCount)}
                onTouchEnd={() => onSetDoneCount(draftCount)}
                className="flex-1 accent-navy-800"
              />
              <button
                type="button"
                onClick={() => onSetDoneCount(draftCount)}
                className="rounded bg-navy-900 px-2.5 py-1.5 text-xs font-semibold text-white"
              >
                Set {draftCount}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Which pallets are done (tap to toggle)
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {Array.from({ length: job.pallets }, (_, i) => i + 1).map((n) => {
                const isDone = doneSet.has(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onTogglePallet(n)}
                    className={`relative flex h-11 items-center justify-center rounded border font-mono text-sm font-bold tabular-nums transition active:scale-95 ${
                      isDone
                        ? 'border-loaded/40 bg-loaded-bg text-loaded'
                        : 'border-grid bg-white text-slate-600 hover:border-ice-400'
                    }`}
                    title={isDone ? `Pallet ${n} done - tap to undo` : `Mark pallet ${n} done`}
                  >
                    {isDone && <Check className="absolute top-0.5 right-0.5 size-3 opacity-70" />}
                    {n}
                  </button>
                )
              })}
            </div>
            {done > 0 && (
              <p className="mt-2 text-[11px] text-slate-500">
                Done: {(job.donePallets ?? []).join(', ') || '-'}
                {remaining.length > 0 && (
                  <> · Remaining: {remaining.join(', ')}</>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-grid px-4 py-3 bg-slate-50 sm:rounded-b-lg shrink-0">
          <button
            type="button"
            onClick={() => {
              onMarkHold()
              onClose()
            }}
            className="rounded border border-hold/40 bg-hold-bg px-3 py-2 text-sm font-semibold text-hold"
          >
            Keep {done}/{job.pallets} · Mark Hold
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
