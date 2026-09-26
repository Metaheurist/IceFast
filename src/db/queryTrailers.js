import { normalizeTrailers } from '../data'

function rowsToObjects(result) {
  if (!result?.length) return []
  const { columns, values } = result[0]
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]])),
  )
}

function parseDonePallets(raw) {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

/** Map open SQLite db → trailer/job objects used by the demo UI */
export function queryTrailersFromDb(db) {
  const trailerRows = rowsToObjects(
    db.exec(`
      SELECT id, direction, vehicle, trailer, driver,
             bay_no, start_time, time_on, time_off, checker, sort_order
      FROM trailers
      ORDER BY sort_order ASC
    `),
  )

  const jobRows = rowsToObjects(
    db.exec(`
      SELECT id, trailer_id, pallets, temp, customer, job_no,
             collect_from, collect_town, deliver_to, deliver_town,
             delivery_window, deliver_date, ref, order_ref,
             inb_driver, inb_veh, status, note, done_pallets_json, sort_order
      FROM jobs
      ORDER BY sort_order ASC
    `),
  )

  const jobsByTrailer = new Map()
  for (const row of jobRows) {
    const list = jobsByTrailer.get(row.trailer_id) ?? []
    const donePallets = parseDonePallets(row.done_pallets_json)
    list.push({
      id: row.id,
      pallets: row.pallets,
      temp: row.temp,
      customer: row.customer,
      jobNo: row.job_no,
      collectFrom: row.collect_from,
      collectTown: row.collect_town,
      deliverTo: row.deliver_to,
      deliverTown: row.deliver_town,
      deliveryWindow: row.delivery_window || undefined,
      deliverDate: row.deliver_date,
      ref: row.ref,
      orderRef: row.order_ref,
      inbDriver: row.inb_driver,
      inbVeh: row.inb_veh,
      status: row.status,
      note: row.note,
      ...(donePallets && donePallets.length > 0 ? { donePallets } : {}),
    })
    jobsByTrailer.set(row.trailer_id, list)
  }

  return normalizeTrailers(
    trailerRows.map((row) => ({
      id: row.id,
      direction: row.direction,
      vehicle: row.vehicle,
      trailer: row.trailer,
      driver: row.driver,
      bayNo: row.bay_no,
      startTime: row.start_time,
      timeOn: row.time_on,
      timeOff: row.time_off,
      checker: row.checker,
      jobs: jobsByTrailer.get(row.id) ?? [],
    })),
  )
}

export function queryMetaFromDb(db) {
  const rows = rowsToObjects(db.exec(`SELECT key, value FROM meta`))
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

function parsePayload(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function nullableNum(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function queryYardUnitsFromDb(db) {
  const rows = rowsToObjects(
    db.exec(`
      SELECT id, job_no, vehicle, trailer, driver, trailer_id,
             work_type, yard_kind, twin, bay_no, fill_pct, status,
             goods_temp_c, zone1_set, zone1_actual, zone2_set, zone2_actual,
             note, sort_order
      FROM yard_units
      ORDER BY sort_order ASC
    `),
  )
  return rows.map((row) => ({
    id: row.id,
    jobNo: row.job_no,
    vehicle: row.vehicle,
    trailer: row.trailer,
    driver: row.driver,
    trailerId: row.trailer_id,
    workType: row.work_type,
    yardKind: row.yard_kind,
    twin: Boolean(row.twin),
    bayNo: row.bay_no,
    fillPct: Number(row.fill_pct) || 0,
    status: row.status,
    goodsTempC: nullableNum(row.goods_temp_c),
    zone1Set: nullableNum(row.zone1_set),
    zone1Actual: nullableNum(row.zone1_actual),
    zone2Set: nullableNum(row.zone2_set),
    zone2Actual: nullableNum(row.zone2_actual),
    note: row.note,
  }))
}

export function queryYardEventsFromDb(db) {
  const rows = rowsToObjects(
    db.exec(`
      SELECT id, unit_id, job_no, at, role, author, type, reply_to, message, payload_json, sort_order
      FROM yard_events
      ORDER BY sort_order ASC
    `),
  )
  return rows.map((row) => ({
    id: row.id,
    unitId: row.unit_id,
    jobNo: row.job_no,
    at: row.at,
    role: row.role,
    author: row.author,
    type: row.type,
    replyTo: row.reply_to,
    message: row.message,
    payload: parsePayload(row.payload_json),
  }))
}
