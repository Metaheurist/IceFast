import { describe, expect, it } from 'vitest'
import { generateDemoDay } from './generateDemoDay'
import {
  YARD_KIND,
  YARD_STATUS,
  YARD_UNIT_ID,
  generateYardDay,
  isOpenLoad,
  isParkedUnit,
} from './generateYardDay'

/** Live clients plus WhatsApp identities from the original part-load group shots. */
const BANNED_LIVE_NAMES =
  /kerry|gilfresh|western brand|clonakilty|staunton|mallon|henderson|pinkerton|flamewood|ashlee|mckee|hegedus|finnebrogue|sykes|carroll/i

describe('generateYardDay', () => {
  it('builds open loads and a parked pool for a given date', () => {
    const { trailers } = generateDemoDay('22/08/2026')
    const { loadDate, units, events } = generateYardDay('22/08/2026', trailers)

    expect(loadDate).toBe('22/08/2026')
    expect(units.some(isOpenLoad)).toBe(true)
    expect(units.some(isParkedUnit)).toBe(true)
    expect(units.some((u) => u.id === YARD_UNIT_ID.OPEN_210 && !u.trailer)).toBe(true)
    expect(units.some((u) => u.id === YARD_UNIT_ID.PARKED_149 && u.twin)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })

  it('keys open loads with Mandata job / work type fields', () => {
    const { units } = generateYardDay('22/08/2026')
    const open = units.find((u) => u.id === YARD_UNIT_ID.OPEN_330)

    expect(open.jobNo).toMatch(/^\d{8}$/)
    expect(open.vehicle).toBe('FX25UVV')
    expect(open.trailer).toBe('IF330')
    expect(open.workType).toBe('delivery')
    expect(open.yardKind).toBe(YARD_KIND.PART_LOAD)
    expect(open.bayNo).toBe('7')
    expect(open.goodsTempC).toBe(-18)
    expect(open.zone1Set).toBe(-22)
    expect(open.zone2Set).toBe(1)
    expect(open.status).toBe(YARD_STATUS.PULLING_DOWN)
  })

  it('is deterministic for the same sheet date', () => {
    expect(generateYardDay('22/08/2026')).toEqual(generateYardDay('22/08/2026'))
  })

  it('does not include live client, driver, or WhatsApp identities', () => {
    const { trailers } = generateDemoDay('22/08/2026')
    const day = generateYardDay('22/08/2026', trailers)
    expect(JSON.stringify({ trailers, yard: day })).not.toMatch(BANNED_LIVE_NAMES)
  })
})
