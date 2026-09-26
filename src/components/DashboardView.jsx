import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Package,
  Radio,
  Truck,
  UserCheck,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  STATUS,
  STATUS_META,
  bayDwellMinutes,
  doneCount,
  filterTrailers,
  isSpecialBucket,
  jobMatchesFilters,
  trailerPartialJobs,
  trailerTempMix,
  trailerTotals,
} from '../data'
import { useApp } from '../AppContext'
import LoadSearchBar from './LoadSearchBar'

function formatTime(iso) {
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

function ProgressBar({ loaded, total, hold }) {
  const pct = total === 0 ? 0 : Math.round((loaded / total) * 100)
  const holdPct = total === 0 ? 0 : Math.round((hold / total) * 100)
  return (
    <div className="space-y-1">
      <div className="h-2.5 w-full overflow-hidden rounded-sm bg-slate-200">
        <div className="flex h-full progress-live">
          <div
            className="h-full bg-loaded transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
          <div
            className="h-full bg-hold transition-all duration-500"
            style={{ width: `${holdPct}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[11px] font-medium text-slate-600">
        <span>
          {loaded}/{total} Pallets Loaded
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}

function directionBadge(trailer) {
  if (trailer.vehicle === 'COLLECTION' || trailer.trailer === 'TOCOLLECT') {
    return { label: 'collection', className: 'bg-emerald-100 text-emerald-800' }
  }
  if (trailer.vehicle === 'HOLD' || trailer.trailer === 'PALLETSHOLD') {
    return { label: 'hold', className: 'bg-hold-bg text-hold' }
  }
  if (trailer.direction === 'inbound') {
    return { label: 'inbound', className: 'bg-sky-100 text-sky-800' }
  }
  return { label: 'outbound', className: 'bg-indigo-100 text-indigo-800' }
}

function TrailerCard({ trailer, onOpen }) {
  const totals = trailerTotals(trailer)
  const mix = trailerTempMix(trailer)
  const partials = trailerPartialJobs(trailer)
  const complete = totals.loaded === totals.total && totals.hold === 0
  const badge = directionBadge(trailer)
  const dwell = bayDwellMinutes(trailer)
  const mixParts = [
    mix.frozen ? `Frz ${mix.frozen}` : null,
    mix.chilled ? `Chl ${mix.chilled}` : null,
    mix.veg ? `Veg ${mix.veg}` : null,
    mix.ambient ? `Amb ${mix.ambient}` : null,
  ].filter(Boolean)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(trailer.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(trailer.id)
        }
      }}
      className="rounded border border-grid bg-white p-3 shadow-sm text-left cursor-pointer transition hover:border-ice-400/70 hover:bg-ice-300/10 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-ice-500 shrink-0" />
            <h3 className="font-mono text-sm font-bold text-navy-900 truncate">
              {trailer.trailer}
            </h3>
            <span
              className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {trailer.vehicle} · {trailer.driver}
            {trailer.bayNo ? ` · Bay ${trailer.bayNo}` : ''}
            {trailer.startTime ? ` · Start ${trailer.startTime}` : ''}
          </p>
          {(trailer.timeOn || trailer.timeOff || trailer.checker) && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">
              {trailer.timeOn ? `On ${trailer.timeOn}` : 'On -'}
              {' · '}
              {trailer.timeOff ? `Off ${trailer.timeOff}` : 'Off -'}
              {dwell != null ? ` · ${dwell}m` : ''}
              {trailer.checker ? ` · ${trailer.checker}` : ''}
            </p>
          )}
        </div>
        {complete ? (
          <CheckCircle2 className="size-5 text-loaded shrink-0" />
        ) : totals.hold > 0 ? (
          <AlertTriangle className="size-5 text-hold shrink-0" />
        ) : (
          <Clock3 className="size-5 text-slate-400 shrink-0" />
        )}
      </div>
      <ProgressBar loaded={totals.loaded} total={totals.total} hold={totals.hold} />
      {mixParts.length > 0 && (
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 truncate">
          Temp mix · {mixParts.join(' · ')}
        </p>
      )}
      {partials.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {partials.slice(0, 3).map((p) => (
            <li key={p.jobNo} className="text-[10px] text-sky-800 truncate">
              <span className="font-bold tabular-nums">
                {p.done}/{p.total}
              </span>{' '}
              {p.customer}
              {p.donePallets.length > 0 ? (
                <span className="font-mono text-slate-500"> · plt {p.donePallets.join(',')}</span>
              ) : null}
              {p.status === 'hold' ? <span className="text-hold font-semibold"> · hold</span> : null}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide">
        <span className="rounded bg-loaded-bg text-loaded px-1.5 py-0.5">
          {totals.jobLoaded}/{totals.jobCount} jobs
        </span>
        {totals.hold > 0 && (
          <span className="rounded bg-hold-bg text-hold px-1.5 py-0.5">
            {totals.hold} plt hold
          </span>
        )}
        {totals.jobPartial > 0 && (
          <span className="rounded bg-sky-100 text-sky-800 px-1.5 py-0.5">
            {totals.jobPartial} partial sets
          </span>
        )}
        {totals.pending > 0 && (
          <span className="rounded bg-pending-bg text-pending px-1.5 py-0.5">
            {totals.pending} plt pending
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-ice-500">
        Open full detail →
      </p>
    </article>
  )
}

function JobDetailCard({ job }) {
  const done = doneCount(job)
  const meta = STATUS_META[job.status] ?? STATUS_META[STATUS.PENDING]
  const partial = done > 0 && done < job.pallets

  return (
    <article className="rounded-lg border border-grid bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-navy-900 leading-snug">{job.customer}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">Job {job.jobNo}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}
          >
            {meta.label}
          </span>
          <span className="font-mono text-sm font-bold tabular-nums text-navy-900">
            {done}/{job.pallets}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {job.temp || '-'}
      </p>

      <dl className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Collect</dt>
          <dd className="mt-0.5 text-xs text-navy-900 leading-snug">
            {job.collectFrom || '-'}
            {job.collectTown ? (
              <span className="block text-[11px] text-slate-500">({job.collectTown})</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Deliver</dt>
          <dd className="mt-0.5 text-xs text-navy-900 leading-snug">
            {job.deliverTo || '-'}
            {job.deliverTown ? (
              <span className="block text-[11px] text-slate-500">({job.deliverTown})</span>
            ) : null}
            {job.deliveryWindow ? (
              <span className="mt-1 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                {job.deliveryWindow}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-grid pt-2.5 text-[11px]">
        <span>
          <span className="font-bold uppercase tracking-wide text-slate-400">Date </span>
          <span className="font-mono text-navy-900">{job.deliverDate || '-'}</span>
        </span>
        {job.ref ? (
          <span>
            <span className="font-bold uppercase tracking-wide text-slate-400">Ref </span>
            <span className="font-mono text-navy-900">{job.ref}</span>
          </span>
        ) : null}
        <span>
          <span className="font-bold uppercase tracking-wide text-slate-400">Order </span>
          <span className="font-mono font-semibold text-navy-800">{job.orderRef || '-'}</span>
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        <span>
          <span className="font-bold uppercase tracking-wide text-slate-400">Inb </span>
          <span className="font-semibold text-navy-900">{job.inbDriver || '-'}</span>
        </span>
        <span className="min-w-0 break-all font-mono text-[10px] text-slate-600">
          {job.inbVeh || '-'}
        </span>
      </div>

      {partial ? (
        <p className="mt-2 text-[11px] font-semibold text-sky-800">
          Partial · plt {(job.donePallets ?? []).join(', ')}
        </p>
      ) : null}

      {job.note ? (
        <p className="mt-2 rounded bg-hold-bg/60 px-2 py-1.5 text-[11px] leading-snug text-slate-800">
          {job.note}
        </p>
      ) : null}
    </article>
  )
}

function TrailerDetailModal({ trailer, onClose }) {
  const totals = useMemo(() => (trailer ? trailerTotals(trailer) : null), [trailer])
  const mix = useMemo(() => (trailer ? trailerTempMix(trailer) : null), [trailer])
  const dwell = trailer ? bayDwellMinutes(trailer) : null
  const badge = trailer ? directionBadge(trailer) : null

  useEffect(() => {
    if (!trailer) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [trailer, onClose])

  if (!trailer || !totals || !mix || !badge) return null

  const mixParts = [
    mix.frozen ? `Frozen ${mix.frozen}` : null,
    mix.chilled ? `Chilled ${mix.chilled}` : null,
    mix.veg ? `Veg ${mix.veg}` : null,
    mix.ambient ? `Ambient ${mix.ambient}` : null,
  ].filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-3 md:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px]"
        aria-label="Close trailer detail"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trailer-detail-title"
        className="relative z-10 flex h-[100dvh] w-full max-w-[1400px] flex-col overflow-hidden border-0 bg-white shadow-2xl sm:h-[min(94dvh,920px)] sm:rounded-lg sm:border sm:border-grid animate-feed-in"
      >
        <header className="shrink-0 bg-navy-900 px-3 py-3 text-white sm:rounded-t-lg sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Truck className="size-5 text-ice-300 shrink-0" />
                <h2
                  id="trailer-detail-title"
                  className="font-mono text-base sm:text-xl font-bold tracking-wide break-all"
                >
                  {trailer.vehicle} / {trailer.trailer}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-ice-300">
                {trailer.driver}
                {trailer.startTime ? ` · Start ${trailer.startTime}` : ''}
              </p>
              <p className="mt-0.5 text-[11px] font-mono text-ice-300/90 leading-relaxed">
                Bay {trailer.bayNo || '-'} · On {trailer.timeOn || '-'} · Off{' '}
                {trailer.timeOff || '-'}
                {dwell != null ? ` · ${dwell}m dwell` : ''}
                {trailer.checker ? (
                  <span className="inline-flex items-center gap-1 ml-1 sm:ml-2">
                    <UserCheck className="size-3.5 shrink-0" />
                    {trailer.checker}
                  </span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-2.5 hover:bg-white/10 -mr-1"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded bg-navy-950/40 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-ice-300">Loaded</p>
              <p className="font-mono text-lg font-bold tabular-nums">
                {totals.loaded}/{totals.total}
              </p>
            </div>
            <div className="rounded bg-navy-950/40 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-ice-300">Jobs</p>
              <p className="font-mono text-lg font-bold tabular-nums">
                {totals.jobLoaded}/{totals.jobCount}
              </p>
            </div>
            <div className="rounded bg-navy-950/40 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-ice-300">On hold</p>
              <p className="font-mono text-lg font-bold tabular-nums text-hold-bg">
                {totals.hold}
              </p>
            </div>
            <div className="rounded bg-navy-950/40 px-2.5 py-2 col-span-2 sm:col-span-1">
              <p className="text-[9px] font-bold uppercase tracking-wide text-ice-300">Temp mix</p>
              <p className="text-xs font-semibold leading-snug mt-0.5">
                {mixParts.length ? mixParts.join(' · ') : '-'}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-sheet">
          <div className="sticky top-0 z-[1] border-b border-grid bg-white/95 px-3 py-2 backdrop-blur-sm">
            <p className="text-[11px] text-slate-500">
              {trailer.jobs.length} job{trailer.jobs.length === 1 ? '' : 's'} · lineage via Order Ref /
              Inb Driver / Inb Veh
            </p>
          </div>

          {/* Mobile + tablet: stacked job cards */}
          <div className="space-y-3 p-3 xl:hidden">
            {trailer.jobs.map((job) => (
              <JobDetailCard key={job.id} job={job} />
            ))}
          </div>

          {/* Desktop wide: sheet table */}
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-xs bg-white">
                <thead className="sticky top-8 z-10">
                  <tr className="bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-600 border-b border-grid">
                    <th className="px-3 py-2 whitespace-nowrap">Done/Set</th>
                    <th className="px-3 py-2 whitespace-nowrap">Temp</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Collect From</th>
                    <th className="px-3 py-2">Deliver To</th>
                    <th className="px-3 py-2 whitespace-nowrap">Deliver Date</th>
                    <th className="px-3 py-2">Ref</th>
                    <th className="px-3 py-2 whitespace-nowrap">Order / Ref 2</th>
                    <th className="px-3 py-2 whitespace-nowrap">Inb Driver</th>
                    <th className="px-3 py-2 whitespace-nowrap">Inb Veh/Trl</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 min-w-[8rem]">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {trailer.jobs.map((job) => {
                    const meta = STATUS_META[job.status] ?? STATUS_META[STATUS.PENDING]
                    return (
                      <tr key={job.id} className="border-b border-grid hover:bg-ice-300/10 align-top">
                        <td className="px-3 py-2.5 font-mono font-semibold tabular-nums whitespace-nowrap">
                          {doneCount(job)}/{job.pallets}
                          {doneCount(job) > 0 && doneCount(job) < job.pallets ? (
                            <div className="text-[9px] font-normal text-sky-700">
                              plt {(job.donePallets ?? []).join(',')}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 max-w-[8rem]">
                          <span className="line-clamp-2">{job.temp}</span>
                        </td>
                        <td className="px-3 py-2.5 min-w-[9rem]">
                          <div className="font-semibold text-navy-900 leading-snug">{job.customer}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            Job No. {job.jobNo}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 min-w-[8rem]">
                          <div className="leading-snug">{job.collectFrom}</div>
                          <div className="text-[10px] text-slate-500">({job.collectTown})</div>
                        </td>
                        <td className="px-3 py-2.5 min-w-[8rem]">
                          <div className="leading-snug">{job.deliverTo}</div>
                          <div className="text-[10px] text-slate-500">({job.deliverTown})</div>
                          {job.deliveryWindow ? (
                            <div className="mt-0.5 inline-flex rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                              {job.deliveryWindow}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                          {job.deliverDate || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-mono">{job.ref || '-'}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-navy-800">
                          {job.orderRef || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-semibold">{job.inbDriver || '-'}</td>
                        <td className="px-3 py-2.5 font-mono text-[10px] whitespace-nowrap">
                          {job.inbVeh || '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-slate-700 max-w-[14rem]">
                          <span className="line-clamp-3">{job.note || '-'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer className="shrink-0 flex items-center justify-between gap-3 border-t border-grid bg-slate-50 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-lg sm:px-4">
          <p className="hidden text-[11px] text-slate-500 sm:block">
            Esc or backdrop to close · Synced with warehouse floor
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 sm:ml-auto sm:w-auto"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

function FeedItem({ item }) {
  const isNote = item.type === 'note'
  const isProgress = item.type === 'progress'
  const isBay = item.type === 'bay'
  const isHold = item.status === STATUS.HOLD
  return (
    <li className="animate-feed-in border-b border-grid last:border-0 px-3 py-2.5 hover:bg-slate-50">
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded ${
            isNote
              ? 'bg-hold-bg text-hold'
              : isBay
                ? 'bg-slate-200 text-navy-800'
                : isProgress
                  ? 'bg-sky-100 text-sky-700'
                  : isHold
                    ? 'bg-amber-100 text-amber-700'
                    : item.status === STATUS.LOADED
                      ? 'bg-loaded-bg text-loaded'
                      : 'bg-pending-bg text-pending'
          }`}
        >
          {isNote ? (
            <MessageSquareText className="size-3.5" />
          ) : isBay ? (
            <Clock3 className="size-3.5" />
          ) : isProgress ? (
            <Package className="size-3.5" />
          ) : isHold ? (
            <AlertTriangle className="size-3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <p className="text-xs font-semibold text-navy-900 truncate">
              {item.customer}
              <span className="font-mono font-medium text-slate-500"> · {item.jobNo}</span>
            </p>
            <time className="text-[10px] font-mono text-slate-400 shrink-0">
              {formatTime(item.at)}
            </time>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {item.trailerLabel} · {item.done ?? 0}/{item.pallets} plt
          </p>
          {(item.orderRef || item.inbDriver || item.inbVeh) && (
            <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
              {item.orderRef ? `Ord ${item.orderRef}` : null}
              {item.inbDriver ? ` · Inb ${item.inbDriver}` : null}
              {item.inbVeh ? ` · ${item.inbVeh}` : null}
            </p>
          )}
          <p className={`text-sm mt-1 leading-snug ${isNote ? 'text-slate-800' : 'text-slate-600'}`}>
            {item.message}
          </p>
        </div>
      </div>
    </li>
  )
}

export default function DashboardView() {
  const {
    trailers,
    feed,
    loadDate,
    searchQuery,
    statusFilter,
    tempFilter,
  } = useApp()
  const [selectedId, setSelectedId] = useState(null)

  const searchFilters = {
    query: searchQuery,
    status: statusFilter,
    temp: tempFilter,
    direction: 'all',
  }
  const searched = filterTrailers(trailers, searchFilters)
  const searchedIds = new Set(searched.map((t) => t.id))

  const active = trailers.filter(
    (t) =>
      searchedIds.has(t.id) &&
      (!isSpecialBucket(t) || t.jobs.some((j) => j.status !== STATUS.LOADED)),
  )
  const selected = trailers.find((t) => t.id === selectedId) || null

  const fleetTotals = trailers.reduce(
    (acc, t) => {
      const tot = trailerTotals(t)
      acc.total += tot.total
      acc.loaded += tot.loaded
      acc.hold += tot.hold
      return acc
    },
    { total: 0, loaded: 0, hold: 0 },
  )

  const filteredFeed = feed.filter((item) => {
    if (!searchQuery.trim() && statusFilter === 'all' && tempFilter === 'all') return true
    const trailer = trailers.find((t) => t.id === item.trailerId)
    const job = trailer?.jobs.find((j) => j.id === item.jobId)
    if (!trailer || !job) {
      return searchedIds.has(item.trailerId)
    }
    return jobMatchesFilters(trailer, job, searchFilters)
  })

  const exceptionCount = filteredFeed.filter(
    (f) => f.type === 'note' || f.status === STATUS.HOLD,
  ).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-navy-900 pb-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-navy-900 uppercase">
            Dispatch Live Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search loads · Tap a lorry for full-screen sheet detail
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5 text-loaded">
            <Radio className="size-3.5 animate-pulse" />
            Live
          </span>
          <span>Load date: {loadDate}</span>
        </div>
      </div>

      <LoadSearchBar includeDirection />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="rounded border border-grid bg-white px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fleet pallets</p>
          <p className="font-mono text-2xl font-bold text-navy-900 tabular-nums">
            {fleetTotals.loaded}
            <span className="text-base text-slate-400">/{fleetTotals.total}</span>
          </p>
        </div>
        <div className="rounded border border-grid bg-white px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Loaded %</p>
          <p className="font-mono text-2xl font-bold text-loaded tabular-nums">
            {fleetTotals.total
              ? Math.round((fleetTotals.loaded / fleetTotals.total) * 100)
              : 0}
            %
          </p>
        </div>
        <div className="rounded border border-grid bg-white px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">On hold</p>
          <p className="font-mono text-2xl font-bold text-hold tabular-nums">{fleetTotals.hold}</p>
        </div>
        <div className="rounded border border-grid bg-white px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Exceptions / notes</p>
          <p className="font-mono text-2xl font-bold text-navy-800 tabular-nums">{exceptionCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Active trailers
            {active.length !== trailers.length ? (
              <span className="ml-2 font-mono text-ice-500">· {active.length} shown</span>
            ) : null}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-2">
            {active.map((trailer) => (
              <TrailerCard
                key={trailer.id}
                trailer={trailer}
                onOpen={setSelectedId}
              />
            ))}
          </div>
          {active.length === 0 && (
            <p className="rounded border border-dashed border-grid bg-white px-3 py-8 text-center text-sm text-slate-500">
              No trailers match that search. Try a job no, customer, or trailer ID.
            </p>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded border border-grid bg-white shadow-sm overflow-hidden flex flex-col max-h-[min(55vh,520px)] lg:max-h-[min(70vh,640px)]">
            <div className="flex items-center justify-between gap-2 bg-navy-900 px-3 py-2.5 text-white shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-ice-300" />
                <h2 className="text-sm font-semibold">Exception & Notes Feed</h2>
              </div>
              <span className="text-[10px] font-mono text-ice-300">
                {filteredFeed.length} events
              </span>
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-grid">
              {filteredFeed.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-slate-400">
                  No flags match the current search.
                </li>
              ) : (
                filteredFeed.map((item) => <FeedItem key={item.id} item={item} />)
              )}
            </ul>
          </div>
        </aside>
      </div>

      <TrailerDetailModal trailer={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
