/**
 * Fictional yard / part-load day for the Temps board.
 * Mandata-shaped keys (job no, vehicle, trailer, work type) plus
 * yard shorthand (PL/FL, parked, twin). No live client data.
 */

import { DEMO_TRAILER_ID } from './generateDemoDay.js'

export const YARD_UNIT_ID = {
  OPEN_330: 'yu-open-330',
  OPEN_210: 'yu-open-210',
  OPEN_370: 'yu-open-370',
  OPEN_280: 'yu-open-280',
  OPEN_289: 'yu-open-289',
  TRANSSHIP: 'yu-transship-233',
  VOR: 'yu-vor-224',
  PARKED_149: 'yu-parked-149',
  PARKED_287: 'yu-parked-287',
  PARKED_311: 'yu-parked-311',
  PARKED_268: 'yu-parked-268',
  PARKED_141: 'yu-parked-141',
}

export const WORK_TYPE = {
  COLLECTION: 'collection',
  DELIVERY: 'delivery',
  TRUNK: 'trunk',
  FULL: 'fullMove',
}

export const YARD_KIND = {
  PART_LOAD: 'partLoad',
  FULL_LOAD: 'fullLoad',
  PARKED: 'parked',
  EMPTY: 'empty',
  VOR: 'vor',
}

export const YARD_STATUS = {
  WAITING: 'waiting',
  ASSIGNED: 'assigned',
  PULLING_DOWN: 'pullingDown',
  AT_SETPOINT: 'atSetpoint',
  PARKED: 'parked',
  TRANSSHIP: 'transship',
  VOR: 'vor',
  EMPTY: 'empty',
}

const DISPATCH = 'Niamh Boyle'
const YARD = 'Aoife Kane'
const YARD_2 = 'Ellen Shaw'
const YARD_3 = 'Mark Quinn'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function yardJobNo(dateStr, seq) {
  const [d, m, y] = dateStr.split('/')
  return `${y.slice(2)}${m}${d}${pad2(80 + seq)}`
}

function atIso(dateStr, hours, minutes) {
  const [d, m, y] = String(dateStr).split('/').map(Number)
  return new Date(y, m - 1, d, hours, minutes, 0).toISOString()
}

function unit(row) {
  return {
    id: row.id,
    jobNo: row.jobNo ?? '',
    vehicle: row.vehicle ?? '',
    trailer: row.trailer ?? '',
    driver: row.driver ?? '',
    trailerId: row.trailerId ?? '',
    workType: row.workType,
    yardKind: row.yardKind,
    twin: Boolean(row.twin),
    bayNo: row.bayNo ?? '',
    fillPct: row.fillPct ?? 0,
    status: row.status,
    goodsTempC: row.goodsTempC ?? null,
    zone1Set: row.zone1Set ?? null,
    zone1Actual: row.zone1Actual ?? null,
    zone2Set: row.zone2Set ?? null,
    zone2Actual: row.zone2Actual ?? null,
    note: row.note ?? '',
  }
}

function event(row) {
  return {
    id: row.id,
    unitId: row.unitId,
    jobNo: row.jobNo ?? '',
    at: row.at,
    role: row.role,
    author: row.author,
    type: row.type,
    replyTo: row.replyTo ?? '',
    message: row.message,
    payload: row.payload ?? null,
  }
}

/**
 * @param {string} [dateStr]
 * @param {object[]} [trailers]
 */
