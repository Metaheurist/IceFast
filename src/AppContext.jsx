import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  STATUS,
  allPalletNos,
  applyStatusChange,
  doneCount,
  nextStatus,
  normalizeTrailers,
  toggleDonePallet,
  DEMO_LOAD_DATE,
} from './data'
import { generateYardDay, isParkedUnit, YARD_KIND, YARD_STATUS } from './seed/generateYardDay'
import {
  toMandataAssetTemp,
  toMandataEvent,
  toMandataJobPatch,
} from './integrations/mandataHandshake'

const AppContext = createContext(null)

function makeFeedItem({ type, trailer, job, message }) {
  return {
    id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    at: new Date().toISOString(),
    trailerId: trailer.id,
    trailerLabel: `${trailer.vehicle} / ${trailer.trailer}`,
    driver: trailer.driver,
    jobId: job.id,
    jobNo: job.jobNo,
    customer: job.customer,
    pallets: job.pallets,
    done: doneCount(job),
    orderRef: job.orderRef,
    inbDriver: job.inbDriver,
    inbVeh: job.inbVeh,
    deliverDate: job.deliverDate,
    ref: job.ref,
    message,
    status: job.status,
  }
}

function seedFeed(trailers) {
  const seeded = []
  for (const trailer of trailers) {
    for (const job of trailer.jobs) {
      if (job.note) {
        seeded.push({
          id: `seed-${job.id}`,
          type: 'note',
          at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          trailerId: trailer.id,
          trailerLabel: `${trailer.vehicle} / ${trailer.trailer}`,
          driver: trailer.driver,
          jobId: job.id,
          jobNo: job.jobNo,
          customer: job.customer,
          pallets: job.pallets,
          done: doneCount(job),
          orderRef: job.orderRef,
          inbDriver: job.inbDriver,
          inbVeh: job.inbVeh,
          deliverDate: job.deliverDate,
          ref: job.ref,
          message: job.note,
          status: job.status,
        })
      } else if (job.status === 'hold') {
        seeded.push({
          id: `seed-hold-${job.id}`,
          type: 'status',
          at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          trailerId: trailer.id,
          trailerLabel: `${trailer.vehicle} / ${trailer.trailer}`,
          driver: trailer.driver,
          jobId: job.id,
          jobNo: job.jobNo,
          customer: job.customer,
          pallets: job.pallets,
          done: doneCount(job),
          orderRef: job.orderRef,
          inbDriver: job.inbDriver,
          inbVeh: job.inbVeh,
          deliverDate: job.deliverDate,
          ref: job.ref,
          message: `Hold · ${doneCount(job)}/${job.pallets} pallets done`,
          status: job.status,
        })
      }
    }
  }
  return seeded.sort((a, b) => new Date(b.at) - new Date(a.at))
}

function patchJob(trailers, trailerId, jobId, updater) {
  let meta = null
  const next = trailers.map((trailer) => {
    if (trailer.id !== trailerId) return trailer
    return {
      ...trailer,
      jobs: trailer.jobs.map((job) => {
        if (job.id !== jobId) return job
        const updated = updater(job)
        meta = { trailer, job: updated }
        return updated
      }),
    }
  })
  return { next, meta }
}

function findJob(trailers, trailerId, jobId) {
  return trailers.find((t) => t.id === trailerId)?.jobs.find((j) => j.id === jobId)
}

