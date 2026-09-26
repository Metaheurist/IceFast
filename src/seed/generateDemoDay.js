/**
 * Fictional inbound/outbound warehouse day for local demo.
 * Regenerated on each `npm run dev` / `npm run db:build`.
 * Contains no live client, driver, or job-number data.
 */

export const DEMO_TRAILER_ID = {
  HOLD: 't-palletshold-out',
  COLLECT: 't-tocollect-out',
  OCR: 't-if200',
  PARTIAL: 't-if217',
  MIXED: 't-if297',
  FROZEN_IN: 't-n123',
}

export const DEMO_JOB_ID = {
  OCR: 'j-demo-ocr',
  PARTIAL_HOLD: 'j-demo-partial-hold',
  SIX: 'j-demo-six',
  PENDING: 'j-demo-pending',
}

const TEMP = {
  FROZEN: 'FROZEN -20 DEG',
  CHILLED: 'CHILLED (SET FRIDGE)',
  VEG: 'VEG +3 DEGREES',
  AMBIENT: 'AMBIENT',
}

const SITES = [
  { name: 'Meadowgate Meats', town: 'LIMAVADY' },
  { name: 'Hilltop Greens', town: 'ANTRIM' },
  { name: 'Larkspur Grocers', town: 'DUNDALK' },
  { name: 'Pinecroft Farms', town: 'DROGHEDA' },
  { name: 'Blue Harbour DC', town: 'SLIGO' },
  { name: 'Westferry Markets', town: 'BELFAST' },
  { name: 'Copperfield Poultry', town: 'OMAGH' },
  { name: 'Gullwing Frozen', town: 'DONEGAL' },
  { name: 'Ashbourne Dairy', town: 'COLERAINE' },
  { name: 'Redfern Bakery', town: 'ENNISKILLEN' },
  { name: 'Willowbank Stores', town: 'BALLYMENA' },
  { name: 'Fairmile Produce', town: 'STRABANE' },
]

const TEMPS = [TEMP.FROZEN, TEMP.CHILLED, TEMP.VEG, TEMP.AMBIENT]
const WINDOWS = ['', '8am-2pm', 'del pre lunch', 'closes 2pm', '']

