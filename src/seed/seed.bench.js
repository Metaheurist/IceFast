import { bench, describe } from 'vitest'
import { generateDemoDay } from './generateDemoDay'
import { generateYardDay } from './generateYardDay'
import {
  toMandataAssetTemp,
  toMandataEvent,
  toMandataJobPatch,
} from '../integrations/mandataHandshake'

const DATE = '22/08/2026'
const demoDay = generateDemoDay(DATE)
const yardDay = generateYardDay(DATE, demoDay.trailers)

describe('seed generators', () => {
  bench('generateDemoDay', () => {
    generateDemoDay(DATE)
  })

  bench('generateYardDay', () => {
    generateYardDay(DATE, demoDay.trailers)
  })
})

describe('handshake DTO writers', () => {
  bench('job patch + asset temp (all yard units)', () => {
    for (const unit of yardDay.units) {
      toMandataJobPatch(unit)
      toMandataAssetTemp(unit)
    }
  })

  bench('event (all yard events)', () => {
    for (const event of yardDay.events) toMandataEvent(event)
  })
})
