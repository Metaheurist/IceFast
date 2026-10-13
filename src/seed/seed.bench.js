import { describe, test } from 'vitest'
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
  test('generateDemoDay', async ({ bench }) => {
    await bench('generateDemoDay', () => {
      generateDemoDay(DATE)
    }).run()
  })

  test('generateYardDay', async ({ bench }) => {
    await bench('generateYardDay', () => {
      generateYardDay(DATE, demoDay.trailers)
    }).run()
  })
})

describe('handshake DTO writers', () => {
  test('job patch + asset temp (all yard units)', async ({ bench }) => {
    await bench('job patch + asset temp (all yard units)', () => {
      for (const unit of yardDay.units) {
        toMandataJobPatch(unit)
        toMandataAssetTemp(unit)
      }
    }).run()
  })

  test('event (all yard events)', async ({ bench }) => {
    await bench('event (all yard events)', () => {
      for (const event of yardDay.events) toMandataEvent(event)
    }).run()
  })
})