export function todaySheetDate(now = new Date()) {
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${now.getFullYear()}`
}

export function shiftSheetDate(dateStr, days) {
  const [d, m, y] = String(dateStr).split('/').map(Number)
  return todaySheetDate(new Date(y, m - 1, d + days))
}

export function findDemoJob(trailers, jobId) {
  for (const trailer of trailers) {
    const job = trailer.jobs.find((j) => j.id === jobId)
    if (job) return { trailer, job }
  }
  return null
}

export function buildDemoOcrSample(trailers) {
  const hit = findDemoJob(trailers, DEMO_JOB_ID.OCR)
  if (!hit) return ''
  const { trailer, job } = hit
  return [
    'ICEFAST WAREHOUSE OUTBOUND',
    `Veh: ${trailer.vehicle}  Trailer: ${trailer.trailer}  Driver: ${trailer.driver}`,
    `Pallets ${job.pallets}  Temp ${job.temp}`,
    `Customer ${job.customer}  Job No. ${job.jobNo}`,
    `Collect From ${job.collectFrom} ${job.collectTown}`,
    `Deliver To ${job.deliverTo} ${job.deliverTown}`,
    `Deliver Date ${job.deliverDate}`,
    `Order No / Ref 2 ${job.orderRef}`,
    `Inb Veh/Trl ${job.inbVeh}`,
  ].join('\n')
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function jobNoFor(dateStr, seq) {
  const [d, m, y] = dateStr.split('/')
  return `${y.slice(2)}${m}${d}${pad2(seq)}`
}

function site(i) {
  return SITES[i % SITES.length]
}

function orderRef(dateStr, seq) {
  const [d, m, y] = dateStr.split('/')
  return `PO-${y.slice(2)}${m}${d}-${pad2(seq)}`
}

function makeJob(ctx, overrides = {}) {
  ctx.seq += 1
  const seq = ctx.seq
  const from = site(seq)
  const to = site(seq + 5)
  const {
    inbDriver = '',
    inbVeh = '',
    ...rest
  } = overrides
  const job = {
    id: `j-demo-${seq}`,
    pallets: 1 + (seq % 8),
    temp: TEMPS[seq % TEMPS.length],
    customer: from.name,
    jobNo: jobNoFor(ctx.date, seq),
    collectFrom: from.name.toUpperCase(),
    collectTown: from.town,
    deliverTo: to.name.toUpperCase(),
    deliverTown: to.town,
    deliveryWindow: WINDOWS[seq % WINDOWS.length],
    deliverDate: ctx.date,
    ref: seq % 4 === 0 ? `R${jobNoFor(ctx.date, seq)}` : '',
    orderRef: orderRef(ctx.date, seq),
    inbDriver,
    inbVeh,
    status: 'pending',
    note: '',
    ...rest,
  }
  if (!job.deliveryWindow) delete job.deliveryWindow
  return job
}

function jobsFor(ctx, count, extra = {}) {
  return Array.from({ length: count }, () => makeJob(ctx, extra))
}

function trailer({ id, direction, vehicle, trailer, driver, jobs, ...rest }) {
  return {
    id,
    direction,
    vehicle,
    trailer,
    driver,
    bayNo: '',
    startTime: '',
    timeOn: '',
    timeOff: '',
    checker: '',
    jobs,
    ...rest,
  }
}

/**
 * @param {string} [dateStr] DD/MM/YYYY — defaults to today
 * @returns {{ loadDate: string, trailers: object[] }}
 */
export function generateDemoDay(dateStr = todaySheetDate()) {
  const date = dateStr
  const yesterday = shiftSheetDate(date, -1)
  const ctx = { date, seq: 0 }

  const ocrInb = 'V800IF / IF200'
  const holdInb = 'SN26WUE / IF217'
  const mixedInb = 'V321IF / IF297'

  const holdJobs = [
    makeJob(ctx, {
      inbDriver: 'HOLD',
      inbVeh: 'K21IF / IF140',
      pallets: 1,
      temp: TEMP.FROZEN,
      customer: 'Cedar Ridge Frozen',
      collectFrom: 'STONEWELL COLDSTORE',
      collectTown: 'COLDPORT',
      deliverTo: 'TBC',
      deliverTown: 'TBC',
      status: 'hold',
      note: 'Returns issue — do not plan',
      orderRef: 'HOLD-RETURNS',
    }),
    makeJob(ctx, {
      inbDriver: 'HOLD',
      inbVeh: 'COLDSP',
      pallets: 2,
      temp: TEMP.CHILLED,
      customer: 'Riverbank Dairy',
      status: 'hold',
      note: 'Waiting on PO correction',
    }),
  ]

  const collectJobs = [
    makeJob(ctx, {
      inbVeh: 'COLDSP',
      pallets: 1,
      temp: TEMP.VEG,
      customer: 'Oakvale Produce',
      collectFrom: 'OAKVALE PRODUCE',
      collectTown: 'COLERAINE',
      deliverTo: 'CUSTOMER TO COLLECT',
      deliverTown: 'COLDPORT',
      deliveryWindow: '8am-2pm',
    }),
    makeJob(ctx, {
      inbVeh: 'COLDSP',
      pallets: 1,
      temp: TEMP.FROZEN,
      customer: 'Coastline Seafoods',
      deliverTo: 'CUSTOMER TO COLLECT',
      deliverTown: 'CUSTOMER TO COLLECT',
    }),
  ]

  const if200Jobs = [
    makeJob(ctx, {
      id: DEMO_JOB_ID.OCR,
      inbDriver: 'AK',
      inbVeh: ocrInb,
      pallets: 8,
      temp: TEMP.FROZEN,
      customer: 'Northbridge Foods',
      collectFrom: 'NORTHBRIDGE FOODS',
      collectTown: 'COLDPORT',
      deliverTo: 'AMBERFIELD STORES',
      deliverTown: 'BALLYMENA',
      status: 'loaded',
      note: 'Damaged wrap on top pallet - photo taken',
      donePallets: [1, 2, 3, 4, 5, 6, 7, 8],
      orderRef: 'PO-NORTH-01',
    }),
    ...jobsFor(ctx, 5, { inbDriver: 'AK', inbVeh: ocrInb }),
  ]

  const if217Jobs = [
    makeJob(ctx, {
      id: DEMO_JOB_ID.PARTIAL_HOLD,
      inbDriver: 'MQ',
      inbVeh: holdInb,
      pallets: 10,
      temp: TEMP.CHILLED,
      customer: 'Harbour Chill Ltd',
      collectFrom: 'HARBOUR CHILL LTD',
      collectTown: 'LETTERKENNY',
      deliverTo: 'MAPLEFORD DEPOT',
      deliverTown: 'LETTERKENNY',
      status: 'hold',
      note: '1 of 10 loaded - rest on hold for temp check',
      donePallets: [1],
      orderRef: 'PO-HARBOUR-10',
    }),
    ...jobsFor(ctx, 6, { inbDriver: 'MQ', inbVeh: holdInb }),
  ]

  const if297Jobs = [
    makeJob(ctx, {
      id: DEMO_JOB_ID.PENDING,
      inbDriver: 'NB',
      inbVeh: mixedInb,
      pallets: 3,
      temp: TEMP.CHILLED,
      customer: 'Bracken Mill Foods',
      collectFrom: 'BRACKEN MILL FOODS',
      collectTown: 'OMAGH',
      deliverTo: 'WESTFERRY MARKETS',
      deliverTown: 'BELFAST',
    }),
    makeJob(ctx, {
      id: DEMO_JOB_ID.SIX,
      inbDriver: 'NB',
      inbVeh: mixedInb,
      pallets: 6,
      temp: TEMP.AMBIENT,
      customer: 'Silverlane Bakery',
      collectFrom: 'SILVERLANE BAKERY',
      collectTown: 'ENNISKILLEN',
      deliverTo: 'LARKSPUR GROCERS',
      deliverTown: 'DUNDALK',
    }),
    ...jobsFor(ctx, 5, { inbDriver: 'NB', inbVeh: mixedInb }),
  ]

  const outboundRest = [
    trailer({
      id: 't-if250',
      direction: 'outbound',
      vehicle: 'FX25UVV',
      trailer: 'IF250',
      driver: 'ELLEN SHAW',
      startTime: '0900AM',
      jobs: jobsFor(ctx, 5, { inbDriver: 'ES', inbVeh: 'FX25UVV / IF250' }),
    }),
    trailer({
      id: 't-if315',
      direction: 'outbound',
      vehicle: 'P500IF',
      trailer: 'IF315',
      driver: 'PADRIG MOORE',
      startTime: '1000AM',
      jobs: jobsFor(ctx, 5, { inbDriver: 'PM', inbVeh: 'P500IF / IF315' }),
    }),
    trailer({
      id: 't-if140',
      direction: 'outbound',
      vehicle: 'K21IF',
      trailer: 'IF140',
      driver: 'RUTH LENNON',
      startTime: '1100AM',
      jobs: jobsFor(ctx, 4, { inbDriver: 'RL', inbVeh: 'K21IF / IF140' }),
    }),
  ]

  const inboundN123Jobs = [
    makeJob(ctx, {
      inbVeh: 'N123 / N123',
      pallets: 12,
      temp: TEMP.FROZEN,
      customer: 'Cedar Ridge Frozen',
      collectFrom: 'CEDAR RIDGE FROZEN',
      collectTown: 'STRABANE',
      deliverTo: 'STONEWELL COLDSTORE',
      deliverTown: 'COLDPORT',
      deliverDate: yesterday,
    }),
    ...jobsFor(ctx, 7, { inbVeh: 'N123 / N123', deliverDate: date }),
  ]

  const inbound = [
    trailer({
      id: DEMO_TRAILER_ID.FROZEN_IN,
      direction: 'inbound',
      vehicle: 'N123',
      trailer: 'N123',
      driver: 'CONOR REILLY',
      bayNo: '1',
      startTime: '0545AM',
      timeOn: '05:45',
      checker: 'N. HARPER',
      jobs: inboundN123Jobs,
    }),
    trailer({
      id: 't-if209-inb',
      direction: 'inbound',
      vehicle: 'SN26WUC',
      trailer: 'IF209',
      driver: 'TOM HARTE',
      bayNo: '2',
      startTime: '0615AM',
      timeOn: '06:15',
      checker: '',
      jobs: jobsFor(ctx, 8, { inbVeh: 'SN26WUC / IF209', deliverDate: yesterday }),
    }),
    trailer({
      id: 't-if217-inb',
      direction: 'inbound',
      vehicle: 'SN26WUE',
      trailer: 'IF217',
      driver: 'MARK QUINN',
      bayNo: '3',
      jobs: jobsFor(ctx, 7, { inbVeh: 'SN26WUE / IF217' }),
    }),
    trailer({
      id: 't-if250-inb',
      direction: 'inbound',
      vehicle: 'FX25UVV',
      trailer: 'IF250',
      driver: 'ELLEN SHAW',
      jobs: jobsFor(ctx, 6, { inbVeh: 'FX25UVV / IF250' }),
    }),
    trailer({
      id: 't-if315-inb',
      direction: 'inbound',
      vehicle: 'P500IF',
      trailer: 'IF315',
      driver: 'PADRIG MOORE',
      jobs: jobsFor(ctx, 6, { inbVeh: 'P500IF / IF315' }),
    }),
  ]

  const trailers = [
    trailer({
      id: DEMO_TRAILER_ID.HOLD,
      direction: 'outbound',
      vehicle: 'HOLD',
      trailer: 'PALLETSHOLD',
      driver: 'HOLD DONT PLAN',
      startTime: 'HOLD',
      jobs: holdJobs,
    }),
    trailer({
      id: DEMO_TRAILER_ID.COLLECT,
      direction: 'outbound',
      vehicle: 'COLLECTION',
      trailer: 'TOCOLLECT',
      driver: 'CUSTOMER TO COLLECT',
      jobs: collectJobs,
    }),
    trailer({
      id: DEMO_TRAILER_ID.OCR,
      direction: 'outbound',
      vehicle: 'V800IF',
      trailer: 'IF200',
      driver: 'AOIFE KANE',
      startTime: '0700AM',
      jobs: if200Jobs,
    }),
    trailer({
      id: DEMO_TRAILER_ID.PARTIAL,
      direction: 'outbound',
      vehicle: 'SN26WUE',
      trailer: 'IF217',
      driver: 'MARK QUINN',
      startTime: '0730AM',
      jobs: if217Jobs,
    }),
    trailer({
      id: DEMO_TRAILER_ID.MIXED,
      direction: 'outbound',
      vehicle: 'V321IF',
      trailer: 'IF297',
      driver: 'NIAMH BOYLE',
      startTime: '0800AM',
      jobs: if297Jobs,
    }),
    ...outboundRest,
    ...inbound,
  ]

  return { loadDate: date, trailers }
}
