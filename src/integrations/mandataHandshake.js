/**
 * Stub handshake DTOs for a later Mandata Enterprise TMS join.
 * No HTTP - public docs do not publish an OpenAPI schema.
 * Keys match traffic-office language: job no, vehicle, trailer, work type, bay.
 */

export const MANDATA_SOURCE = 'warehouse-companion'

export function toMandataJobPatch(unit) {
  if (!unit) return null
  return {
    jobNo: String(unit.jobNo ?? ''),
    vehicle: String(unit.vehicle ?? ''),
    trailer: String(unit.trailer ?? ''),
    workType: unit.workType ?? '',
    bayNo: String(unit.bayNo ?? ''),
    goodsTempC: unit.goodsTempC == null ? null : Number(unit.goodsTempC),
    fillPct: unit.fillPct == null ? null : Number(unit.fillPct),
  }
}

export function toMandataAssetTemp(unit) {
  if (!unit) return null
  const zone2Off = unit.zone2Set == null
  return {
    trailer: String(unit.trailer ?? ''),
    zone1: {
      set: unit.zone1Set == null ? null : Number(unit.zone1Set),
      actual: unit.zone1Actual == null ? null : Number(unit.zone1Actual),
    },
    zone2: {
      set: zone2Off ? null : Number(unit.zone2Set),
      actual: zone2Off || unit.zone2Actual == null ? null : Number(unit.zone2Actual),
      off: zone2Off,
    },
  }
}

export function toMandataEvent(yardEvent) {
  if (!yardEvent) return null
  return {
    jobNo: String(yardEvent.jobNo ?? ''),
    at: String(yardEvent.at ?? ''),
    type: String(yardEvent.type ?? ''),
    message: String(yardEvent.message ?? ''),
    source: MANDATA_SOURCE,
  }
}
