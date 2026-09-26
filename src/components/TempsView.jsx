import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquareText,
  Snowflake,
  Truck,
} from 'lucide-react'
import { useApp } from '../AppContext'
import {
  YARD_KIND,
  YARD_STATUS,
  isOpenLoad,
  isParkedUnit,
} from '../seed/generateYardDay'

const WORK_TYPE_LABEL = {
  collection: 'Collection',
  delivery: 'Delivery',
  trunk: 'Trunk',
  fullMove: 'Full move',
}

const KIND_BADGE = {
  [YARD_KIND.PART_LOAD]: { label: 'PL', className: 'bg-indigo-100 text-indigo-800' },
  [YARD_KIND.FULL_LOAD]: { label: 'FL', className: 'bg-sky-100 text-sky-800' },
  [YARD_KIND.PARKED]: { label: 'Parked', className: 'bg-slate-200 text-navy-800' },
  [YARD_KIND.EMPTY]: { label: 'Empty', className: 'bg-slate-100 text-slate-600' },
  [YARD_KIND.VOR]: { label: 'VOR', className: 'bg-hold-bg text-hold' },
}

export function reeferZoneStatus(set, actual) {
  if (set == null) return 'off'
  if (actual == null) return 'waiting'
  const delta = Math.abs(Number(actual) - Number(set))
  if (delta <= 2) return 'atSet'
  if (delta > 8) return 'offSpec'
  return 'pulling'
}

const ZONE_TONE = {
  off: 'bg-slate-100 text-slate-500',
  waiting: 'bg-pending-bg text-pending',
  atSet: 'bg-loaded-bg text-loaded',
  pulling: 'bg-amber-100 text-amber-800',
  offSpec: 'bg-hold-bg text-hold',
}

function formatDeg(value) {
  if (value == null || value === '') return '-'
  const n = Number(value)
  return Number.isInteger(n) ? `${n}°` : `${n.toFixed(1)}°`
}

function ZoneChip({ label, set, actual }) {
  const off = set == null
  const status = off ? 'off' : reeferZoneStatus(set, actual)
  return (
    <div className={`rounded border border-grid px-2 py-1 ${ZONE_TONE[status]}`}>
      <p className="text-[9px] font-bold uppercase tracking-wide">{label}</p>
      <p className="font-mono text-sm font-bold tabular-nums leading-tight">
        {off ? 'OFF' : formatDeg(actual)}
      </p>
      <p className="text-[10px] font-mono opacity-80">set {off ? '-' : formatDeg(set)}</p>
    </div>
  )
}

function WorkTypeTag({ workType }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
      {WORK_TYPE_LABEL[workType] || workType}
    </span>
  )
}

function KindBadge({ kind }) {
  const meta = KIND_BADGE[kind] || KIND_BADGE[YARD_KIND.PART_LOAD]
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${meta.className}`}>
      {meta.label}
    </span>
  )
}

function LoadCard({ unit, onBay, onGoods, onReefer, onAssign, onStatus }) {
  return (
    <article className="rounded border border-grid bg-white p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Truck className="size-3.5 text-ice-500 shrink-0" />
            <h3 className="font-mono text-sm font-bold text-navy-900 truncate">
              {unit.trailer || 'Unassigned'}
            </h3>
            <KindBadge kind={unit.yardKind} />
            {unit.twin ? (
              <span className="text-[9px] font-bold uppercase tracking-wide text-ice-500">Twin</span>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Job No. <span className="font-mono font-semibold text-navy-800">{unit.jobNo || '-'}</span>
            {unit.vehicle ? ` · Vehicle ${unit.vehicle}` : ''}
            {unit.bayNo ? ` · Bay ${unit.bayNo}` : ''}
          </p>
          <p className="text-[11px] text-slate-500">
            Work type <WorkTypeTag workType={unit.workType} />
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Fill</p>
          <p className="font-mono text-lg font-bold text-navy-900 tabular-nums">{unit.fillPct || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded border border-grid bg-sheet px-2 py-1">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Goods °C</p>
          <p className="font-mono text-sm font-bold text-navy-900">{formatDeg(unit.goodsTempC)}</p>
        </div>
        <ZoneChip label="Zone 1" set={unit.zone1Set} actual={unit.zone1Actual} />
        <ZoneChip label="Zone 2" set={unit.zone2Set} actual={unit.zone2Actual} />
      </div>

      {unit.note ? <p className="text-[11px] text-slate-600">{unit.note}</p> : null}

      <div className="flex flex-wrap gap-1.5">
        <button type="button" className="rounded border border-grid px-2 py-1 text-[11px] font-semibold hover:bg-slate-50" onClick={onBay}>
          Bay
        </button>
        <button type="button" className="rounded border border-grid px-2 py-1 text-[11px] font-semibold hover:bg-slate-50" onClick={onGoods}>
          Goods °C
        </button>
        <button type="button" className="rounded border border-grid px-2 py-1 text-[11px] font-semibold hover:bg-slate-50" onClick={onReefer}>
          Reefer
        </button>
        <button type="button" className="rounded border border-grid px-2 py-1 text-[11px] font-semibold hover:bg-slate-50" onClick={onAssign}>
          Assign parked
        </button>
        <button
          type="button"
          className="rounded border border-hold/30 bg-hold-bg/40 px-2 py-1 text-[11px] font-semibold text-hold hover:bg-hold-bg"
          onClick={() => onStatus(YARD_STATUS.VOR)}
        >
          VOR
        </button>
      </div>
    </article>
  )
}

function ParkedCard({ unit, highlight }) {
  return (
    <article className={`rounded border p-2.5 ${highlight ? 'border-ice-400 bg-ice-300/20' : 'border-grid bg-white'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-sm font-bold text-navy-900">{unit.trailer}</p>
        {unit.twin ? (
          <span className="text-[9px] font-bold uppercase text-ice-500">Twin</span>
        ) : null}
      </div>
      <p className="text-[10px] text-slate-500">{unit.vehicle || '-'}{unit.bayNo ? ` · Bay ${unit.bayNo}` : ''}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        <ZoneChip label="Z1" set={unit.zone1Set} actual={unit.zone1Actual} />
        <ZoneChip label="Z2" set={unit.zone2Set} actual={unit.zone2Actual} />
      </div>
    </article>
  )
}

