import {
  LayoutDashboard,
  RefreshCw,
  Snowflake,
  Thermometer,
  Warehouse,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from './AppContext'
import DashboardView from './components/DashboardView'
import FloorView from './components/FloorView'
import TempsView from './components/TempsView'
import NoteModal from './components/NoteModal'
import PalletLogModal from './components/PalletLogModal'

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded border border-ice-300/70 bg-navy-900">
        <Snowflake className="size-5 text-ice-300" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-sm font-bold tracking-[0.14em] text-white uppercase truncate">
          IceFast
        </div>
        <div className="text-[9px] font-semibold tracking-[0.12em] text-ice-300 uppercase truncate">
          Warehouse
        </div>
      </div>
    </div>
  )
}

function formatSynced(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '-'
  }
}

export default function App() {
  const {
    view,
    setView,
    directionFilter,
    setDirectionFilter,
    trailers,
    dataStatus,
    dataError,
    saveJobNote,
    toggleJobPallet,
    setJobDoneCount,
    markJobHold,
    refreshData,
    isRefreshing,
    lastSyncedAt,
  } = useApp()

  const [noteTarget, setNoteTarget] = useState(null)
  const [palletTarget, setPalletTarget] = useState(null)

  const livePalletJob = useMemo(() => {
    if (!palletTarget) return null
    const trailer = trailers.find((t) => t.id === palletTarget.trailerId)
    const job = trailer?.jobs.find((j) => j.id === palletTarget.jobId)
    if (!trailer || !job) return null
    return { trailer, job }
  }, [palletTarget, trailers])

  const liveNoteJob = useMemo(() => {
    if (!noteTarget) return null
    const trailer = trailers.find((t) => t.id === noteTarget.trailerId)
    const job = trailer?.jobs.find((j) => j.id === noteTarget.jobId)
    if (!trailer || !job) return null
    return { trailer, job }
  }, [noteTarget, trailers])

  return (
    <div className="min-h-screen flex flex-col bg-sheet">
      <header className="sticky top-0 z-40 border-b border-ice-400/30 bg-navy-900 text-white shadow-md">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            <BrandMark />

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end leading-tight mr-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-ice-300">
                  Last sync
                </span>
                <span className="font-mono text-[10px] text-white/80">
                  {dataStatus === 'ready' ? formatSynced(lastSyncedAt) : '-'}
                </span>
              </div>

              <button
                type="button"
                onClick={refreshData}
                disabled={isRefreshing || dataStatus === 'loading'}
                title="Reload sheets from local SQLite demo.db"
                aria-label="Refresh data"
                className="inline-flex items-center gap-1.5 rounded-md border border-ice-400/30 bg-navy-950/50 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-ice-300 transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-3.5 sm:size-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Syncing…' : 'Refresh'}
                </span>
              </button>

              <nav className="flex items-center gap-1 rounded-md bg-navy-950/50 p-1">
                <button
                  type="button"
                  onClick={() => setView('floor')}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    view === 'floor'
                      ? 'bg-ice-400 text-navy-950'
                      : 'text-ice-300 hover:bg-white/10'
                  }`}
                >
                  <Warehouse className="size-3.5 sm:size-4" />
                  <span className="hidden xs:inline sm:inline">Floor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('dashboard')}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    view === 'dashboard'
                      ? 'bg-ice-400 text-navy-950'
                      : 'text-ice-300 hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('temps')}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    view === 'temps'
                      ? 'bg-ice-400 text-navy-950'
                      : 'text-ice-300 hover:bg-white/10'
                  }`}
                >
                  <Thermometer className="size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">Temps</span>
                </button>
              </nav>
            </div>
          </div>

          {view === 'floor' && dataStatus === 'ready' && (
            <div className="flex gap-1 pb-2.5 -mt-0.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All sheets' },
                { id: 'outbound', label: 'Outbound' },
                { id: 'inbound', label: 'Inbound' },
                { id: 'special', label: 'Hold / Collect' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDirectionFilter(opt.id)}
                  className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                    directionFilter === opt.id
                      ? 'bg-white text-navy-900'
                      : 'bg-navy-800 text-ice-300 hover:bg-navy-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1600px] px-3 sm:px-4 py-3 sm:py-4">
        {dataStatus === 'loading' && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
            <RefreshCw className="size-6 animate-spin text-navy-800" />
            <p className="text-sm font-semibold text-navy-900">Loading warehouse sheets…</p>
            <p className="text-xs text-slate-500">
              Generating a fictional inbound/outbound day · public/demo.db
            </p>
          </div>
        )}

        {dataStatus === 'error' && (
          <div className="mx-auto max-w-lg rounded border border-hold/40 bg-hold-bg/40 p-4 text-center">
            <p className="text-sm font-bold text-navy-900">Could not load demo database</p>
            <p className="mt-1 text-xs text-slate-600">{dataError}</p>
            <button
              type="button"
              onClick={refreshData}
              className="mt-3 rounded bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {dataStatus === 'ready' &&
          (view === 'floor' ? (
            <FloorView
              onOpenNote={(trailer, job) =>
                setNoteTarget({ trailerId: trailer.id, jobId: job.id })
              }
              onOpenPallets={(trailer, job) =>
                setPalletTarget({ trailerId: trailer.id, jobId: job.id })
              }
            />
          ) : view === 'temps' ? (
            <TempsView />
          ) : (
            <DashboardView />
          ))}
      </main>

      <footer className="border-t border-grid bg-white/80 px-3 py-2 text-center text-[10px] text-slate-500">
        IceFast · Warehouse Companion Prototype · Synthetic demo day in
        local SQLite demo.db
      </footer>

      <NoteModal
        open={Boolean(liveNoteJob)}
        trailer={liveNoteJob?.trailer}
        job={liveNoteJob?.job}
        onClose={() => setNoteTarget(null)}
        onSave={(note) => {
          if (noteTarget) {
            saveJobNote(noteTarget.trailerId, noteTarget.jobId, note)
          }
        }}
      />

      <PalletLogModal
        open={Boolean(livePalletJob)}
        trailer={livePalletJob?.trailer}
        job={livePalletJob?.job}
        onClose={() => setPalletTarget(null)}
        onTogglePallet={(palletNo) => {
          if (palletTarget) {
            toggleJobPallet(palletTarget.trailerId, palletTarget.jobId, palletNo)
          }
        }}
        onSetDoneCount={(count) => {
          if (palletTarget) {
            setJobDoneCount(palletTarget.trailerId, palletTarget.jobId, count)
          }
        }}
        onMarkHold={() => {
          if (palletTarget) {
            markJobHold(palletTarget.trailerId, palletTarget.jobId)
          }
        }}
      />
    </div>
  )
}
