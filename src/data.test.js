import { describe, expect, it } from 'vitest'
import {
  INITIAL_TRAILERS,
  STATUS,
  STATUS_CYCLE,
  allPalletNos,
  applyStatusChange,
  doneCount,
  nextStatus,
  normalizeTrailers,
  remainingPallets,
  syncStatusFromProgress,
  toggleDonePallet,
  trailerTotals,
} from './data'
import { DEMO_JOB_ID, findDemoJob } from './seed/generateDemoDay'

function job(overrides = {}) {
  return {
    id: 'j-test',
    pallets: 10,
    temp: 'CHILLED (SET)',
    customer: 'Test Customer',
    jobNo: '9990001',
    collectFrom: 'A',
    collectTown: 'TOWN',
    deliverTo: 'B',
    deliverTown: 'CITY',
    deliverDate: '20/08/2026',
    ref: '',
    orderRef: 'ORD-1',
    inbDriver: 'SM',
    inbVeh: 'V800IF / IF200',
    status: STATUS.PENDING,
    note: '',
    donePallets: [],
    ...overrides,
  }
}

describe('nextStatus', () => {
  it('cycles Pending → Loaded → Hold → Pending', () => {
    expect(nextStatus(STATUS.PENDING)).toBe(STATUS.LOADED)
    expect(nextStatus(STATUS.LOADED)).toBe(STATUS.HOLD)
    expect(nextStatus(STATUS.HOLD)).toBe(STATUS.PENDING)
  })

  it('covers the full STATUS_CYCLE', () => {
    expect(STATUS_CYCLE).toEqual([STATUS.PENDING, STATUS.LOADED, STATUS.HOLD])
  })
})

