import { describe, test } from 'vitest'
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
  test('filterTrailers by query', async ({ bench }) => {
    await bench('filterTrailers by query', () => {
      filterTrailers(INITIAL_TRAILERS, { query: 'northbridge' })
    }).run()
  })

  test('filterTrailers by status + temp', async ({ bench }) => {
    await bench('filterTrailers by status + temp', () => {
      filterTrailers(INITIAL_TRAILERS, { status: 'hold', temp: 'frozen' })
    }).run()
  })

  test('countMatchingJobs', async ({ bench }) => {
    await bench('countMatchingJobs', () => {
      countMatchingJobs(INITIAL_TRAILERS, { query: 'IF200' })
    }).run()
  })
})

describe('sheet OCR matching', () => {
  test('extractSheetTokens', async ({ bench }) => {
    await bench('extractSheetTokens', () => {
      extractSheetTokens(sampleText)
    }).run()
  })

  test('matchLoadsFromSheetText', async ({ bench }) => {
    await bench('matchLoadsFromSheetText', () => {
      matchLoadsFromSheetText(INITIAL_TRAILERS, sampleText)
    }).run()
  })
})

describe('trailer helpers', () => {
  test('trailerTotals (all trailers)', async ({ bench }) => {
    await bench('trailerTotals (all trailers)', () => {
      for (const t of INITIAL_TRAILERS) trailerTotals(t)
    }).run()
  })

  test('normalizeTrailers', async ({ bench }) => {
    await bench('normalizeTrailers', () => {
      normalizeTrailers(INITIAL_TRAILERS)
    }).run()
  })
})
