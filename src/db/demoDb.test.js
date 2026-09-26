import { describe, expect, it } from 'vitest'
import { DEMO_LOAD_DATE, INITIAL_TRAILERS, INITIAL_YARD_EVENTS, INITIAL_YARD_UNITS } from '../data'
import { DEMO_JOB_ID, findDemoJob } from '../seed/generateDemoDay'
import { loadDemoTrailersFromFile } from './loadDemoTrailersFromFile'

describe('demo.db SQLite source', () => {
  it('loads the same trailer and job counts as the generated demo day', async () => {
    const { trailers, meta } = await loadDemoTrailersFromFile()
    const seedJobs = INITIAL_TRAILERS.reduce((n, t) => n + t.jobs.length, 0)
    const dbJobs = trailers.reduce((n, t) => n + t.jobs.length, 0)

    expect(trailers).toHaveLength(INITIAL_TRAILERS.length)
    expect(dbJobs).toBe(seedJobs)
    expect(meta.load_date).toBe(DEMO_LOAD_DATE)
    expect(meta.source).toMatch(/synthetic/i)
    expect(meta.tms).toBe('mandata-enterprise-stub')
  })

  it('preserves key load fields used by floor and dispatch', async () => {
    const { trailers } = await loadDemoTrailersFromFile()
    const hold = findDemoJob(trailers, DEMO_JOB_ID.PARTIAL_HOLD)

    expect(hold).toBeTruthy()
    expect(hold.trailer.trailer).toBe('IF217')
    expect(hold.job.customer).toBe('Harbour Chill Ltd')
    expect(hold.job.donePallets).toEqual([1])
    expect(hold.job.status).toBe('hold')
  })

  it('includes inbound, outbound, HOLD and COLLECTION buckets', async () => {
    const { trailers } = await loadDemoTrailersFromFile()
    expect(trailers.some((t) => t.direction === 'inbound')).toBe(true)
    expect(trailers.some((t) => t.direction === 'outbound')).toBe(true)
    expect(trailers.some((t) => t.vehicle === 'HOLD')).toBe(true)
    expect(trailers.some((t) => t.vehicle === 'COLLECTION')).toBe(true)
  })

  it('loads yard units and events matching the generated Temps day', async () => {
    const { yardUnits, yardEvents, meta } = await loadDemoTrailersFromFile()
    expect(yardUnits).toHaveLength(INITIAL_YARD_UNITS.length)
    expect(yardEvents).toHaveLength(INITIAL_YARD_EVENTS.length)
    expect(yardUnits.some((u) => u.workType === 'delivery' && u.jobNo)).toBe(true)
    expect(yardUnits.some((u) => u.yardKind === 'parked')).toBe(true)
    expect(meta.tms).toBe('mandata-enterprise-stub')
  })
})
