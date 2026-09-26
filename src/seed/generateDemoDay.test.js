import { describe, expect, it } from 'vitest'
import {
  DEMO_JOB_ID,
  DEMO_TRAILER_ID,
  buildDemoOcrSample,
  findDemoJob,
  generateDemoDay,
  todaySheetDate,
} from './generateDemoDay'

const LIVE_CLIENT =
  /kerry|gilfresh|western brand|clonakilty|staunton|mallon|henderson|pinkerton|flamewood|ashlee|mckee|hegedus|finnebrogue|sykes|carroll/i

describe('generateDemoDay', () => {
  it('builds inbound and outbound sheets for a given date', () => {
    const { loadDate, trailers } = generateDemoDay('22/08/2026')
    expect(loadDate).toBe('22/08/2026')
    expect(trailers.some((t) => t.direction === 'inbound')).toBe(true)
    expect(trailers.some((t) => t.direction === 'outbound')).toBe(true)
    expect(trailers.some((t) => t.id === DEMO_TRAILER_ID.HOLD)).toBe(true)
    expect(trailers.some((t) => t.id === DEMO_TRAILER_ID.COLLECT)).toBe(true)
  })

  it('is deterministic for the same sheet date', () => {
    const a = generateDemoDay('22/08/2026')
    const b = generateDemoDay('22/08/2026')
    expect(a.trailers).toEqual(b.trailers)
  })

  it('changes job numbers when the day changes', () => {
    const a = findDemoJob(generateDemoDay('22/08/2026').trailers, DEMO_JOB_ID.OCR)
    const b = findDemoJob(generateDemoDay('23/08/2026').trailers, DEMO_JOB_ID.OCR)
    expect(a.job.jobNo).not.toBe(b.job.jobNo)
  })

  it('does not include live client names', () => {
    const { trailers } = generateDemoDay()
    const blob = JSON.stringify(trailers)
    expect(blob).not.toMatch(LIVE_CLIENT)
  })

  it('uses IceFast branding and IF fleet codes, not legacy client marks', () => {
    const { trailers } = generateDemoDay('22/08/2026')
    const sample = buildDemoOcrSample(trailers)
    const blob = JSON.stringify(trailers)
    expect(sample).toMatch(/ICEFAST WAREHOUSE/)
    expect(sample).not.toMatch(/DERRY\s*TRANSPORT/i)
    expect(blob).not.toMatch(/\bDRT\d/i)
    expect(blob).toMatch(/\bIF200\b/)
  })

  it('builds an OCR sample that names the IF200 demo load', () => {
    const { trailers } = generateDemoDay('22/08/2026')
    const sample = buildDemoOcrSample(trailers)
    const ocr = findDemoJob(trailers, DEMO_JOB_ID.OCR)
    expect(sample).toContain('IF200')
    expect(sample).toContain(ocr.job.customer)
    expect(sample).toContain(ocr.job.jobNo)
  })

  it('defaults to today', () => {
    expect(generateDemoDay().loadDate).toBe(todaySheetDate())
  })
})
