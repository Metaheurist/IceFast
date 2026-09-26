import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { AppProvider } from '../AppContext'
import FloorView from '../components/FloorView'
import DashboardView from '../components/DashboardView'
import NoteModal from '../components/NoteModal'
import PalletLogModal from '../components/PalletLogModal'
import { INITIAL_TRAILERS, STATUS } from '../data'
import { DEMO_JOB_ID, findDemoJob } from '../seed/generateDemoDay'

vi.mock('../ocr/localOcr', () => ({
  getLocalOcrStatus: () => ({ status: 'ready', error: '' }),
  warmLocalOcr: () => Promise.resolve({}),
  recognizeSheetLocal: vi.fn(async () => ({ text: '', ms: 1 })),
  preprocessForOcr: vi.fn(),
  terminateLocalOcr: vi.fn(),
}))

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => ({
        getTracks: () => [{ stop: vi.fn() }],
      })),
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn(async () => undefined),
  })
})

function renderFloor(props = {}) {
  return render(
    <AppProvider seedTrailers={INITIAL_TRAILERS}>
      <FloorView
        onOpenNote={props.onOpenNote ?? vi.fn()}
        onOpenPallets={props.onOpenPallets ?? vi.fn()}
      />
    </AppProvider>,
  )
}

function renderDash() {
  return render(
    <AppProvider seedTrailers={INITIAL_TRAILERS}>
      <DashboardView />
    </AppProvider>,
  )
}

describe('FloorView', () => {
  it(
    'renders warehouse branding and sheet columns',
    () => {
      renderFloor()
      expect(screen.getByText(/ICEFAST WAREHOUSE FLOOR/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Find load/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /scan load sheet/i })).toBeInTheDocument()
      expect(screen.getAllByText('Done/Set').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Temp').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Customer').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Deliver To').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0)
    },
    15000,
  )

  it(
    'opens sheet scan demo and applies a matched load to search',
    async () => {
      const user = userEvent.setup()
      renderFloor()
      await user.click(screen.getByRole('button', { name: /scan load sheet/i }))
      const dialog = screen.getByRole('dialog', { name: /scan load sheet/i })
      expect(dialog).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: /try demo ocr sample/i }))
      const matchBtn = await within(dialog).findByRole(
        'button',
        { name: /Northbridge Foods/i },
        { timeout: 8000 },
      )
      await user.click(matchBtn)
      const ocr = findDemoJob(INITIAL_TRAILERS, DEMO_JOB_ID.OCR)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Find load/i)).toHaveValue(ocr.job.jobNo)
      })
    },
    15000,
  )

  it(
    'filters floor loads by search query',
    async () => {
      const user = userEvent.setup()
      renderFloor()
      const hold = findDemoJob(INITIAL_TRAILERS, DEMO_JOB_ID.PARTIAL_HOLD)
      await user.type(screen.getByPlaceholderText(/Find load/i), hold.job.jobNo)
      expect(screen.getByText('Harbour Chill Ltd')).toBeInTheDocument()
      expect(screen.queryByText('Northbridge Foods')).not.toBeInTheDocument()
      expect(
        screen.getByText((_, el) => el?.textContent?.replace(/\s+/g, ' ').trim() === '1 load · 1 trailer'),
      ).toBeInTheDocument()
    },
    15000,
  )

  it('shows demo route headers', () => {
    renderFloor()
    expect(screen.getByText(/Veh: V800IF/)).toBeInTheDocument()
    expect(screen.getByText(/Trailer: IF200/)).toBeInTheDocument()
    expect(screen.getByText(/AOIFE KANE/)).toBeInTheDocument()
  })

  it('opens pallet logger when Done/Set is clicked', async () => {
    const user = userEvent.setup()
    const onOpenPallets = vi.fn()
    renderFloor({ onOpenPallets })

    const hold = screen.getByText('Harbour Chill Ltd')
    const row = hold.closest('tr')
    const buttons = within(row).getAllByRole('button')
    await user.click(buttons[0])
    expect(onOpenPallets).toHaveBeenCalled()
    expect(onOpenPallets.mock.calls[0][1].id).toBe(DEMO_JOB_ID.PARTIAL_HOLD)
  })

  it('shows lineage column headers on wider layouts', () => {
    renderFloor()
    expect(screen.getAllByText('Order / Ref 2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deliver Date').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Comments').length).toBeGreaterThan(0)
  })

  it('shows COLLECTION / TOCOLLECT bucket', () => {
    renderFloor()
    expect(screen.getByText(/Veh: COLLECTION/)).toBeInTheDocument()
    expect(screen.getByText(/Trailer: TOCOLLECT/)).toBeInTheDocument()
  })

  it('exposes checker capture on inbound trailers', () => {
    renderFloor()
    expect(screen.getAllByPlaceholderText('Name').length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue('N. HARPER')).toBeInTheDocument()
  })

  it('cycles status from the status badge', async () => {
    const user = userEvent.setup()
    renderFloor()

    const mill = screen.getByText('Bracken Mill Foods')
    const row = mill.closest('tr')
    const pending = within(row).getByRole('button', { name: /pending/i })
    await user.click(pending)
    expect(within(row).getByRole('button', { name: /loaded/i })).toBeInTheDocument()
  })
})

