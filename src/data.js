import { generateDemoDay } from './seed/generateDemoDay.js'
import { generateYardDay } from './seed/generateYardDay.js'

export const STATUS = {
  PENDING: 'pending',
  LOADED: 'loaded',
  HOLD: 'hold',
}

export const STATUS_CYCLE = [STATUS.PENDING, STATUS.LOADED, STATUS.HOLD]

export const STATUS_META = {
  [STATUS.PENDING]: {
    label: 'Pending',
    short: '-',
    className: 'bg-pending-bg text-pending border-pending/30',
    rowClass: '',
  },
  [STATUS.LOADED]: {
    label: 'Loaded',
    short: '✓',
    className: 'bg-loaded-bg text-loaded border-loaded/30',
    rowClass: 'bg-loaded-bg/40',
  },
  [STATUS.HOLD]: {
    label: 'Hold',
    short: '!',
    className: 'bg-hold-bg text-hold border-hold/40',
    rowClass: 'bg-hold-bg/50',
  },
}

/**
 * Fictional inbound/outbound day. Live app loads SQLite `public/demo.db`,
 * rebuilt on each `npm run dev` via `scripts/build-demo-db.mjs`.
 */
const demoDay = generateDemoDay()
const yardDay = generateYardDay(demoDay.loadDate, demoDay.trailers)
export const DEMO_LOAD_DATE = demoDay.loadDate
export const INITIAL_TRAILERS = demoDay.trailers
export const INITIAL_YARD_UNITS = yardDay.units
export const INITIAL_YARD_EVENTS = yardDay.events

export function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

/** 1-based pallet numbers for a full set */
export function allPalletNos(count) {
  return Array.from({ length: count }, (_, i) => i + 1)
}

export function doneCount(job) {
  return job.donePallets?.length ?? 0
}

export function remainingPallets(job) {
  const done = new Set(job.donePallets ?? [])
  return allPalletNos(job.pallets).filter((n) => !done.has(n))
}

/** Derive job status from progress unless explicitly on Hold */
export function syncStatusFromProgress(job, { preferHold = false } = {}) {
  const done = doneCount(job)
  if (preferHold || job.status === STATUS.HOLD) {
    if (done >= job.pallets && job.pallets > 0) {
      return { ...job, status: STATUS.LOADED, donePallets: allPalletNos(job.pallets) }
    }
    return { ...job, status: STATUS.HOLD }
  }
  if (done >= job.pallets && job.pallets > 0) {
    return { ...job, status: STATUS.LOADED, donePallets: allPalletNos(job.pallets) }
  }
  if (done === 0) {
    return { ...job, status: STATUS.PENDING }
  }
  // Partial load still in progress
  return { ...job, status: STATUS.PENDING }
}

export function applyStatusChange(job, status) {
  if (status === STATUS.LOADED) {
    return { ...job, status, donePallets: allPalletNos(job.pallets) }
  }
  if (status === STATUS.PENDING) {
    return { ...job, status, donePallets: [] }
  }
  // Hold keeps existing done pallets (e.g. 1/10 done + on hold)
  return { ...job, status }
}

export function toggleDonePallet(job, palletNo) {
  const set = new Set(job.donePallets ?? [])
  if (set.has(palletNo)) set.delete(palletNo)
  else set.add(palletNo)
  const donePallets = [...set].sort((a, b) => a - b)
  const next = { ...job, donePallets }
  // Keep Hold if already on hold and not fully done
  if (job.status === STATUS.HOLD && donePallets.length < job.pallets) {
    return { ...next, status: STATUS.HOLD }
  }
  return syncStatusFromProgress(next, { preferHold: false })
}

export function trailerTotals(trailer) {
  const total = trailer.jobs.reduce((sum, j) => sum + j.pallets, 0)
  const loaded = trailer.jobs.reduce((sum, j) => sum + doneCount(j), 0)
  const holdRemaining = trailer.jobs
    .filter((j) => j.status === STATUS.HOLD)
    .reduce((sum, j) => sum + (j.pallets - doneCount(j)), 0)
  const pending = Math.max(0, total - loaded - holdRemaining)
  const jobLoaded = trailer.jobs.filter(
    (j) => doneCount(j) >= j.pallets && j.pallets > 0,
  ).length
  const jobPartial = trailer.jobs.filter(
    (j) => doneCount(j) > 0 && doneCount(j) < j.pallets,
  ).length
  return {
    total,
    loaded,
    hold: holdRemaining,
    pending,
    jobLoaded,
    jobPartial,
    jobCount: trailer.jobs.length,
  }
}