function makeYardEvent({ unit, type, role = 'yard', author = 'Warehouse floor', message, replyTo = '', payload = null }) {
  return {
    id: `ye-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    unitId: unit.id,
    jobNo: unit.jobNo ?? '',
    at: new Date().toISOString(),
    role,
    author,
    type,
    replyTo,
    message,
    payload,
  }
}

function handshakeFor(unit, yardEvent) {
  return {
    job: toMandataJobPatch(unit),
    asset: toMandataAssetTemp(unit),
    event: toMandataEvent(yardEvent),
  }
}

function reeferStatusFromZones(unit) {
  const z1Set = unit.zone1Set
  const z1Act = unit.zone1Actual
  if (z1Set == null || z1Act == null) return unit.status
  const delta = Math.abs(z1Act - z1Set)
  if (delta <= 2) return YARD_STATUS.AT_SETPOINT
  if (delta > 8) return YARD_STATUS.PULLING_DOWN
  return YARD_STATUS.PULLING_DOWN
}

/**
 * @param {{ children: import('react').ReactNode, seedTrailers?: object[] }} props
 * `seedTrailers` / `seedYardUnits` / `seedYardEvents` are for unit tests only.
 */
export function AppProvider({ children, seedTrailers, seedYardUnits, seedYardEvents }) {
  const usingSeed = Array.isArray(seedTrailers)
  const seededYard = usingSeed
    ? Array.isArray(seedYardUnits)
      ? {
          units: structuredClone(seedYardUnits),
          events: structuredClone(seedYardEvents ?? []),
        }
      : generateYardDay(DEMO_LOAD_DATE, seedTrailers)
    : { units: [], events: [] }

  const [trailers, setTrailers] = useState(() =>
    usingSeed ? normalizeTrailers(structuredClone(seedTrailers)) : [],
  )
  const [feed, setFeed] = useState(() =>
    usingSeed ? seedFeed(normalizeTrailers(structuredClone(seedTrailers))) : [],
  )
  const [yardUnits, setYardUnits] = useState(() => seededYard.units)
  const [yardEvents, setYardEvents] = useState(() => seededYard.events)
  const [lastHandshake, setLastHandshake] = useState(null)
  const [dataStatus, setDataStatus] = useState(usingSeed ? 'ready' : 'loading')
  const [dataError, setDataError] = useState(null)
  const [view, setView] = useState('floor')
  const [directionFilter, setDirectionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tempFilter, setTempFilter] = useState('all')
  const [loadDate, setLoadDate] = useState(DEMO_LOAD_DATE)
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toISOString())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const trailersRef = useRef(trailers)
  trailersRef.current = trailers
  const yardUnitsRef = useRef(yardUnits)
  yardUnitsRef.current = yardUnits
  const seedYardRef = useRef(seededYard)

  const applyLoaded = useCallback((fresh, meta, yard) => {
    trailersRef.current = fresh
    setTrailers(fresh)
    setFeed(seedFeed(fresh))
    if (yard) {
      yardUnitsRef.current = yard.units
      setYardUnits(yard.units)
      setYardEvents(yard.events)
    }
    if (meta?.load_date) setLoadDate(meta.load_date)
    setLastSyncedAt(new Date().toISOString())
    setDataStatus('ready')
    setDataError(null)
  }, [])

  useEffect(() => {
    if (usingSeed) return undefined
    let cancelled = false
    setDataStatus('loading')
    import('./db/demoDb')
      .then(({ loadDemoTrailers }) => loadDemoTrailers())
      .then(({ trailers: fresh, yardUnits: units, yardEvents: events, meta }) => {
        if (cancelled) return
        applyLoaded(fresh, meta, { units: units ?? [], events: events ?? [] })
      })
      .catch((err) => {
        if (cancelled) return
        setDataStatus('error')
        setDataError(err?.message || 'Could not load demo.db')
      })
    return () => {
      cancelled = true
    }
  }, [usingSeed, applyLoaded])

  const commitJob = useCallback((trailerId, jobId, updated, feedType, message) => {
    const { next, meta } = patchJob(trailersRef.current, trailerId, jobId, () => updated)
    if (!meta) return
    trailersRef.current = next
    setTrailers(next)
    setFeed((f) => [
      makeFeedItem({
        type: feedType,
        trailer: meta.trailer,
        job: meta.job,
        message,
      }),
      ...f,
    ])
  }, [])

  const cycleJobStatus = useCallback(
    (trailerId, jobId) => {
      const before = findJob(trailersRef.current, trailerId, jobId)
      if (!before) return
      const status = nextStatus(before.status)
      const updated = applyStatusChange(before, status)
      const done = doneCount(updated)
      commitJob(
        trailerId,
        jobId,
        updated,
        'status',
        status === STATUS.LOADED
          ? `Marked Loaded · ${done}/${updated.pallets} pallets`
          : status === STATUS.HOLD
            ? `Marked Hold · ${done}/${updated.pallets} pallets done`
            : 'Reset to Pending · cleared pallet progress',
      )
    },
    [commitJob],
  )

  const toggleJobPallet = useCallback(
    (trailerId, jobId, palletNo) => {
      const before = findJob(trailersRef.current, trailerId, jobId)
      if (!before) return
      const wasDone = (before.donePallets ?? []).includes(palletNo)
      const updated = toggleDonePallet(before, palletNo)
      const done = doneCount(updated)
      commitJob(
        trailerId,
        jobId,
        updated,
        'progress',
        wasDone
          ? `Pallet ${palletNo} unmarked · ${done}/${updated.pallets} done`
          : `Pallet ${palletNo} done · ${done}/${updated.pallets} done${
              updated.status === STATUS.HOLD ? ' (on hold)' : ''
            }`,
      )
    },
    [commitJob],
  )

  const setJobDoneCount = useCallback(
    (trailerId, jobId, count) => {
      const before = findJob(trailersRef.current, trailerId, jobId)
      if (!before) return
      const clamped = Math.max(0, Math.min(before.pallets, count))
      const donePallets = allPalletNos(clamped)
      let updated = { ...before, donePallets }
      if (before.status === STATUS.HOLD && clamped < before.pallets) {
        updated = { ...updated, status: STATUS.HOLD }
      } else if (clamped >= before.pallets && before.pallets > 0) {
        updated = { ...updated, status: STATUS.LOADED }
      } else if (clamped === 0) {
        updated = {
          ...updated,
          status: before.status === STATUS.HOLD ? STATUS.HOLD : STATUS.PENDING,
        }
      } else if (before.status === STATUS.LOADED) {
        updated = { ...updated, status: STATUS.PENDING }
      }
      commitJob(
        trailerId,
        jobId,
        updated,
        'progress',
        `Set progress ${doneCount(updated)}/${updated.pallets} pallets${
          updated.status === STATUS.HOLD ? ' · on hold' : ''
        }`,
      )
    },
    [commitJob],
  )

  const markJobHold = useCallback(
    (trailerId, jobId) => {
      const before = findJob(trailersRef.current, trailerId, jobId)
      if (!before) return
      const updated = applyStatusChange(before, STATUS.HOLD)
      const done = doneCount(updated)
      commitJob(
        trailerId,
        jobId,
        updated,
        'status',
        `Hold with ${done}/${updated.pallets} pallets done · ${updated.pallets - done} remaining`,
      )
    },
    [commitJob],
  )

  const saveJobNote = useCallback((trailerId, jobId, note) => {
    const trimmed = note.trim()
    const before = findJob(trailersRef.current, trailerId, jobId)
    if (!before) return
    const updated = { ...before, note: trimmed }
    const { next, meta } = patchJob(trailersRef.current, trailerId, jobId, () => updated)
    if (!meta) return
    trailersRef.current = next
    setTrailers(next)
    if (trimmed) {
      setFeed((f) => [
        makeFeedItem({
          type: 'note',
          trailer: meta.trailer,
          job: meta.job,
          message: trimmed,
        }),
        ...f,
      ])
    }
  }, [])

  const commitYardChange = useCallback((nextUnits, event, unitAfter) => {
    yardUnitsRef.current = nextUnits
    setYardUnits(nextUnits)
    setYardEvents((ev) => [event, ...ev])
    setLastHandshake(handshakeFor(unitAfter, event))
  }, [])

  const assignParked = useCallback((parkedId, loadId) => {
    const parked = yardUnitsRef.current.find((u) => u.id === parkedId)
    const load = yardUnitsRef.current.find((u) => u.id === loadId)
    if (!parked || !load || !isParkedUnit(parked)) return
    const nextLoad = {
      ...load,
      vehicle: parked.vehicle,
      trailer: parked.trailer,
      twin: parked.twin,
      status: YARD_STATUS.ASSIGNED,
      zone1Set: load.zone1Set ?? parked.zone1Set,
      zone2Set: load.zone2Set ?? parked.zone2Set,
      zone1Actual: parked.zone1Actual,
      zone2Actual: parked.zone2Actual,
    }
    const nextParked = {
      ...parked,
      status: YARD_STATUS.EMPTY,
      yardKind: YARD_KIND.EMPTY,
    }
    const nextUnits = yardUnitsRef.current.map((u) => {
      if (u.id === loadId) return nextLoad
      if (u.id === parkedId) return nextParked
      return u
    })
    const event = makeYardEvent({
      unit: nextLoad,
      type: 'move',
      role: 'yard',
      message: `Put ${parked.trailer} on job ${load.jobNo || load.id}`,
    })
    commitYardChange(nextUnits, event, nextLoad)
  }, [commitYardChange])

  const setYardBay = useCallback((unitId, bayNo) => {
    const before = yardUnitsRef.current.find((u) => u.id === unitId)
    if (!before) return
    const updated = { ...before, bayNo: String(bayNo ?? '') }
    const nextUnits = yardUnitsRef.current.map((u) => (u.id === unitId ? updated : u))
    const event = makeYardEvent({
      unit: updated,
      type: 'bay',
      message: `Bay ${updated.bayNo || '-'}`,
    })
    commitYardChange(nextUnits, event, updated)
  }, [commitYardChange])

  const logReefer = useCallback((unitId, patch = {}) => {
    const before = yardUnitsRef.current.find((u) => u.id === unitId)
    if (!before) return
    const updated = {
      ...before,
      zone1Actual: patch.zone1Actual ?? before.zone1Actual,
      zone2Actual: patch.zone2Actual ?? before.zone2Actual,
      fillPct: patch.fillPct ?? before.fillPct,
    }
    updated.status = reeferStatusFromZones(updated)
    const nextUnits = yardUnitsRef.current.map((u) => (u.id === unitId ? updated : u))
    const short = (updated.trailer || 'unit').replace(/^IF/i, '')
    const event = makeYardEvent({
      unit: updated,
      type: 'reefer',
      message: `${short} ${updated.fillPct || 0}%`,
      payload: {
        zone1Set: updated.zone1Set,
        zone1Actual: updated.zone1Actual,
        zone2Set: updated.zone2Set,
        zone2Actual: updated.zone2Actual,
        fillPct: updated.fillPct,
      },
    })
    commitYardChange(nextUnits, event, updated)
  }, [commitYardChange])

  const logGoodsTemp = useCallback((unitId, goodsTempC) => {
    const before = yardUnitsRef.current.find((u) => u.id === unitId)
    if (!before) return
    const updated = { ...before, goodsTempC: Number(goodsTempC) }
    const nextUnits = yardUnitsRef.current.map((u) => (u.id === unitId ? updated : u))
    const event = makeYardEvent({
      unit: updated,
      type: 'confirm',
      message: `Goods ${updated.goodsTempC}°C · job ${updated.jobNo || '-'}`,
    })
    commitYardChange(nextUnits, event, updated)
  }, [commitYardChange])

  const markYardStatus = useCallback((unitId, status) => {
    const before = yardUnitsRef.current.find((u) => u.id === unitId)
    if (!before) return
    const updated = { ...before, status }
    if (status === YARD_STATUS.PARKED) updated.yardKind = YARD_KIND.PARKED
    if (status === YARD_STATUS.VOR) updated.yardKind = YARD_KIND.VOR
    if (status === YARD_STATUS.EMPTY) updated.yardKind = YARD_KIND.EMPTY
    const nextUnits = yardUnitsRef.current.map((u) => (u.id === unitId ? updated : u))
    const event = makeYardEvent({
      unit: updated,
      type: 'move',
      message: `${updated.trailer || updated.jobNo || updated.id} ${status}`,
    })
    commitYardChange(nextUnits, event, updated)
  }, [commitYardChange])

  const updateTrailerMeta = useCallback((trailerId, patch) => {
    const before = trailersRef.current.find((t) => t.id === trailerId)
    if (!before) return
    const allowed = ['checker', 'timeOn', 'timeOff', 'bayNo']
    const nextPatch = {}
    for (const key of allowed) {
      if (key in patch) nextPatch[key] = patch[key]
    }
    const updated = { ...before, ...nextPatch }
    const next = trailersRef.current.map((t) => (t.id === trailerId ? updated : t))
    trailersRef.current = next
    setTrailers(next)

    const bits = []
    if ('checker' in nextPatch) bits.push(`Checker: ${nextPatch.checker || '-'}`)
    if ('timeOn' in nextPatch) bits.push(`Time on: ${nextPatch.timeOn || '-'}`)
    if ('timeOff' in nextPatch) bits.push(`Time off: ${nextPatch.timeOff || '-'}`)
    if ('bayNo' in nextPatch) bits.push(`Bay: ${nextPatch.bayNo || '-'}`)
    if (bits.length === 0) return

    const firstJob = updated.jobs[0]
    if (!firstJob) return
    setFeed((f) => [
      {
        id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'bay',
        at: new Date().toISOString(),
        trailerId: updated.id,
        trailerLabel: `${updated.vehicle} / ${updated.trailer}`,
        driver: updated.driver,
        jobId: firstJob.id,
        jobNo: firstJob.jobNo,
        customer: updated.driver,
        pallets: firstJob.pallets,
        done: doneCount(firstJob),
        orderRef: firstJob.orderRef,
        inbDriver: firstJob.inbDriver,
        inbVeh: firstJob.inbVeh,
        deliverDate: firstJob.deliverDate,
        ref: firstJob.ref,
        message: bits.join(' · '),
        status: firstJob.status,
      },
      ...f,
    ])
  }, [])

  const refreshData = useCallback(() => {
    if (isRefreshing) return
    setIsRefreshing(true)

    const finish = (fresh, meta, yard) => {
      applyLoaded(fresh, meta, yard)
      setIsRefreshing(false)
    }

    if (usingSeed) {
      window.setTimeout(() => {
        finish(
          normalizeTrailers(structuredClone(seedTrailers)),
          { load_date: loadDate },
          {
            units: structuredClone(seedYardRef.current.units),
            events: structuredClone(seedYardRef.current.events),
          },
        )
      }, 450)
      return
    }

    import('./db/demoDb')
      .then(({ clearDemoDbCache, loadDemoTrailers }) => {
        clearDemoDbCache()
        return loadDemoTrailers({ bustCache: true })
      })
      .then(({ trailers: fresh, yardUnits: units, yardEvents: events, meta }) =>
        finish(fresh, meta, { units: units ?? [], events: events ?? [] }),
      )
      .catch((err) => {
        setDataStatus('error')
        setDataError(err?.message || 'Could not reload demo.db')
        setIsRefreshing(false)
      })
  }, [isRefreshing, usingSeed, seedTrailers, applyLoaded, loadDate])

  const clearSearchFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setTempFilter('all')
  }, [])

  const value = useMemo(
    () => ({
      trailers,
      feed,
      yardUnits,
      yardEvents,
      lastHandshake,
      dataStatus,
      dataError,
      view,
      setView,
      directionFilter,
      setDirectionFilter,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      tempFilter,
      setTempFilter,
      clearSearchFilters,
      loadDate,
      lastSyncedAt,
      isRefreshing,
      cycleJobStatus,
      toggleJobPallet,
      setJobDoneCount,
      markJobHold,
      saveJobNote,
      updateTrailerMeta,
      assignParked,
      setYardBay,
      logReefer,
      logGoodsTemp,
      markYardStatus,
      refreshData,
    }),
    [
      trailers,
      feed,
      yardUnits,
      yardEvents,
      lastHandshake,
      dataStatus,
      dataError,
      view,
      directionFilter,
      searchQuery,
      statusFilter,
      tempFilter,
      clearSearchFilters,
      loadDate,
      lastSyncedAt,
      isRefreshing,
      cycleJobStatus,
      toggleJobPallet,
      setJobDoneCount,
      markJobHold,
      saveJobNote,
      updateTrailerMeta,
      assignParked,
      setYardBay,
      logReefer,
      logGoodsTemp,
      markYardStatus,
      refreshData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
