import { describe, expect, it } from 'vitest'
import {
  INITIAL_TRAILERS,
  bayDwellMinutes,
  countMatchingJobs,
  extractSheetTokens,
  filterTrailers,
  isSpecialBucket,
  matchLoadsFromSheetText,
  normalizeTrailers,
  splitDateRef,
  tempBand,
  trailerPartialJobs,
  trailerTempMix,
} from './data'
import {
  DEMO_JOB_ID,
  DEMO_TRAILER_ID,
  buildDemoOcrSample,
  findDemoJob,
} from './seed/generateDemoDay'

describe('splitDateRef', () => {
  it('splits inbound Date/Ref into deliverDate + ref', () => {
    expect(splitDateRef('21/08/2026 / 3536210826')).toEqual({
      deliverDate: '21/08/2026',
      ref: '3536210826',
    })
  })

  it('treats a plain date as deliverDate only', () => {
    expect(splitDateRef('20/08/2026')).toEqual({
      deliverDate: '20/08/2026',
      ref: '',
    })
  })
})

describe('bayDwellMinutes', () => {
  it('computes dwell between time on and time off', () => {
    expect(bayDwellMinutes({ timeOn: '05:45', timeOff: '07:15' })).toBe(90)
  })

  it('returns null when either time is missing', () => {
    expect(bayDwellMinutes({ timeOn: '05:45', timeOff: '' })).toBeNull()
  })
})

describe('tempBand / trailerTempMix / trailerPartialJobs', () => {
  it('classifies sheet temp strings into bands', () => {
    expect(tempBand('FROZEN -20 DEGF')).toBe('frozen')
    expect(tempBand('CHILLED (SET)')).toBe('chilled')
    expect(tempBand('VEG +3 DEGREES')).toBe('veg')
    expect(tempBand('AMBIENT')).toBe('ambient')
  })

  it('summarises temp mix pallet counts for a trailer', () => {
    const trailer = normalizeTrailers(INITIAL_TRAILERS).find(
      (t) => t.id === DEMO_TRAILER_ID.FROZEN_IN,
    )
    const mix = trailerTempMix(trailer)
    expect(mix.frozen + mix.chilled + mix.veg + mix.ambient + mix.other).toBe(
      trailer.jobs.reduce((n, j) => n + j.pallets, 0),
    )
    expect(mix.frozen).toBeGreaterThan(0)
  })

  it('lists partial done pallet sets with numbers', () => {
    const trailer = normalizeTrailers(INITIAL_TRAILERS).find(
      (t) => t.id === DEMO_TRAILER_ID.PARTIAL,
    )
    const hold = findDemoJob([trailer], DEMO_JOB_ID.PARTIAL_HOLD)
    const partials = trailerPartialJobs(trailer)
    expect(
      partials.some(
        (p) => p.jobNo === hold.job.jobNo && p.done === 1 && p.total === 10,
      ),
    ).toBe(true)
    expect(partials.find((p) => p.jobNo === hold.job.jobNo).donePallets).toEqual([1])
  })
})

describe('filterTrailers / load search', () => {
  const trailers = normalizeTrailers(INITIAL_TRAILERS)

  it('finds a load by job number', () => {
    const hold = findDemoJob(trailers, DEMO_JOB_ID.PARTIAL_HOLD)
    const hit = filterTrailers(trailers, { query: hold.job.jobNo })
    expect(hit).toHaveLength(1)
    expect(hit[0].trailer).toBe('IF217')
    expect(hit[0].jobs).toHaveLength(1)
    expect(hit[0].jobs[0].customer).toBe('Harbour Chill Ltd')
  })

  it('finds loads by trailer id', () => {
    const hit = filterTrailers(trailers, { query: 'IF200' })
    expect(hit.some((t) => t.trailer === 'IF200')).toBe(true)
    expect(hit.every((t) => t.jobs.length > 0)).toBe(true)
  })

  it('filters by hold status', () => {
    const hit = filterTrailers(trailers, { status: 'hold' })
    expect(hit.every((t) => t.jobs.every((j) => j.status === 'hold'))).toBe(true)
    expect(countMatchingJobs(trailers, { status: 'hold' })).toBeGreaterThan(0)
  })

  it('filters by frozen temp band', () => {
    const hit = filterTrailers(trailers, { temp: 'frozen' })
    expect(hit.length).toBeGreaterThan(0)
    expect(hit.every((t) => t.jobs.every((j) => tempBand(j.temp) === 'frozen'))).toBe(true)
  })
})