/** Split legacy dateRef "21/08/2026 / ABC" or plain date into deliverDate + ref */
export function splitDateRef(dateRef = '') {
  const value = String(dateRef).trim()
  if (!value) return { deliverDate: '', ref: '' }
  const withRef = value.match(/^(\d{2}\/\d{2}\/\d{4})\s*\/\s*(.+)$/)
  if (withRef) {
    return { deliverDate: withRef[1], ref: withRef[2].trim() }
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return { deliverDate: value, ref: '' }
  }
  return { deliverDate: '', ref: value }
}

export function isSpecialBucket(trailer) {
  return (
    trailer.vehicle === 'HOLD' ||
    trailer.trailer === 'PALLETSHOLD' ||
    trailer.vehicle === 'COLLECTION' ||
    trailer.trailer === 'TOCOLLECT'
  )
}

export function bayDwellMinutes(trailer) {
  if (!trailer.timeOn || !trailer.timeOff) return null
  const parse = (t) => {
    const m = String(t).match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return null
    return Number(m[1]) * 60 + Number(m[2])
  }
  const on = parse(trailer.timeOn)
  const off = parse(trailer.timeOff)
  if (on == null || off == null) return null
  let diff = off - on
  if (diff < 0) diff += 24 * 60
  return diff
}

/** Map sheet Temp strings into bands for dispatch mix summary */
export function tempBand(temp = '') {
  const t = String(temp).toUpperCase()
  if (t.includes('FROZEN')) return 'frozen'
  if (t.includes('VEG')) return 'veg'
  if (t.includes('CHILLED') || t.includes('CHILL')) return 'chilled'
  if (t.includes('AMBIENT')) return 'ambient'
  return 'other'
}

export function trailerTempMix(trailer) {
  const mix = { frozen: 0, chilled: 0, veg: 0, ambient: 0, other: 0 }
  for (const job of trailer.jobs) {
    mix[tempBand(job.temp)] += job.pallets
  }
  return mix
}

export function trailerPartialJobs(trailer) {
  return trailer.jobs
    .filter((j) => doneCount(j) > 0 && doneCount(j) < j.pallets)
    .map((j) => ({
      jobNo: j.jobNo,
      customer: j.customer,
      done: doneCount(j),
      total: j.pallets,
      donePallets: [...(j.donePallets ?? [])],
      status: j.status,
    }))
}