describe('allPalletNos / doneCount / remainingPallets', () => {
  it('builds 1-based pallet numbers', () => {
    expect(allPalletNos(0)).toEqual([])
    expect(allPalletNos(3)).toEqual([1, 2, 3])
  })

  it('counts done pallets safely when missing', () => {
    expect(doneCount({})).toBe(0)
    expect(doneCount(job({ donePallets: [1, 4, 7] }))).toBe(3)
  })

  it('lists remaining pallets for a partial set (e.g. 1/10 done)', () => {
    const partial = job({ donePallets: [1], status: STATUS.HOLD })
    expect(doneCount(partial)).toBe(1)
    expect(remainingPallets(partial)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

describe('applyStatusChange', () => {
  it('marks all pallets done when status becomes Loaded', () => {
    const result = applyStatusChange(job({ donePallets: [1] }), STATUS.LOADED)
    expect(result.status).toBe(STATUS.LOADED)
    expect(result.donePallets).toEqual(allPalletNos(10))
  })

  it('clears pallet progress when reset to Pending', () => {
    const result = applyStatusChange(
      job({ status: STATUS.LOADED, donePallets: allPalletNos(10) }),
      STATUS.PENDING,
    )
    expect(result.status).toBe(STATUS.PENDING)
    expect(result.donePallets).toEqual([])
  })

  it('keeps partial progress when marked Hold (1/10 done + hold)', () => {
    const result = applyStatusChange(
      job({ donePallets: [1], status: STATUS.PENDING }),
      STATUS.HOLD,
    )
    expect(result.status).toBe(STATUS.HOLD)
    expect(result.donePallets).toEqual([1])
    expect(doneCount(result)).toBe(1)
  })
})

describe('syncStatusFromProgress', () => {
  it('sets Loaded when all pallets are done', () => {
    const result = syncStatusFromProgress(
      job({ donePallets: allPalletNos(10), status: STATUS.PENDING }),
    )
    expect(result.status).toBe(STATUS.LOADED)
  })

  it('keeps Pending for partial progress', () => {
    const result = syncStatusFromProgress(job({ donePallets: [1, 2] }))
    expect(result.status).toBe(STATUS.PENDING)
  })

  it('keeps Hold for partial progress when already on hold', () => {
    const result = syncStatusFromProgress(
      job({ donePallets: [1], status: STATUS.HOLD }),
    )
    expect(result.status).toBe(STATUS.HOLD)
  })

  it('promotes Hold to Loaded once set is complete', () => {
    const result = syncStatusFromProgress(
      job({ donePallets: allPalletNos(10), status: STATUS.HOLD }),
    )
    expect(result.status).toBe(STATUS.LOADED)
  })
})

describe('toggleDonePallet', () => {
  it('marks and unmarks a specific pallet number', () => {
    const afterMark = toggleDonePallet(job(), 3)
    expect(afterMark.donePallets).toEqual([3])
    const afterUnmark = toggleDonePallet(afterMark, 3)
    expect(afterUnmark.donePallets).toEqual([])
  })

  it('keeps Hold when toggling within a partial set', () => {
    const held = job({ status: STATUS.HOLD, donePallets: [1] })
    const after = toggleDonePallet(held, 2)
    expect(after.status).toBe(STATUS.HOLD)
    expect(after.donePallets).toEqual([1, 2])
  })

  it('auto-completes to Loaded when last pallet is marked', () => {
    const almost = job({
      status: STATUS.HOLD,
      donePallets: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    })
    const after = toggleDonePallet(almost, 10)
    expect(after.status).toBe(STATUS.LOADED)
    expect(after.donePallets).toEqual(allPalletNos(10))
  })

  it('supports out-of-order pallet loading', () => {
    let current = job()
    current = toggleDonePallet(current, 7)
    current = toggleDonePallet(current, 2)
    current = toggleDonePallet(current, 10)
    expect(current.donePallets).toEqual([2, 7, 10])
    expect(current.status).toBe(STATUS.PENDING)
  })
})

describe('trailerTotals', () => {
  it('sums pallet progress including partial hold sets', () => {
    const trailer = {
      id: 't1',
      jobs: [
        job({ pallets: 10, donePallets: [1], status: STATUS.HOLD }),
        job({
          id: 'j2',
          pallets: 5,
          donePallets: allPalletNos(5),
          status: STATUS.LOADED,
        }),
        job({ id: 'j3', pallets: 2, donePallets: [], status: STATUS.PENDING }),
      ],
    }
    const totals = trailerTotals(trailer)
    expect(totals.total).toBe(17)
    expect(totals.loaded).toBe(6) // 1 + 5
    expect(totals.hold).toBe(9) // 10 - 1 remaining on hold
    expect(totals.pending).toBe(2)
    expect(totals.jobLoaded).toBe(1)
    expect(totals.jobPartial).toBe(1)
    expect(totals.jobCount).toBe(3)
  })
})

describe('normalizeTrailers', () => {
  it('seeds donePallets from Loaded status', () => {
    const [trailer] = normalizeTrailers([
      {
        id: 't',
        jobs: [
          {
            id: 'j',
            pallets: 3,
            status: STATUS.LOADED,
          },
        ],
      },
    ])
    expect(trailer.jobs[0].donePallets).toEqual([1, 2, 3])
  })

  it('preserves explicit donePallets arrays', () => {
    const [trailer] = normalizeTrailers([
      {
        id: 't',
        jobs: [job({ status: STATUS.HOLD, donePallets: [1] })],
      },
    ])
    expect(trailer.jobs[0].donePallets).toEqual([1])
  })

  it('defaults pending jobs to empty donePallets', () => {
    const [trailer] = normalizeTrailers([
      {
        id: 't',
        jobs: [{ id: 'j', pallets: 4, status: STATUS.PENDING }],
      },
    ])
    expect(trailer.jobs[0].donePallets).toEqual([])
  })
})

describe('demo data model coverage', () => {
  const allJobs = INITIAL_TRAILERS.flatMap((t) =>
    t.jobs.map((j) => ({ trailer: t, job: j })),
  )

  it('includes outbound lineage fields used on paper sheets', () => {
    for (const { job: j } of allJobs) {
      expect(j).toHaveProperty('deliverDate')
      expect(j).toHaveProperty('ref')
      expect(j).toHaveProperty('orderRef')
      expect(j).toHaveProperty('inbDriver')
      expect(j).toHaveProperty('inbVeh')
      expect(j).toHaveProperty('jobNo')
      expect(j).toHaveProperty('temp')
      expect(j).toHaveProperty('collectFrom')
      expect(j).toHaveProperty('deliverTo')
    }
  })

  it('includes trailer header fields from outbound/inbound sheets', () => {
    for (const trailer of INITIAL_TRAILERS) {
      expect(trailer).toHaveProperty('vehicle')
      expect(trailer).toHaveProperty('trailer')
      expect(trailer).toHaveProperty('driver')
      expect(trailer).toHaveProperty('bayNo')
      expect(trailer).toHaveProperty('startTime')
      expect(trailer).toHaveProperty('timeOn')
      expect(trailer).toHaveProperty('timeOff')
      expect(trailer).toHaveProperty('checker')
      expect(['inbound', 'outbound']).toContain(trailer.direction)
    }
  })

  it('includes demo fleet routes and special buckets', () => {
    const labels = INITIAL_TRAILERS.map((t) => `${t.vehicle}/${t.trailer}`)
    expect(labels).toContain('V800IF/IF200')
    expect(labels).toContain('V321IF/IF297')
    expect(labels).toContain('HOLD/PALLETSHOLD')
    expect(labels).toContain('COLLECTION/TOCOLLECT')
  })

  it('seeds a 1/10 hold example for partial pallet logging', () => {
    const hold = findDemoJob(INITIAL_TRAILERS, DEMO_JOB_ID.PARTIAL_HOLD)
    expect(hold).toBeTruthy()
    expect(hold.job.pallets).toBe(10)
    expect(hold.job.donePallets).toEqual([1])
    expect(hold.job.status).toBe(STATUS.HOLD)
  })

  it('normalizes INITIAL_TRAILERS without dropping jobs', () => {
    const normalized = normalizeTrailers(INITIAL_TRAILERS)
    const before = INITIAL_TRAILERS.reduce((n, t) => n + t.jobs.length, 0)
    const after = normalized.reduce((n, t) => n + t.jobs.length, 0)
    expect(after).toBe(before)
    expect(normalized.every((t) => t.jobs.every((j) => Array.isArray(j.donePallets)))).toBe(
      true,
    )
  })
})
