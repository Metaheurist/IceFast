import { bench, describe } from 'vitest'
import {
  INITIAL_TRAILERS,
  countMatchingJobs,
  extractSheetTokens,
  filterTrailers,
  matchLoadsFromSheetText,
  normalizeTrailers,
  trailerTotals,
} from './data'
import { buildDemoOcrSample } from './seed/generateDemoDay'

const sampleText = buildDemoOcrSample(INITIAL_TRAILERS)

describe('search and filters', () => {
  bench('filterTrailers by query', () => {
    filterTrailers(INITIAL_TRAILERS, { query: 'northbridge' })
  })

  bench('filterTrailers by status + temp', () => {
    filterTrailers(INITIAL_TRAILERS, { status: 'hold', temp: 'frozen' })
  })

  bench('countMatchingJobs', () => {
    countMatchingJobs(INITIAL_TRAILERS, { query: 'IF200' })
  })
})

describe('sheet OCR matching', () => {
  bench('extractSheetTokens', () => {
    extractSheetTokens(sampleText)
  })

  bench('matchLoadsFromSheetText', () => {
    matchLoadsFromSheetText(INITIAL_TRAILERS, sampleText)
  })
})

describe('trailer helpers', () => {
  bench('trailerTotals (all trailers)', () => {
    for (const t of INITIAL_TRAILERS) trailerTotals(t)
  })

  bench('normalizeTrailers', () => {
    normalizeTrailers(INITIAL_TRAILERS)
  })
})