/** Build a searchable haystack for a job + its trailer (easy load lookup) */
export function loadSearchText(trailer, job) {
  return [
    trailer.vehicle,
    trailer.trailer,
    trailer.driver,
    trailer.bayNo,
    trailer.checker,
    trailer.startTime,
    job.customer,
    job.jobNo,
    job.temp,
    job.collectFrom,
    job.collectTown,
    job.deliverTo,
    job.deliverTown,
    job.deliverDate,
    job.ref,
    job.orderRef,
    job.inbDriver,
    job.inbVeh,
    job.note,
    job.deliveryWindow,
    job.status,
    `${trailer.vehicle}/${trailer.trailer}`,
    `${trailer.vehicle} ${trailer.trailer}`,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function jobMatchesFilters(trailer, job, { query = '', status = 'all', temp = 'all' } = {}) {
  if (status !== 'all' && job.status !== status) return false
  if (temp !== 'all' && tempBand(job.temp) !== temp) return false
  const q = String(query).trim().toLowerCase()
  if (!q) return true
  const tokens = q.split(/\s+/).filter(Boolean)
  const hay = loadSearchText(trailer, job)
  return tokens.every((token) => hay.includes(token))
}

/**
 * Filter trailers for Floor/Dispatch search.
 * Returns trailers with only matching jobs when a query/status/temp filter is active.
 */
export function filterTrailers(trailers, filters = {}) {
  const { query = '', status = 'all', temp = 'all', direction = 'all' } = filters
  const hasJobFilter = Boolean(String(query).trim()) || status !== 'all' || temp !== 'all'

  return trailers
    .filter((t) => {
      if (direction === 'all') return true
      if (direction === 'special') return isSpecialBucket(t)
      return t.direction === direction && !isSpecialBucket(t)
    })
    .map((trailer) => {
      if (!hasJobFilter) return trailer
      const jobs = trailer.jobs.filter((job) =>
        jobMatchesFilters(trailer, job, { query, status, temp }),
      )
      return { ...trailer, jobs }
    })
    .filter((trailer) => {
      if (!hasJobFilter) return true
      return trailer.jobs.length > 0
    })
}

export function countMatchingJobs(trailers, filters = {}) {
  return filterTrailers(trailers, filters).reduce((n, t) => n + t.jobs.length, 0)
}

/** Pull likely identifiers from OCR / sheet photo text */
export function extractSheetTokens(rawText) {
  const text = String(rawText || '')
  const upper = text.toUpperCase()
  const tokens = new Set()

  for (const m of upper.matchAll(/\b(?:JOB\s*(?:NO\.?|NUMBER)?\s*)?(\d{6,8})\b/g)) {
    tokens.add(m[1])
  }
  for (const m of upper.matchAll(/\bIF\d{2,4}\b/g)) tokens.add(m[0])
  for (const m of upper.matchAll(/\bV\d{2,4}IF\b/g)) tokens.add(m[0])
  for (const m of upper.matchAll(/\b[A-Z]{1,3}\d{2}[A-Z]{3}\b/g)) tokens.add(m[0]) // e.g. SN26WUE
  for (const m of upper.matchAll(/\b(?:LC|PO|ASDA)[-_]?\d{4,}\b/g)) tokens.add(m[0])
  for (const m of upper.matchAll(/\b\d{6,12}\b/g)) {
    if (m[0].length >= 7) tokens.add(m[0])
  }

  // Place / customer cues (multi-word kept as phrases when useful)
  const placeHints = [
    'NORTHBRIDGE',
    'HARBOUR CHILL',
    'OAKVALE',
    'AMBERFIELD',
    'MAPLEFORD',
    'STONEWELL',
    'CEDAR RIDGE',
    'BRACKEN MILL',
    'HOLD',
    'COLLECTION',
    'TOCOLLECT',
    'PALLETSHOLD',
  ]
  for (const hint of placeHints) {
    if (upper.includes(hint)) tokens.add(hint.toLowerCase())
  }

  return [...tokens]
}

/**
 * Rank active loads against OCR text from a photographed sheet.
 * Prefer job numbers and trailer IDs over soft place names.
 */
export function matchLoadsFromSheetText(trailers, rawText, { limit = 8 } = {}) {
  const tokens = extractSheetTokens(rawText)
  if (tokens.length === 0) return []

  const scored = []
  for (const trailer of trailers) {
    for (const job of trailer.jobs) {
      const hay = loadSearchText(trailer, job)
      let score = 0
      const hits = []
      for (const token of tokens) {
        const t = token.toLowerCase()
        if (!hay.includes(t)) continue
        hits.push(token)
        if (/^\d{6,}$/.test(token)) score += 12
        else if (/^if\d+/i.test(token) || /^v\d+if$/i.test(token)) score += 10
        else if (token.length >= 6) score += 4
        else score += 2
      }
      if (score <= 0) continue
      scored.push({
        score,
        hits,
        trailerId: trailer.id,
        jobId: job.id,
        vehicle: trailer.vehicle,
        trailer: trailer.trailer,
        driver: trailer.driver,
        customer: job.customer,
        jobNo: job.jobNo,
        collectFrom: job.collectFrom,
        collectTown: job.collectTown,
        deliverTo: job.deliverTo,
        deliverTown: job.deliverTown,
        status: job.status,
        query: job.jobNo || hits[0] || '',
      })
    }
  }

  scored.sort((a, b) => b.score - a.score || a.jobNo.localeCompare(b.jobNo))
  return scored.slice(0, limit)
}

function normalizeJob(job) {
  let next = { ...job }
  if (next.deliverDate == null || next.ref == null) {
    if (next.dateRef) {
      const split = splitDateRef(next.dateRef)
      next.deliverDate = next.deliverDate ?? split.deliverDate
      next.ref = next.ref ?? split.ref
    } else {
      next.deliverDate = next.deliverDate ?? ''
      next.ref = next.ref ?? ''
    }
  }
  next.deliveryWindow = next.deliveryWindow ?? ''
  if (Array.isArray(next.donePallets)) return next
  if (next.status === STATUS.LOADED) {
    return { ...next, donePallets: allPalletNos(next.pallets) }
  }
  return { ...next, donePallets: [] }
}

/** Ensure donePallets, deliverDate/ref, and checker fields */
export function normalizeTrailers(trailers) {
  return trailers.map((trailer) => ({
    ...trailer,
    checker: trailer.checker ?? '',
    timeOn: trailer.timeOn ?? '',
    timeOff: trailer.timeOff ?? '',
    bayNo: trailer.bayNo ?? '',
    jobs: trailer.jobs.map(normalizeJob),
  }))
}