function ThreadItem({ item, units }) {
  const unit = units.find((u) => u.id === item.unitId)
  const isDispatch = item.role === 'dispatch'
  return (
    <li className="border-b border-grid px-3 py-2.5 last:border-0">
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded ${
            isDispatch ? 'bg-navy-900 text-ice-300' : 'bg-slate-200 text-navy-800'
          }`}
        >
          {item.type === 'reefer' ? (
            <Snowflake className="size-3.5" />
          ) : item.type === 'request' ? (
            <MessageSquareText className="size-3.5" />
          ) : item.status === YARD_STATUS.VOR ? (
            <AlertTriangle className="size-3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <p className="text-xs font-semibold text-navy-900">
              {item.author}
              <span className="ml-1 font-medium text-slate-400">{isDispatch ? 'Dispatch' : 'Yard'}</span>
            </p>
            <time className="font-mono text-[10px] text-slate-400">
              {new Date(item.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Job {item.jobNo || '-'}
            {unit?.trailer ? ` · ${unit.trailer}` : ''}
          </p>
          <p className="mt-1 text-sm leading-snug text-slate-800">{item.message}</p>
          {item.type === 'reefer' && item.payload ? (
            <div className="mt-1.5 grid max-w-[220px] grid-cols-2 gap-1">
              <ZoneChip label="Zone 1" set={item.payload.zone1Set} actual={item.payload.zone1Actual} />
              <ZoneChip
                label="Zone 2"
                set={item.payload.zone2Off ? null : item.payload.zone2Set}
                actual={item.payload.zone2Actual}
              />
            </div>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function PromptModal({ title, children, onClose, onSave, saveLabel = 'Save' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-navy-950/50" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-lg border border-grid bg-white p-4 shadow-2xl sm:rounded-lg">
        <h2 className="text-sm font-bold text-navy-900">{title}</h2>
        <div className="mt-3 space-y-2">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded border border-grid px-3 py-1.5 text-xs font-semibold" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="rounded bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TempsView() {
  const {
    yardUnits,
    yardEvents,
    assignParked,
    setYardBay,
    logReefer,
    logGoodsTemp,
    markYardStatus,
  } = useApp()

  const openLoads = useMemo(() => yardUnits.filter(isOpenLoad), [yardUnits])
  const parked = useMemo(
    () => yardUnits.filter((u) => isParkedUnit(u) && u.status !== YARD_STATUS.EMPTY),
    [yardUnits],
  )

  const [modal, setModal] = useState(null)
  const [bayValue, setBayValue] = useState('')
  const [goodsValue, setGoodsValue] = useState('')
  const [z1, setZ1] = useState('')
  const [z2, setZ2] = useState('')
  const [fill, setFill] = useState('')
  const [assignLoadId, setAssignLoadId] = useState(null)

  const openBay = (unit) => {
    setBayValue(unit.bayNo || '')
    setModal({ type: 'bay', unitId: unit.id })
  }
  const openGoods = (unit) => {
    setGoodsValue(unit.goodsTempC ?? '')
    setModal({ type: 'goods', unitId: unit.id })
  }
  const openReefer = (unit) => {
    setZ1(unit.zone1Actual ?? '')
    setZ2(unit.zone2Actual ?? '')
    setFill(unit.fillPct ?? 0)
    setModal({ type: 'reefer', unitId: unit.id })
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-ice-400/40 bg-ice-300/15 px-3 py-2 text-[12px] text-navy-900">
        Demo only - not connected to Mandata Enterprise TMS. Job No, vehicle, trailer, work type and
        bay are handshake keys; goods °C and reefer zones stay separate.
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-navy-900 pb-2">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-tight text-navy-900 sm:text-xl">
            Part loads / Temps
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Traffic-pad keys · Cross-dock bay · Shared yard ops thread
          </p>
        </div>
        <p className="text-xs font-medium text-slate-600">
          {openLoads.length} open · {parked.length} parked
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="space-y-2 lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Open loads</h2>
          <div className="space-y-2">
            {openLoads.map((unit) => (
              <LoadCard
                key={unit.id}
                unit={unit}
                onBay={() => openBay(unit)}
                onGoods={() => openGoods(unit)}
                onReefer={() => openReefer(unit)}
                onAssign={() => setAssignLoadId(unit.id)}
                onStatus={(status) => markYardStatus(unit.id, status)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-2 lg:col-span-1">
          <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Available / parked
          </h2>
          <div className="space-y-2">
            {parked.map((unit) => (
              <ParkedCard key={unit.id} unit={unit} highlight={unit.twin} />
            ))}
            {parked.length === 0 ? (
              <p className="rounded border border-dashed border-grid px-3 py-6 text-center text-sm text-slate-500">
                No parked trailers
              </p>
            ) : null}
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded border border-grid bg-white shadow-sm">
            <div className="flex items-center justify-between bg-navy-900 px-3 py-2.5 text-white">
              <h2 className="text-sm font-semibold">Ops thread</h2>
              <span className="font-mono text-[10px] text-ice-300">{yardEvents.length} events</span>
            </div>
            <ul className="flex-1 overflow-y-auto">
              {yardEvents.map((item) => (
                <ThreadItem key={item.id} item={item} units={yardUnits} />
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {modal?.type === 'bay' ? (
        <PromptModal
          title="Set bay"
          onClose={() => setModal(null)}
          onSave={() => {
            setYardBay(modal.unitId, bayValue)
            setModal(null)
          }}
        >
          <label className="block text-xs font-semibold text-slate-600">
            Bay
            <input
              value={bayValue}
              onChange={(e) => setBayValue(e.target.value)}
              className="mt-1 w-full rounded border border-grid px-2 py-1.5 font-mono text-sm"
              aria-label="Bay number"
            />
          </label>
        </PromptModal>
      ) : null}

      {modal?.type === 'goods' ? (
        <PromptModal
          title="Goods temperature (Manifest-shaped)"
          onClose={() => setModal(null)}
          onSave={() => {
            logGoodsTemp(modal.unitId, goodsValue)
            setModal(null)
          }}
        >
          <label className="block text-xs font-semibold text-slate-600">
            Goods °C
            <input
              type="number"
              value={goodsValue}
              onChange={(e) => setGoodsValue(e.target.value)}
              className="mt-1 w-full rounded border border-grid px-2 py-1.5 font-mono text-sm"
              aria-label="Goods temperature"
            />
          </label>
        </PromptModal>
      ) : null}

      {modal?.type === 'reefer' ? (
        <PromptModal
          title="Reefer zones (asset / Thermo King-shaped)"
          onClose={() => setModal(null)}
          onSave={() => {
            logReefer(modal.unitId, {
              zone1Actual: z1 === '' ? null : Number(z1),
              zone2Actual: z2 === '' ? null : Number(z2),
              fillPct: fill === '' ? undefined : Number(fill),
            })
            setModal(null)
          }}
        >
          <label className="block text-xs font-semibold text-slate-600">
            Zone 1 actual °C
            <input
              type="number"
              value={z1}
              onChange={(e) => setZ1(e.target.value)}
              className="mt-1 w-full rounded border border-grid px-2 py-1.5 font-mono text-sm"
              aria-label="Zone 1 actual"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Zone 2 actual °C
            <input
              type="number"
              value={z2}
              onChange={(e) => setZ2(e.target.value)}
              className="mt-1 w-full rounded border border-grid px-2 py-1.5 font-mono text-sm"
              aria-label="Zone 2 actual"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Fill %
            <input
              type="number"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="mt-1 w-full rounded border border-grid px-2 py-1.5 font-mono text-sm"
              aria-label="Fill percent"
            />
          </label>
        </PromptModal>
      ) : null}

      {assignLoadId ? (
        <PromptModal
          title="Assign parked trailer"
          saveLabel="Close"
          onClose={() => setAssignLoadId(null)}
          onSave={() => setAssignLoadId(null)}
        >
          <p className="text-xs text-slate-500">Put a parked-up trailer on this job.</p>
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {parked.map((unit) => (
              <li key={unit.id}>
                <button
                  type="button"
                  className="w-full rounded border border-grid px-2 py-1.5 text-left text-sm hover:bg-ice-300/20"
                  onClick={() => {
                    assignParked(unit.id, assignLoadId)
                    setAssignLoadId(null)
                  }}
                >
                  {unit.trailer}
                  {unit.twin ? ' · twin' : ''}
                </button>
              </li>
            ))}
          </ul>
        </PromptModal>
      ) : null}
    </div>
  )
}
