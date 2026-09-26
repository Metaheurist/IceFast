import { MessageSquarePlus, Snowflake } from 'lucide-react'
import { STATUS_META, bayDwellMinutes, doneCount, filterTrailers, isSpecialBucket } from '../data'
import { useApp } from '../AppContext'
import LoadSearchBar from './LoadSearchBar'

function StatusBadge({ status, onClick }) {
  const meta = STATUS_META[status]
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`inline-flex min-w-[4.5rem] items-center justify-center rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition active:scale-95 ${meta.className}`}
      title="Tap to cycle status"
    >
      {meta.label}
    </button>
  )
}

function PalletProgressCell({ job, onOpen }) {
  const done = doneCount(job)
  const pct = job.pallets ? Math.round((done / job.pallets) * 100) : 0
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      className="w-full min-w-[4.25rem] rounded border border-transparent px-1 py-0.5 text-center transition hover:border-ice-400 hover:bg-ice-300/20 active:scale-[0.98]"
      title="Log which pallets are done"
    >
      <div className="font-mono text-sm font-bold tabular-nums text-navy-900 leading-tight">
        {done}
        <span className="text-slate-400 font-semibold">/{job.pallets}</span>
      </div>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-sm bg-slate-200">
        <div
          className={`h-full transition-all ${
            job.status === 'hold' ? 'bg-hold' : done >= job.pallets ? 'bg-loaded' : 'bg-ice-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  )
}

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function JobRow({ trailer, job, onCycle, onNote, onOpenPallets }) {
  const meta = STATUS_META[job.status]
  const done = doneCount(job)
  return (
    <tr className={`border-b border-grid transition hover:bg-ice-300/10 ${meta.rowClass}`}>
      <td className="px-1.5 py-1.5 text-center w-16">
        <PalletProgressCell job={job} onOpen={() => onOpenPallets(trailer, job)} />
      </td>
      <td className="px-2 py-1.5 text-[11px] font-medium text-slate-700 whitespace-nowrap max-w-[7.5rem] truncate">
        {job.temp}
      </td>
      <td className="px-2 py-1.5 min-w-[8rem]">
        <div className="text-[12px] font-semibold leading-tight text-navy-900">{job.customer}</div>
        <div className="text-[10px] text-slate-500 font-mono">Job No. {job.jobNo}</div>
        {done > 0 && done < job.pallets && (
          <div className="text-[10px] font-semibold text-ice-500 mt-0.5">
            Done plt: {(job.donePallets ?? []).join(', ')}
          </div>
        )}
      </td>
      <td className="px-2 py-1.5 min-w-[9rem] hidden sm:table-cell">
        <div className="text-[11px] font-medium leading-tight">{job.collectFrom}</div>
        <div className="text-[10px] text-slate-500">({job.collectTown})</div>
      </td>
      <td className="px-2 py-1.5 min-w-[9rem]">
        <div className="text-[11px] font-medium leading-tight">{job.deliverTo}</div>
        <div className="text-[10px] text-slate-500">({job.deliverTown})</div>
        {job.deliveryWindow ? (
          <div className="mt-0.5 inline-flex rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
            {job.deliveryWindow}
          </div>
        ) : null}
      </td>
      <td className="px-2 py-1.5 text-[11px] font-mono text-slate-700 whitespace-nowrap hidden md:table-cell">
        {job.deliverDate || '-'}
      </td>
      <td className="px-2 py-1.5 text-[11px] font-mono text-slate-600 whitespace-nowrap hidden lg:table-cell max-w-[6.5rem] truncate" title={job.ref || ''}>
        {job.ref || '-'}
      </td>
      <td className="px-2 py-1.5 text-[11px] font-mono text-navy-800 whitespace-nowrap hidden lg:table-cell max-w-[7rem] truncate" title={job.orderRef}>
        {job.orderRef}
      </td>
      <td className="px-2 py-1.5 text-[11px] font-semibold text-slate-700 whitespace-nowrap hidden xl:table-cell">
        {job.inbDriver}
      </td>
      <td className="px-2 py-1.5 text-[10px] font-mono text-slate-600 whitespace-nowrap hidden xl:table-cell max-w-[8rem] truncate" title={job.inbVeh}>
        {job.inbVeh}
      </td>
      <td className="px-2 py-1.5 text-center">
        <StatusBadge status={job.status} onClick={() => onCycle(trailer.id, job.id)} />
      </td>
      <td className="px-2 py-1.5 min-w-[7rem] max-w-[10rem] hidden md:table-cell">
        <button
          type="button"
          onClick={() => onNote(trailer, job)}
          className="w-full text-left text-[11px] leading-snug text-slate-700 hover:text-navy-900"
          title={job.note || 'Add comment'}
        >
          {job.note ? (
            <span className="line-clamp-2">{job.note}</span>
          ) : (
            <span className="text-slate-400 italic">-</span>
          )}
        </button>
      </td>
      <td className="px-1.5 py-1.5 text-center w-10">
        <button
          type="button"
          onClick={() => onNote(trailer, job)}
          className={`inline-flex size-8 items-center justify-center rounded border transition ${
            job.note
              ? 'border-hold/50 bg-hold-bg text-hold'
              : 'border-grid bg-white text-slate-500 hover:border-ice-400 hover:text-navy-800'
          }`}
          title={job.note || 'Add note'}
          aria-label="Add note"
        >
          <MessageSquarePlus className="size-4" />
        </button>
      </td>
    </tr>
  )
}

function TrailerMetaBar({ trailer, onUpdate }) {
  const dwell = bayDwellMinutes(trailer)
  const isInbound = trailer.direction === 'inbound'

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-grid bg-slate-50 px-3 py-2">
      <label className="flex flex-col gap-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Bay
        <input
          value={trailer.bayNo}
          onChange={(e) => onUpdate(trailer.id, { bayNo: e.target.value })}
          className="w-14 rounded border border-grid bg-white px-1.5 py-1 font-mono text-xs text-navy-900 outline-none focus:border-ice-500"
          placeholder="-"
        />
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Time on
        <div className="flex gap-1">
          <input
            value={trailer.timeOn}
            onChange={(e) => onUpdate(trailer.id, { timeOn: e.target.value })}
            className="w-16 rounded border border-grid bg-white px-1.5 py-1 font-mono text-xs text-navy-900 outline-none focus:border-ice-500"
            placeholder="HH:MM"
          />
          <button
            type="button"
            onClick={() => onUpdate(trailer.id, { timeOn: nowHHMM() })}
            className="rounded border border-grid bg-white px-1.5 py-1 text-[10px] font-semibold text-navy-800 hover:bg-ice-300/20"
          >
            Now
          </button>
        </div>
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Time off
        <div className="flex gap-1">
          <input
            value={trailer.timeOff}
            onChange={(e) => onUpdate(trailer.id, { timeOff: e.target.value })}
            className="w-16 rounded border border-grid bg-white px-1.5 py-1 font-mono text-xs text-navy-900 outline-none focus:border-ice-500"
            placeholder="HH:MM"
          />
          <button
            type="button"
            onClick={() => onUpdate(trailer.id, { timeOff: nowHHMM() })}
            className="rounded border border-grid bg-white px-1.5 py-1 text-[10px] font-semibold text-navy-800 hover:bg-ice-300/20"
          >
            Now
          </button>
        </div>
      </label>
      {isInbound && (
        <label className="flex flex-col gap-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 min-w-[8rem]">
          Checker
          <input
            value={trailer.checker}
            onChange={(e) => onUpdate(trailer.id, { checker: e.target.value })}
            className="rounded border border-grid bg-white px-1.5 py-1 text-xs font-semibold text-navy-900 outline-none focus:border-ice-500"
            placeholder="Name"
          />
        </label>
      )}
      {dwell != null && (
        <span className="ml-auto self-center rounded bg-navy-900 px-2 py-1 font-mono text-[11px] font-semibold text-ice-300">
          Bay dwell {dwell} min
        </span>
      )}
    </div>
  )
}

function TrailerBlock({ trailer, onCycle, onNote, onOpenPallets, onUpdateMeta, highlightSearch }) {
  const special = isSpecialBucket(trailer)
  const dirLabel = special
    ? trailer.vehicle === 'COLLECTION' || trailer.trailer === 'TOCOLLECT'
      ? 'COLLECTION'
      : 'HOLD'
    : trailer.direction === 'inbound'
      ? 'INBOUND'
      : 'OUTBOUND'

  return (
    <section
      className={`mb-3 overflow-hidden rounded border bg-white shadow-sm ${
        highlightSearch ? 'border-ice-400 ring-1 ring-ice-400/40' : 'border-grid'
      }`}
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-navy-900 px-3 py-2 text-white">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ice-300">
          <Snowflake className="size-3" />
          {dirLabel}
        </span>
        <span className="font-mono text-sm font-bold tracking-wide">
          Veh: {trailer.vehicle}
        </span>
        <span className="font-mono text-sm font-bold tracking-wide">
          Trailer: {trailer.trailer}
        </span>
        <span className="text-sm font-semibold">{trailer.driver}</span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ice-300">
          {trailer.jobs.length} load{trailer.jobs.length === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-ice-300 ml-auto flex flex-wrap gap-x-3">
          {trailer.startTime && <span>Start: {trailer.startTime}</span>}
          {trailer.checker && trailer.direction === 'inbound' && (
            <span>Checker: {trailer.checker}</span>
          )}
        </span>
      </header>

      <TrailerMetaBar trailer={trailer} onUpdate={onUpdateMeta} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-600 border-b border-grid">
              <th className="px-1.5 py-1.5 text-center">Done/Set</th>
              <th className="px-2 py-1.5">Temp</th>
              <th className="px-2 py-1.5">Customer</th>
              <th className="px-2 py-1.5 hidden sm:table-cell">Collect From</th>
              <th className="px-2 py-1.5">Deliver To</th>
              <th className="px-2 py-1.5 hidden md:table-cell">Deliver Date</th>
              <th className="px-2 py-1.5 hidden lg:table-cell">Ref</th>
              <th className="px-2 py-1.5 hidden lg:table-cell">Order / Ref 2</th>
              <th className="px-2 py-1.5 hidden xl:table-cell">Inb Driver</th>
              <th className="px-2 py-1.5 hidden xl:table-cell">Inb Veh/Trl</th>
              <th className="px-2 py-1.5 text-center">Status</th>
              <th className="px-2 py-1.5 hidden md:table-cell">Comments</th>
              <th className="px-1.5 py-1.5 text-center w-10">Note</th>
            </tr>
          </thead>
          <tbody>
            {trailer.jobs.map((job) => (
              <JobRow
                key={job.id}
                trailer={trailer}
                job={job}
                onCycle={onCycle}
                onNote={onNote}
                onOpenPallets={onOpenPallets}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function FloorView({ onOpenNote, onOpenPallets }) {
  const {
    trailers,
    directionFilter,
    searchQuery,
    statusFilter,
    tempFilter,
    cycleJobStatus,
    loadDate,
    updateTrailerMeta,
  } = useApp()

  const filtered = filterTrailers(trailers, {
    query: searchQuery,
    status: statusFilter,
    temp: tempFilter,
    direction: directionFilter,
  })
  const highlightSearch =
    Boolean(searchQuery.trim()) || statusFilter !== 'all' || tempFilter !== 'all'

  const title =
    directionFilter === 'inbound'
      ? 'ICEFAST WAREHOUSE INBOUND'
      : directionFilter === 'outbound'
        ? 'ICEFAST WAREHOUSE OUTBOUND'
        : directionFilter === 'special'
          ? 'ICEFAST HOLD / COLLECTION'
          : 'ICEFAST WAREHOUSE FLOOR'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-navy-900 pb-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-navy-900 uppercase">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search by job / customer / trailer / order ref · Tap Done/Set for partial pallets
          </p>
        </div>
        <div className="text-right text-xs font-medium text-slate-600">
          <div>Load date: {loadDate}</div>
          <div className="text-slate-400">Floor tablet view</div>
        </div>
      </div>

      <LoadSearchBar />

      {filtered.map((trailer) => (
        <TrailerBlock
          key={trailer.id}
          trailer={trailer}
          onCycle={cycleJobStatus}
          onNote={onOpenNote}
          onOpenPallets={onOpenPallets}
          onUpdateMeta={updateTrailerMeta}
          highlightSearch={highlightSearch}
        />
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-12">
          No loads match that search. Try job no, trailer (e.g. IF200), or customer.
        </p>
      )}
    </div>
  )
}
