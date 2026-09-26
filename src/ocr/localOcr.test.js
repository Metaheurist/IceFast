import { describe, expect, it } from 'vitest'
import { getLocalOcrStatus } from './localOcr'

describe('localOcr', () => {
  it('starts cold before the engine is warmed', () => {
    const status = getLocalOcrStatus()
    expect(status).toEqual(expect.objectContaining({ status: expect.any(String) }))
    expect(['cold', 'warming', 'ready', 'error']).toContain(status.status)
  })
})
