import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs from 'sql.js'
import { queryMetaFromDb, queryTrailersFromDb, queryYardEventsFromDb, queryYardUnitsFromDb } from './queryTrailers'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDbPath = join(__dirname, '..', '..', 'public', 'demo.db')
const wasmPath = join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')

let sqlPromise = null

function getSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ wasmBinary: readFileSync(wasmPath) })
  }
  return sqlPromise
}

/** Load trailers from the on-disk SQLite file (Node / Vitest). */
export async function loadDemoTrailersFromFile(dbPath = defaultDbPath) {
  const SQL = await getSql()
  const bytes = new Uint8Array(readFileSync(dbPath))
  const db = new SQL.Database(bytes)
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
