import { queryMetaFromDb, queryTrailersFromDb, queryYardEventsFromDb, queryYardUnitsFromDb } from './queryTrailers'

const DEMO_DB_URL = '/demo.db'
const SQL_JS_URL = '/sql-wasm.js'
const SQL_WASM_URL = '/sql-wasm.wasm'

let sqlPromise = null
let cachedBytes = null

function loadInitSqlJs() {
  if (typeof window !== 'undefined' && typeof window.initSqlJs === 'function') {
    return Promise.resolve(window.initSqlJs)
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-sqljs="1"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.initSqlJs))
      existing.addEventListener('error', () =>
        reject(new Error(`Failed to load ${SQL_JS_URL}`)),
      )
      return
    }

    const script = document.createElement('script')
    script.src = SQL_JS_URL
    script.async = true
    script.dataset.sqljs = '1'
    script.onload = () => {
      if (typeof window.initSqlJs !== 'function') {
        reject(new Error('sql-wasm.js loaded but initSqlJs was not defined'))
        return
      }
      resolve(window.initSqlJs)
    }
    script.onerror = () => reject(new Error(`Failed to load ${SQL_JS_URL}`))
    document.head.appendChild(script)
  })
}

function getSql() {
  if (!sqlPromise) {
    sqlPromise = loadInitSqlJs().then((initSqlJs) =>
      initSqlJs({ locateFile: () => SQL_WASM_URL }),
    )
  }
  return sqlPromise
}

async function fetchDbBytes(url = DEMO_DB_URL) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load demo database (${res.status}) from ${url}`)
  }
  return new Uint8Array(await res.arrayBuffer())
}

/**
 * Load warehouse sheets from the local SQLite demo.db file (browser).
 * @param {{ url?: string, bustCache?: boolean }} [opts]
 */
export async function loadDemoTrailers(opts = {}) {
  const url = opts.url ?? DEMO_DB_URL
  const SQL = await getSql()

  if (opts.bustCache || !cachedBytes) {
    const fetchUrl = opts.bustCache ? `${url}?t=${Date.now()}` : url
    cachedBytes = await fetchDbBytes(fetchUrl)
  }

  const db = new SQL.Database(cachedBytes)
  try {
    return {
      trailers: queryTrailersFromDb(db),
      yardUnits: queryYardUnitsFromDb(db),
      yardEvents: queryYardEventsFromDb(db),
      meta: queryMetaFromDb(db),
    }
  } finally {
    db.close()
  }
}

/** Clear in-memory db bytes (tests / forced reload) */
export function clearDemoDbCache() {
  cachedBytes = null
}
