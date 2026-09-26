import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from './AppContext'
import { DEMO_LOAD_DATE, INITIAL_TRAILERS, STATUS, doneCount } from './data'
import { DEMO_JOB_ID, DEMO_TRAILER_ID } from './seed/generateDemoDay'
import { YARD_UNIT_ID } from './seed/generateYardDay'

function wrapper({ children }) {
  return <AppProvider seedTrailers={INITIAL_TRAILERS}>{children}</AppProvider>
}

function findJob(result, trailerId, jobId) {
  return result.current.trailers
    .find((t) => t.id === trailerId)
    ?.jobs.find((j) => j.id === jobId)
}

describe('AppProvider / useApp', () => {
  it('throws when useApp is used outside provider', () => {
    expect(() => renderHook(() => useApp())).toThrow(
      /useApp must be used within AppProvider/,
    )
  })

  it('seeds trailers and a notes/hold feed', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.trailers.length).toBeGreaterThan(0)
    expect(result.current.feed.length).toBeGreaterThan(0)
    expect(result.current.view).toBe('floor')
    expect(result.current.loadDate).toBe(DEMO_LOAD_DATE)
    expect(result.current.feed.some((f) => f.type === 'note')).toBe(true)
  })

  it('switches view and direction filter', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => {
      result.current.setView('dashboard')
      result.current.setDirectionFilter('inbound')
    })
    expect(result.current.view).toBe('dashboard')
    expect(result.current.directionFilter).toBe('inbound')
  })

  it('cycles job status and appends a status feed item', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.MIXED
    const jobId = DEMO_JOB_ID.PENDING
    const before = findJob(result, trailerId, jobId)
    expect(before.status).toBe(STATUS.PENDING)

    act(() => {
      result.current.cycleJobStatus(trailerId, jobId)
    })

    const after = findJob(result, trailerId, jobId)
    expect(after.status).toBe(STATUS.LOADED)
    expect(doneCount(after)).toBe(after.pallets)
    expect(result.current.feed[0].type).toBe('status')
    expect(result.current.feed[0].jobId).toBe(jobId)
    expect(result.current.feed[0].message).toMatch(/Marked Loaded/)
  })

  it('preserves partial progress when cycling to Hold', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.PARTIAL
    const jobId = DEMO_JOB_ID.PARTIAL_HOLD

    act(() => {
      result.current.setJobDoneCount(trailerId, jobId, 1)
      result.current.markJobHold(trailerId, jobId)
    })

    const job = findJob(result, trailerId, jobId)
    expect(job.status).toBe(STATUS.HOLD)
    expect(job.donePallets).toEqual([1])
    expect(result.current.feed[0].message).toMatch(/Hold with 1\/10/)
  })

  it('toggles individual pallets out of order and syncs progress feed', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.MIXED
    const jobId = DEMO_JOB_ID.SIX

    act(() => {
      result.current.toggleJobPallet(trailerId, jobId, 4)
      result.current.toggleJobPallet(trailerId, jobId, 1)
    })

    const job = findJob(result, trailerId, jobId)
    expect(job.donePallets).toEqual([1, 4])
    expect(result.current.feed[0].type).toBe('progress')
    expect(result.current.feed[0].message).toMatch(/Pallet 1 done/)
    expect(result.current.feed[0].done).toBe(2)
  })

  it('unmarks a pallet via toggle', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.PARTIAL
    const jobId = DEMO_JOB_ID.PARTIAL_HOLD

    act(() => {
      result.current.toggleJobPallet(trailerId, jobId, 1)
    })

    const job = findJob(result, trailerId, jobId)
    expect(job.donePallets).toEqual([])
    expect(result.current.feed[0].message).toMatch(/unmarked/)
  })

  it('setJobDoneCount clamps and auto-loads when complete', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.MIXED
    const jobId = DEMO_JOB_ID.SIX

    act(() => {
      result.current.setJobDoneCount(trailerId, jobId, 99)
    })

    let job = findJob(result, trailerId, jobId)
    expect(doneCount(job)).toBe(6)
    expect(job.status).toBe(STATUS.LOADED)

    act(() => {
      result.current.setJobDoneCount(trailerId, jobId, -5)
    })

    job = findJob(result, trailerId, jobId)
    expect(doneCount(job)).toBe(0)
  })

  it('keeps Hold when setting a partial done count on a held job', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.PARTIAL
    const jobId = DEMO_JOB_ID.PARTIAL_HOLD

    act(() => {
      result.current.setJobDoneCount(trailerId, jobId, 3)
    })

    const job = findJob(result, trailerId, jobId)
    expect(job.status).toBe(STATUS.HOLD)
    expect(job.donePallets).toEqual([1, 2, 3])
    expect(result.current.feed[0].message).toMatch(/on hold/)
  })

  it('saves notes and syncs them to the live feed (messaging replacement)', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.OCR
    const jobId = DEMO_JOB_ID.OCR

    act(() => {
      result.current.saveJobNote(trailerId, jobId, '  Damaged wrap - photo taken  ')
    })

    const job = findJob(result, trailerId, jobId)
    expect(job.note).toBe('Damaged wrap - photo taken')
    expect(result.current.feed[0].type).toBe('note')
    expect(result.current.feed[0].message).toBe('Damaged wrap - photo taken')
    expect(result.current.feed[0].trailerLabel).toContain('IF200')
  })

  it('does not push a feed item for blank notes', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const beforeLen = result.current.feed.length
    const trailerId = DEMO_TRAILER_ID.OCR
    const jobId = DEMO_JOB_ID.OCR

    act(() => {
      result.current.saveJobNote(trailerId, jobId, '   ')
    })

    expect(findJob(result, trailerId, jobId).note).toBe('')
    expect(result.current.feed.length).toBe(beforeLen)
  })

  it('ignores unknown trailer/job ids safely', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const snapshot = structuredClone(result.current.trailers)

    act(() => {
      result.current.cycleJobStatus('missing', 'missing')
      result.current.toggleJobPallet('missing', 'missing', 1)
      result.current.setJobDoneCount('missing', 'missing', 2)
      result.current.markJobHold('missing', 'missing')
      result.current.saveJobNote('missing', 'missing', 'x')
      result.current.updateTrailerMeta('missing', { checker: 'X' })
    })

    expect(result.current.trailers).toEqual(snapshot)
  })

  it('captures checker and time on/off for bay dwell', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const trailerId = DEMO_TRAILER_ID.MIXED

    act(() => {
      result.current.updateTrailerMeta(trailerId, {
        checker: 'A. TEST',
        timeOn: '06:00',
        timeOff: '07:30',
      })
    })

    const trailer = result.current.trailers.find((t) => t.id === trailerId)
    expect(trailer.checker).toBe('A. TEST')
    expect(trailer.timeOn).toBe('06:00')
    expect(trailer.timeOff).toBe('07:30')
    expect(result.current.feed[0].type).toBe('bay')
    expect(result.current.feed[0].message).toMatch(/Checker/)
  })

  it('includes lineage fields on feed items', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => {
      result.current.saveJobNote(DEMO_TRAILER_ID.OCR, DEMO_JOB_ID.OCR, 'Lineage check')
    })
    expect(result.current.feed[0].orderRef).toBe('PO-NORTH-01')
    expect(result.current.feed[0].inbDriver).toBe('AK')
    expect(result.current.feed[0].inbVeh).toContain('IF200')
  })

  it('assigns a parked trailer onto an open load and records a handshake DTO', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const beforeLoad = result.current.yardUnits.find((u) => u.id === YARD_UNIT_ID.OPEN_210)
    expect(beforeLoad.trailer).toBe('')

    act(() => {
      result.current.assignParked(YARD_UNIT_ID.PARKED_149, YARD_UNIT_ID.OPEN_210)
    })

    const load = result.current.yardUnits.find((u) => u.id === YARD_UNIT_ID.OPEN_210)
    const parked = result.current.yardUnits.find((u) => u.id === YARD_UNIT_ID.PARKED_149)
    expect(load.trailer).toBe('IF149')
    expect(load.vehicle).toBe('N123')
    expect(load.twin).toBe(true)
    expect(load.status).toBe('assigned')
    expect(parked.status).toBe('empty')
    expect(result.current.yardEvents[0].type).toBe('move')
    expect(result.current.lastHandshake.job).toMatchObject({
      jobNo: load.jobNo,
      trailer: 'IF149',
      vehicle: 'N123',
      workType: 'delivery',
    })
    expect(result.current.lastHandshake.asset.trailer).toBe('IF149')
    expect(result.current.lastHandshake.event.source).toBe('warehouse-companion')
  })

  it('logs goods temp without mixing reefer zones into the job patch', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    const before = result.current.yardUnits.find((u) => u.id === YARD_UNIT_ID.OPEN_330)

    act(() => {
      result.current.logGoodsTemp(YARD_UNIT_ID.OPEN_330, -19)
    })

    const after = result.current.yardUnits.find((u) => u.id === YARD_UNIT_ID.OPEN_330)
    expect(after.goodsTempC).toBe(-19)
    expect(after.zone1Actual).toBe(before.zone1Actual)
    expect(after.zone2Actual).toBe(before.zone2Actual)
    expect(result.current.lastHandshake.job.goodsTempC).toBe(-19)
    expect(result.current.lastHandshake.asset.zone1).toEqual({
      set: before.zone1Set,
      actual: before.zone1Actual,
    })
  })

  it('refreshData reloads seed sheets and updates last sync', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useApp(), { wrapper })

    act(() => {
      result.current.saveJobNote(DEMO_TRAILER_ID.OCR, DEMO_JOB_ID.OCR, 'Temporary floor note')
    })
    expect(findJob(result, DEMO_TRAILER_ID.OCR, DEMO_JOB_ID.OCR).note).toBe(
      'Temporary floor note',
    )

    act(() => {
      result.current.refreshData()
    })
    expect(result.current.isRefreshing).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isRefreshing).toBe(false)
    expect(findJob(result, DEMO_TRAILER_ID.OCR, DEMO_JOB_ID.OCR).note).toBe(
      'Damaged wrap on top pallet - photo taken',
    )
    expect(result.current.lastSyncedAt).toBeTruthy()
    vi.useRealTimers()
  })
})