describe('sheet photo OCR matching', () => {
  const trailers = normalizeTrailers(INITIAL_TRAILERS)

  it('extracts job and trailer tokens from OCR text', () => {
    const ocr = findDemoJob(trailers, DEMO_JOB_ID.OCR)
    const tokens = extractSheetTokens(
      `Job No. ${ocr.job.jobNo} Trailer IF200 Deliver AMBERFIELD NORTHBRIDGE`,
    )
    expect(tokens).toEqual(
      expect.arrayContaining([ocr.job.jobNo, 'IF200', 'amberfield', 'northbridge']),
    )
  })

  it('ranks the Northbridge / IF200 load from a sheet OCR sample', () => {
    const matches = matchLoadsFromSheetText(trailers, buildDemoOcrSample(trailers))
    expect(matches.length).toBeGreaterThan(0)
    const ocr = findDemoJob(trailers, DEMO_JOB_ID.OCR)
    expect(matches[0].jobNo).toBe(ocr.job.jobNo)
    expect(matches[0].trailer).toBe('IF200')
    expect(matches[0].query).toBe(ocr.job.jobNo)
  })
})

describe('sheet gap analysis - data presence', () => {
  const jobs = INITIAL_TRAILERS.flatMap((t) => t.jobs)
  const normalized = normalizeTrailers(INITIAL_TRAILERS)

  it('models outbound Order No / Ref 2 on every job', () => {
    expect(jobs.every((j) => typeof j.orderRef === 'string' && j.orderRef.length > 0)).toBe(
      true,
    )
  })

  it('models Ref 3 / Inb Driver on every job', () => {
    expect(jobs.every((j) => typeof j.inbDriver === 'string')).toBe(true)
  })

  it('models Inb Veh/Trl on every job', () => {
    expect(jobs.every((j) => typeof j.inbVeh === 'string')).toBe(true)
  })

  it('splits Deliver Date vs Ref on every job', () => {
    for (const job of jobs) {
      expect(job).toHaveProperty('deliverDate')
      expect(job).toHaveProperty('ref')
      expect(job).not.toHaveProperty('dateRef')
    }
  })

  it('normalizes deliveryWindow on every job', () => {
    for (const trailer of normalized) {
      for (const job of trailer.jobs) {
        expect(typeof job.deliveryWindow).toBe('string')
      }
    }
    const withWindow = normalized.flatMap((t) => t.jobs).filter((j) => j.deliveryWindow)
    expect(withWindow.length).toBeGreaterThan(0)
  })

  it('models bay timing + checker on trailers', () => {
    for (const trailer of normalized) {
      expect(trailer).toHaveProperty('timeOn')
      expect(trailer).toHaveProperty('timeOff')
      expect(trailer).toHaveProperty('startTime')
      expect(trailer).toHaveProperty('bayNo')
      expect(trailer).toHaveProperty('checker')
    }
  })

  it('includes HOLD and COLLECTION special buckets', () => {
    const hold = INITIAL_TRAILERS.find((t) => t.vehicle === 'HOLD')
    const collection = INITIAL_TRAILERS.find((t) => t.vehicle === 'COLLECTION')
    expect(hold?.trailer).toBe('PALLETSHOLD')
    expect(collection?.trailer).toBe('TOCOLLECT')
    expect(isSpecialBucket(hold)).toBe(true)
    expect(isSpecialBucket(collection)).toBe(true)
  })
})
