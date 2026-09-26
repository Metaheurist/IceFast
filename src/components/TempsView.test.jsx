import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '../AppContext'
import TempsView, { reeferZoneStatus } from '../components/TempsView'
import { INITIAL_TRAILERS } from '../data'

function renderTemps() {
  return render(
    <AppProvider seedTrailers={INITIAL_TRAILERS}>
      <TempsView />
    </AppProvider>,
  )
}

describe('reeferZoneStatus', () => {
  it('treats unset as off, near-set as green, and large delta as off-spec', () => {
    expect(reeferZoneStatus(null, -22)).toBe('off')
    expect(reeferZoneStatus(-22, null)).toBe('waiting')
    expect(reeferZoneStatus(-22, -21.5)).toBe('atSet')
    expect(reeferZoneStatus(-22, -18)).toBe('pulling')
    expect(reeferZoneStatus(-22, 8.4)).toBe('offSpec')
  })
})

describe('TempsView', () => {
  it('shows the TMS stub banner and traffic-pad labels', () => {
    renderTemps()
    expect(screen.getByText(/not connected to Mandata Enterprise TMS/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Part loads \/ Temps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Open loads/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Available \/ parked/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ops thread/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Job No\./i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Work type/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Delivery').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Goods °C').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Zone 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Zone 2').length).toBeGreaterThan(0)
  })

  it('lists parked trailers in the available pool', () => {
    renderTemps()
    const parkedSection = screen.getByRole('heading', { name: /Available \/ parked/i }).closest('section')
    expect(within(parkedSection).getByText('IF149')).toBeInTheDocument()
    expect(within(parkedSection).getAllByText(/twin/i).length).toBeGreaterThan(0)
  })

  it('assigns a parked twin onto the unassigned open load', async () => {
    const user = userEvent.setup()
    renderTemps()

    const unassigned = screen.getByRole('heading', { name: 'Unassigned' }).closest('article')
    await user.click(within(unassigned).getByRole('button', { name: /Assign parked/i }))
    await user.click(screen.getByRole('button', { name: /IF149/i }))

    expect(screen.queryByRole('heading', { name: 'Unassigned' })).not.toBeInTheDocument()
    const parkedSection = screen.getByRole('heading', { name: /Available \/ parked/i }).closest('section')
    expect(within(parkedSection).queryByText('IF149')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'IF149' })).toBeInTheDocument()
    expect(screen.getByText(/Put IF149 on job/i)).toBeInTheDocument()
  })

  it('logs reefer zones onto the ops thread without mixing goods temp copy', async () => {
    const user = userEvent.setup()
    renderTemps()

    const card = screen.getByRole('heading', { name: 'IF330' }).closest('article')
    await user.click(within(card).getByRole('button', { name: 'Reefer' }))

    expect(screen.getByText(/Thermo King-shaped/i)).toBeInTheDocument()
    const fill = screen.getByLabelText('Fill percent')
    await user.clear(fill)
    await user.type(fill, '95')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('330 95%')).toBeInTheDocument()
    expect(screen.queryByText(/Goods -18/i)).not.toBeInTheDocument()
  })
})
