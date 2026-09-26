import { Camera, Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { countMatchingJobs, filterTrailers } from '../data'
import { useApp } from '../AppContext'
import { DEMO_JOB_ID, findDemoJob } from '../seed/generateDemoDay'
import SheetScanModal from './SheetScanModal'

const STATUS_OPTIONS = [
  { id: 'all', label: 'Any status' },
  { id: 'pending', label: 'Pending' },
  { id: 'loaded', label: 'Loaded' },
  { id: 'hold', label: 'Hold' },
]

const TEMP_OPTIONS = [
  { id: 'all', label: 'Any temp' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'chilled', label: 'Chilled' },
  { id: 'veg', label: 'Veg' },
  { id: 'ambient', label: 'Ambient' },
]

const BASE_CHIPS = [
  { label: 'IF200', query: 'IF200' },
  { label: 'Northbridge', query: 'northbridge' },
  { label: 'Hold', query: '', status: 'hold' },
  { label: 'Frozen', query: '', temp: 'frozen' },
  { label: 'Collection', query: 'TOCOLLECT' },
]

export default function LoadSearchBar({ includeDirection = false }) {
  const {
    trailers,
    directionFilter,
    setDirectionFilter,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    tempFilter,
    setTempFilter,
    clearSearchFilters,
  } = useApp()
  const [scanOpen, setScanOpen] = useState(false)

  const filters = {
    query: searchQuery,
    status: statusFilter,
    temp: tempFilter,
    direction: includeDirection ? directionFilter : 'all',
  }
  const matchCount = countMatchingJobs(trailers, filters)
  const trailerCount = filterTrailers(trailers, filters).length
  const quickChips = useMemo(() => {
    const hold = findDemoJob(trailers, DEMO_JOB_ID.PARTIAL_HOLD)
    const jobChip = hold
      ? [{ label: `Job ${hold.job.jobNo}`, query: hold.job.jobNo }]
      : []
    return [BASE_CHIPS[0], ...jobChip, ...BASE_CHIPS.slice(1)]
  }, [trailers])
  const active =
    Boolean(searchQuery.trim()) || statusFilter !== 'all' || tempFilter !== 'all'

  return (
    <div className="rounded border border-grid bg-white shadow-sm">
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 min-w-0 items-stretch gap-2">
          <label className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find load: job no, customer, trailer, order ref, inb veh, deliver to…"
              className="w-full rounded border border-grid bg-sheet py-2 pl-9 pr-9 text-sm outline-none focus:border-ice-500 focus:ring-2 focus:ring-ice-400/30"
              aria-label="Search loads"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-navy-800"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          <button
            type="button"
            onClick={() => setScanOpen(true)}
            title="Scan load sheet photo"
            aria-label="Scan load sheet photo"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded border border-ice-400/50 bg-navy-900 px-3 text-ice-300 transition hover:bg-navy-800 hover:text-white"
          >
            <Camera className="size-4" strokeWidth={1.75} />
            <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
              Scan
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <Filter className="size-3.5" />
            Filter
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-grid bg-white px-2 py-1.5 text-xs font-semibold text-navy-900 outline-none focus:border-ice-500"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="rounded border border-grid bg-white px-2 py-1.5 text-xs font-semibold text-navy-900 outline-none focus:border-ice-500"
            aria-label="Filter by temperature"
          >
            {TEMP_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {includeDirection && (
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="rounded border border-grid bg-white px-2 py-1.5 text-xs font-semibold text-navy-900 outline-none focus:border-ice-500"
              aria-label="Filter by sheet type"
            >
              <option value="all">All sheets</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
              <option value="special">Hold / Collect</option>
            </select>
          )}
          {active && (
            <button
              type="button"
              onClick={clearSearchFilters}
              className="rounded border border-grid px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-grid bg-slate-50 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mr-1">
          Quick
        </span>
        {quickChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setSearchQuery(chip.query ?? '')
              setStatusFilter(chip.status ?? 'all')
              setTempFilter(chip.temp ?? 'all')
            }}
            className="rounded-full border border-grid bg-white px-2.5 py-0.5 text-[11px] font-semibold text-navy-800 hover:border-ice-400 hover:bg-ice-300/20"
          >
            {chip.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] font-semibold text-slate-600">
          {matchCount} load{matchCount === 1 ? '' : 's'}
          <span className="text-slate-400">
            {' '}
            · {trailerCount} trailer{trailerCount === 1 ? '' : 's'}
          </span>
        </span>
      </div>

      <SheetScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  )
}