describe('DashboardView', () => {
  it('renders live dispatch overview', () => {
    renderDash()
    expect(screen.getByText(/Dispatch Live Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Exception & Notes Feed/i)).toBeInTheDocument()
    expect(screen.getByText(/Active trailers/i)).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('shows trailer progress labels', () => {
    renderDash()
    expect(screen.getByRole('heading', { name: 'IF200' })).toBeInTheDocument()
    expect(screen.getAllByText(/Pallets Loaded/).length).toBeGreaterThan(0)
  })

  it('opens full-screen trailer detail modal on card click', async () => {
    const user = userEvent.setup()
    renderDash()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('heading', { name: 'IF200' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /V800IF/ })).toBeInTheDocument()
    expect(within(dialog).getAllByText('Northbridge Foods').length).toBeGreaterThan(0)
    const ocr = findDemoJob(INITIAL_TRAILERS, DEMO_JOB_ID.OCR)
    expect(
      within(dialog).getAllByText(new RegExp(`Job\\s*No\\.\\s*${ocr.job.jobNo}|Job ${ocr.job.jobNo}`))
        .length,
    ).toBeGreaterThan(0)
    expect(within(dialog).getAllByRole('button', { name: /close/i }).length).toBeGreaterThan(0)
  })

  it('shows temp mix and partial pallet progress on cards', () => {
    renderDash()
    expect(screen.getAllByText(/Temp mix/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/plt 1/i).length).toBeGreaterThan(0)
  })

  it('lists seeded exception/note feed items', () => {
    renderDash()
    expect(screen.getByText(/Damaged wrap on top pallet/i)).toBeInTheDocument()
  })
})

describe('PalletLogModal', () => {
  const trailer = {
    id: 't1',
    vehicle: 'V800IF',
    trailer: 'IF200',
    driver: 'SEAN',
  }
  const job = {
    id: 'j1',
    customer: 'Harbour Chill Ltd',
    jobNo: '26082201',
    pallets: 10,
    temp: 'CHILLED (SET)',
    status: STATUS.HOLD,
    donePallets: [1],
  }

  it('shows done/set progress and remaining on hold', () => {
    render(
      <PalletLogModal
        open
        trailer={trailer}
        job={job}
        onClose={vi.fn()}
        onTogglePallet={vi.fn()}
        onSetDoneCount={vi.fn()}
        onMarkHold={vi.fn()}
      />,
    )
    expect(screen.getByText(/Pallet set progress/i)).toBeInTheDocument()
    expect(screen.getByText(/On hold - 1\/10 loaded/i)).toBeInTheDocument()
    expect(screen.getByText(/Done: 1/)).toBeInTheDocument()
    expect(screen.getByText(/Remaining: 2, 3, 4, 5, 6, 7, 8, 9, 10/)).toBeInTheDocument()
  })

  it('toggles a numbered pallet chip', async () => {
    const user = userEvent.setup()
    const onTogglePallet = vi.fn()
    render(
      <PalletLogModal
        open
        trailer={trailer}
        job={job}
        onClose={vi.fn()}
        onTogglePallet={onTogglePallet}
        onSetDoneCount={vi.fn()}
        onMarkHold={vi.fn()}
      />,
    )
    await user.click(screen.getByTitle(/Mark pallet 3 done/i))
    expect(onTogglePallet).toHaveBeenCalledWith(3)
  })

  it('marks hold with current progress', async () => {
    const user = userEvent.setup()
    const onMarkHold = vi.fn()
    const onClose = vi.fn()
    render(
      <PalletLogModal
        open
        trailer={trailer}
        job={job}
        onClose={onClose}
        onTogglePallet={vi.fn()}
        onSetDoneCount={vi.fn()}
        onMarkHold={onMarkHold}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Keep 1\/10 · Mark Hold/i }))
    expect(onMarkHold).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <PalletLogModal
        open={false}
        trailer={trailer}
        job={job}
        onClose={vi.fn()}
        onTogglePallet={vi.fn()}
        onSetDoneCount={vi.fn()}
        onMarkHold={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('NoteModal', () => {
  const trailer = { id: 't1', vehicle: 'V1', trailer: 'IF1', driver: 'A' }
  const job = {
    id: 'j1',
    customer: 'Northbridge Foods',
    jobNo: '26082205',
    pallets: 26,
    deliverTo: 'ALDI',
    note: '',
  }

  it('saves a typed note to dispatch', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(
      <NoteModal open trailer={trailer} job={job} onClose={onClose} onSave={onSave} />,
    )
    await user.type(
      screen.getByPlaceholderText(/Damaged wrap/i),
      'Returns issue with PO',
    )
    await user.click(screen.getByRole('button', { name: /Save & Sync/i }))
    expect(onSave).toHaveBeenCalledWith('Returns issue with PO')
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <NoteModal open={false} trailer={trailer} job={job} onClose={vi.fn()} onSave={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
