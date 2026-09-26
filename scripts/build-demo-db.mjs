/**
 * Builds public/demo.db (SQLite) from a fresh fictional inbound/outbound day.
 * Runs on every local demo start (`npm run dev` → predev).
 * Override the sheet date with DEMO_LOAD_DATE=DD/MM/YYYY.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs from 'sql.js'
import { generateDemoDay, todaySheetDate } from '../src/seed/generateDemoDay.js'
import { generateYardDay } from '../src/seed/generateYardDay.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public')
const outFile = join(outDir, 'demo.db')
const sqlDist = join(root, 'node_modules', 'sql.js', 'dist')
const wasmPath = join(sqlDist, 'sql-wasm.wasm')

const SQL = await initSqlJs({ wasmBinary: readFileSync(wasmPath) })
const db = new SQL.Database()

db.run(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE trailers (
    id TEXT PRIMARY KEY,
    direction TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    trailer TEXT NOT NULL,
    driver TEXT NOT NULL,
    bay_no TEXT NOT NULL DEFAULT '',
    start_time TEXT NOT NULL DEFAULT '',
    time_on TEXT NOT NULL DEFAULT '',
    time_off TEXT NOT NULL DEFAULT '',
    checker TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    trailer_id TEXT NOT NULL REFERENCES trailers(id) ON DELETE CASCADE,
    pallets INTEGER NOT NULL,
    temp TEXT NOT NULL DEFAULT '',
    customer TEXT NOT NULL DEFAULT '',
    job_no TEXT NOT NULL DEFAULT '',
    collect_from TEXT NOT NULL DEFAULT '',
    collect_town TEXT NOT NULL DEFAULT '',
    deliver_to TEXT NOT NULL DEFAULT '',
    deliver_town TEXT NOT NULL DEFAULT '',
    delivery_window TEXT NOT NULL DEFAULT '',
    deliver_date TEXT NOT NULL DEFAULT '',
    ref TEXT NOT NULL DEFAULT '',
    order_ref TEXT NOT NULL DEFAULT '',
    inb_driver TEXT NOT NULL DEFAULT '',
    inb_veh TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    note TEXT NOT NULL DEFAULT '',
    done_pallets_json TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL
  );

  CREATE INDEX idx_jobs_trailer ON jobs(trailer_id);
  CREATE INDEX idx_jobs_job_no ON jobs(job_no);
  CREATE INDEX idx_jobs_customer ON jobs(customer);

  CREATE TABLE yard_units (
    id TEXT PRIMARY KEY,
    job_no TEXT NOT NULL DEFAULT '',
    vehicle TEXT NOT NULL DEFAULT '',
    trailer TEXT NOT NULL DEFAULT '',
    driver TEXT NOT NULL DEFAULT '',
    trailer_id TEXT NOT NULL DEFAULT '',
    work_type TEXT NOT NULL,
    yard_kind TEXT NOT NULL,
    twin INTEGER NOT NULL DEFAULT 0,
    bay_no TEXT NOT NULL DEFAULT '',
    fill_pct INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    goods_temp_c REAL,
    zone1_set REAL,
    zone1_actual REAL,
    zone2_set REAL,
    zone2_actual REAL,
    note TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE yard_events (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES yard_units(id) ON DELETE CASCADE,
    job_no TEXT NOT NULL DEFAULT '',
    at TEXT NOT NULL,
    role TEXT NOT NULL,
    author TEXT NOT NULL,
    type TEXT NOT NULL,
    reply_to TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL
  );

  CREATE INDEX idx_yard_units_job ON yard_units(job_no);
  CREATE INDEX idx_yard_units_trailer ON yard_units(trailer);
  CREATE INDEX idx_yard_events_unit ON yard_events(unit_id);
`)

const loadDate = process.env.DEMO_LOAD_DATE || todaySheetDate()
const { trailers: INITIAL_TRAILERS } = generateDemoDay(loadDate)
const { units: YARD_UNITS, events: YARD_EVENTS } = generateYardDay(loadDate, INITIAL_TRAILERS)

db.run(`INSERT INTO meta (key, value) VALUES (?, ?), (?, ?), (?, ?)`, [
  'load_date',
  loadDate,
  'source',
  'synthetic inbound/outbound + yard temps day (no live client data)',
  'tms',
  'mandata-enterprise-stub',
])

const insertTrailer = db.prepare(`
  INSERT INTO trailers (
    id, direction, vehicle, trailer, driver,
    bay_no, start_time, time_on, time_off, checker, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertJob = db.prepare(`
  INSERT INTO jobs (
    id, trailer_id, pallets, temp, customer, job_no,
    collect_from, collect_town, deliver_to, deliver_town,
    delivery_window, deliver_date, ref, order_ref,
    inb_driver, inb_veh, status, note, done_pallets_json, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

let jobCount = 0
INITIAL_TRAILERS.forEach((trailer, tIdx) => {
  insertTrailer.run([
    trailer.id,
    trailer.direction,
    trailer.vehicle,
    trailer.trailer,
    trailer.driver,
    trailer.bayNo ?? '',
    trailer.startTime ?? '',
    trailer.timeOn ?? '',
    trailer.timeOff ?? '',
    trailer.checker ?? '',
    tIdx,
  ])

  trailer.jobs.forEach((job, jIdx) => {
    insertJob.run([
      job.id,
      trailer.id,
      job.pallets,
      job.temp ?? '',
      job.customer ?? '',
      job.jobNo ?? '',
      job.collectFrom ?? '',
      job.collectTown ?? '',
      job.deliverTo ?? '',
      job.deliverTown ?? '',
      job.deliveryWindow ?? '',
      job.deliverDate ?? '',
      job.ref ?? '',
      job.orderRef ?? '',
      job.inbDriver ?? '',
      job.inbVeh ?? '',
      job.status ?? 'pending',
      job.note ?? '',
      JSON.stringify(job.donePallets ?? []),
      jIdx,
    ])
    jobCount += 1
  })
})

insertTrailer.free()
insertJob.free()

const insertYardUnit = db.prepare(`
  INSERT INTO yard_units (
    id, job_no, vehicle, trailer, driver, trailer_id,
    work_type, yard_kind, twin, bay_no, fill_pct, status,
    goods_temp_c, zone1_set, zone1_actual, zone2_set, zone2_actual,
    note, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

YARD_UNITS.forEach((u, idx) => {
  insertYardUnit.run([
    u.id,
    u.jobNo ?? '',
    u.vehicle ?? '',
    u.trailer ?? '',
    u.driver ?? '',
    u.trailerId ?? '',
    u.workType,
    u.yardKind,
    u.twin ? 1 : 0,
    u.bayNo ?? '',
    u.fillPct ?? 0,
    u.status,
    u.goodsTempC,
    u.zone1Set,
    u.zone1Actual,
    u.zone2Set,
    u.zone2Actual,
    u.note ?? '',
    idx,
  ])
})
insertYardUnit.free()

const insertYardEvent = db.prepare(`
  INSERT INTO yard_events (
    id, unit_id, job_no, at, role, author, type, reply_to, message, payload_json, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

YARD_EVENTS.forEach((e, idx) => {
  insertYardEvent.run([
    e.id,
    e.unitId,
    e.jobNo ?? '',
    e.at,
    e.role,
    e.author,
    e.type,
    e.replyTo ?? '',
    e.message,
    e.payload ? JSON.stringify(e.payload) : '',
    idx,
  ])
})
insertYardEvent.free()

mkdirSync(outDir, { recursive: true })
const data = db.export()
writeFileSync(outFile, Buffer.from(data))
db.close()

// Browser loader uses classic scripts from /public (avoids Vite ESM/CJS issues with sql.js)
copyFileSync(join(sqlDist, 'sql-wasm.js'), join(outDir, 'sql-wasm.js'))
copyFileSync(wasmPath, join(outDir, 'sql-wasm.wasm'))

console.log(
  `Wrote ${outFile} · ${INITIAL_TRAILERS.length} trailers · ${jobCount} jobs · ${YARD_UNITS.length} yard units · ${YARD_EVENTS.length} yard events`,
)
console.log('Copied sql-wasm.js + sql-wasm.wasm → public/')