export function generateYardDay(dateStr, trailers = []) {
  const date = dateStr
  const j = (seq) => yardJobNo(date, seq)
  const linked250 = trailers.find((t) => t.id === 't-if250')
  const linked297 = trailers.find((t) => t.id === DEMO_TRAILER_ID.MIXED)

  const units = [
    unit({
      id: YARD_UNIT_ID.OPEN_330,
      jobNo: j(0),
      vehicle: 'FX25UVV',
      trailer: 'IF330',
      driver: 'ELLEN SHAW',
      trailerId: linked250?.id ?? '',
      workType: WORK_TYPE.DELIVERY,
      yardKind: YARD_KIND.PART_LOAD,
      twin: true,
      bayNo: '7',
      fillPct: 100,
      status: YARD_STATUS.PULLING_DOWN,
      goodsTempC: -18,
      zone1Set: -22,
      zone1Actual: 8.4,
      zone2Set: 1,
      zone2Actual: 8.0,
      note: 'Twin pulling down',
    }),
    unit({
      id: YARD_UNIT_ID.OPEN_210,
      jobNo: j(1),
      vehicle: '',
      trailer: '',
      driver: '',
      workType: WORK_TYPE.DELIVERY,
      yardKind: YARD_KIND.PART_LOAD,
      twin: true,
      fillPct: 40,
      status: YARD_STATUS.WAITING,
      goodsTempC: -22,
      zone1Set: -22,
      zone2Set: 1,
      note: 'Need parked twin',
    }),
    unit({
      id: YARD_UNIT_ID.OPEN_370,
      jobNo: j(2),
      vehicle: 'P500IF',
      trailer: 'IF370',
      driver: 'PADRIG MOORE',
      workType: WORK_TYPE.DELIVERY,
      yardKind: YARD_KIND.PART_LOAD,
      twin: false,
      bayNo: '',
      fillPct: 100,
      status: YARD_STATUS.AT_SETPOINT,
      goodsTempC: 3,
      zone1Set: 1,
      zone1Actual: 4,
      zone2Set: null,
      zone2Actual: null,
      note: 'Chill only',
    }),
    unit({
      id: YARD_UNIT_ID.OPEN_280,
      jobNo: j(3),
      vehicle: 'V321IF',
      trailer: 'IF280',
      driver: 'NIAMH BOYLE',
      trailerId: linked297?.id ?? '',
      workType: WORK_TYPE.TRUNK,
      yardKind: YARD_KIND.PART_LOAD,
      twin: false,
      fillPct: 70,
      status: YARD_STATUS.ASSIGNED,
      goodsTempC: -20,
      zone1Set: -22,
      zone1Actual: -20,
      zone2Set: null,
      note: 'Frozen only',
    }),
    unit({
      id: YARD_UNIT_ID.OPEN_289,
      jobNo: j(4),
      vehicle: 'SN26WUE',
      trailer: 'IF289',
      driver: 'MARK QUINN',
      workType: WORK_TYPE.DELIVERY,
      yardKind: YARD_KIND.PART_LOAD,
      twin: true,
      fillPct: 55,
      status: YARD_STATUS.WAITING,
      goodsTempC: -22,
      zone1Set: -22,
      zone2Set: 1,
    }),
    unit({
      id: YARD_UNIT_ID.TRANSSHIP,
      jobNo: j(5),
      vehicle: 'K21IF',
      trailer: 'IF233',
      driver: 'RUTH LENNON',
      workType: WORK_TYPE.TRUNK,
      yardKind: YARD_KIND.PART_LOAD,
      twin: true,
      bayNo: '4',
      fillPct: 80,
      status: YARD_STATUS.TRANSSHIP,
      goodsTempC: -22,
      zone1Set: -22,
      zone1Actual: -21,
      zone2Set: 1,
      zone2Actual: 2,
      note: 'Transship across bays',
    }),
    unit({
      id: YARD_UNIT_ID.VOR,
      jobNo: j(6),
      vehicle: 'V800IF',
      trailer: 'IF224',
      driver: 'AOIFE KANE',
      workType: WORK_TYPE.COLLECTION,
      yardKind: YARD_KIND.VOR,
      twin: false,
      bayNo: '16',
      fillPct: 0,
      status: YARD_STATUS.VOR,
      note: 'VOR - off road',
    }),
    unit({
      id: YARD_UNIT_ID.PARKED_149,
      vehicle: 'N123',
      trailer: 'IF149',
      driver: '',
      workType: WORK_TYPE.FULL,
      yardKind: YARD_KIND.PARKED,
      twin: true,
      status: YARD_STATUS.PARKED,
      zone1Set: -22,
      zone1Actual: -21.5,
      zone2Set: 1,
      zone2Actual: 1.2,
    }),
    unit({
      id: YARD_UNIT_ID.PARKED_287,
      vehicle: 'SN26WUC',
      trailer: 'IF287',
      workType: WORK_TYPE.FULL,
      yardKind: YARD_KIND.PARKED,
      twin: true,
      status: YARD_STATUS.PARKED,
      zone1Set: -22,
      zone1Actual: -22.2,
      zone2Set: 1,
      zone2Actual: 2,
    }),
    unit({
      id: YARD_UNIT_ID.PARKED_311,
      vehicle: 'FX25UVV',
      trailer: 'IF311',
      workType: WORK_TYPE.FULL,
      yardKind: YARD_KIND.PARKED,
      twin: false,
      status: YARD_STATUS.PARKED,
      zone1Set: 3,
      zone1Actual: 3.1,
      zone2Set: null,
    }),
    unit({
      id: YARD_UNIT_ID.PARKED_268,
      vehicle: 'P500IF',
      trailer: 'IF268',
      workType: WORK_TYPE.FULL,
      yardKind: YARD_KIND.PARKED,
      twin: false,
      status: YARD_STATUS.PARKED,
      zone1Set: -22,
      zone1Actual: -19,
      zone2Set: null,
    }),
    unit({
      id: YARD_UNIT_ID.PARKED_141,
      vehicle: 'K21IF',
      trailer: 'IF141',
      workType: WORK_TYPE.FULL,
      yardKind: YARD_KIND.PARKED,
      twin: true,
      status: YARD_STATUS.PARKED,
      bayNo: '21',
      zone1Set: -22,
      zone1Actual: -22,
      zone2Set: 1,
      zone2Actual: 1,
    }),
  ]

  const job330 = units[0].jobNo
  const job210 = units[1].jobNo
  const job370 = units[2].jobNo
  const req330 = 'ye-req-330'
  const req210 = 'ye-req-210'
  const req370 = 'ye-req-370'

  const events = [
    event({
      id: req330,
      unitId: YARD_UNIT_ID.OPEN_330,
      jobNo: job330,
      at: atIso(date, 18, 34),
      role: 'dispatch',
      author: DISPATCH,
      type: 'request',
      message: `${units[0].trailer.replace('IF', '')} PL -22 +1 · anything parked up? Preferably a twin`,
    }),
    event({
      id: 'ye-bay-330',
      unitId: YARD_UNIT_ID.OPEN_330,
      jobNo: job330,
      at: atIso(date, 18, 35),
      role: 'yard',
      author: YARD_3,
      type: 'bay',
      replyTo: req330,
      message: 'Bay 7',
    }),
    event({
      id: 'ye-reefer-330',
      unitId: YARD_UNIT_ID.OPEN_330,
      jobNo: job330,
      at: atIso(date, 18, 36),
      role: 'yard',
      author: YARD,
      type: 'reefer',
      replyTo: req330,
      message: `${units[0].trailer.replace('IF', '')} 100%`,
      payload: {
        zone1Set: -22,
        zone1Actual: 8.4,
        zone2Set: 1,
        zone2Actual: 8.0,
        fillPct: 100,
      },
    }),
    event({
      id: req210,
      unitId: YARD_UNIT_ID.OPEN_210,
      jobNo: job210,
      at: atIso(date, 19, 26),
      role: 'dispatch',
      author: DISPATCH,
      type: 'request',
      message: `Job ${job210} PL -22 · put a parked up trailer on. Preferably a twin`,
    }),
    event({
      id: 'ye-parked-149',
      unitId: YARD_UNIT_ID.PARKED_149,
      jobNo: '',
      at: atIso(date, 18, 36),
      role: 'yard',
      author: YARD,
      type: 'parked',
      message: 'IF149 parked · twin at set',
    }),
    event({
      id: 'ye-parked-287',
      unitId: YARD_UNIT_ID.PARKED_287,
      jobNo: '',
      at: atIso(date, 18, 36),
      role: 'yard',
      author: YARD,
      type: 'parked',
      message: 'IF287 parked · twin',
    }),
    event({
      id: req370,
      unitId: YARD_UNIT_ID.OPEN_370,
      jobNo: job370,
      at: atIso(date, 19, 14),
      role: 'dispatch',
      author: DISPATCH,
      type: 'request',
      message: `Job ${job370} PL chill only`,
    }),
    event({
      id: 'ye-reefer-370',
      unitId: YARD_UNIT_ID.OPEN_370,
      jobNo: job370,
      at: atIso(date, 19, 19),
      role: 'yard',
      author: YARD,
      type: 'reefer',
      replyTo: req370,
      message: `${units[2].trailer.replace('IF', '')} 100%`,
      payload: { zone1Set: 1, zone1Actual: 4, zone2Off: true, fillPct: 100 },
    }),
    event({
      id: 'ye-move-233',
      unitId: YARD_UNIT_ID.TRANSSHIP,
      jobNo: units[5].jobNo,
      at: atIso(date, 19, 30),
      role: 'dispatch',
      author: DISPATCH,
      type: 'move',
      message: 'Transship IF233 onto bay 4',
    }),
    event({
      id: 'ye-vor-224',
      unitId: YARD_UNIT_ID.VOR,
      jobNo: units[6].jobNo,
      at: atIso(date, 19, 29),
      role: 'yard',
      author: YARD_2,
      type: 'move',
      message: 'IF224 VOR',
    }),
  ]

  events.sort((a, b) => new Date(b.at) - new Date(a.at))
  return { loadDate: date, units, events }
}

export function isParkedUnit(unit) {
  return unit.status === YARD_STATUS.PARKED || unit.yardKind === YARD_KIND.PARKED
}

export function isOpenLoad(unit) {
  return !isParkedUnit(unit) && unit.status !== YARD_STATUS.EMPTY
}
