import { describe, expect, it } from 'vitest'
import {
  MANDATA_SOURCE,
  toMandataAssetTemp,
  toMandataEvent,
  toMandataJobPatch,
} from './mandataHandshake'
import { generateYardDay, YARD_UNIT_ID } from '../seed/generateYardDay'

describe('mandataHandshake stub DTO', () => {
  const { units, events } = generateYardDay('22/08/2026')
  const open = units.find((u) => u.id === YARD_UNIT_ID.OPEN_330)
  const parked = units.find((u) => u.id === YARD_UNIT_ID.PARKED_311)
  const ev = events.find((e) => e.unitId === YARD_UNIT_ID.OPEN_330 && e.type === 'request')

  it('maps a job patch with Mandata traffic-office keys', () => {
    expect(toMandataJobPatch(open)).toEqual({
      jobNo: open.jobNo,
      vehicle: open.vehicle,
      trailer: open.trailer,
      workType: open.workType,
      bayNo: open.bayNo,
      goodsTempC: open.goodsTempC,
      fillPct: open.fillPct,
    })
  })

  it('maps reefer asset temps with zone 2 off when unset', () => {
    const asset = toMandataAssetTemp(open)
    expect(asset.trailer).toBe('IF330')
    expect(asset.zone1).toEqual({ set: -22, actual: 8.4 })
    expect(asset.zone2.off).toBe(false)
    expect(toMandataAssetTemp(parked).zone2.off).toBe(true)
  })

  it('maps events with warehouse-companion source and no HTTP fields', () => {
    const dto = toMandataEvent(ev)
    expect(dto).toEqual({
      jobNo: ev.jobNo,
      at: ev.at,
      type: 'request',
      message: ev.message,
      source: MANDATA_SOURCE,
    })
    expect(dto).not.toHaveProperty('url')
    expect(dto).not.toHaveProperty('endpoint')
  })

  it('returns null for missing records', () => {
    expect(toMandataJobPatch(null)).toBeNull()
    expect(toMandataAssetTemp(undefined)).toBeNull()
    expect(toMandataEvent(null)).toBeNull()
  })
})
