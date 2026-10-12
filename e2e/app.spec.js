import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/ICEFAST WAREHOUSE FLOOR/i)).toBeVisible()
})

test('loads the Floor sheet from demo.db', async ({ page }) => {
  await expect(page.getByText(/Trailer: IF200/)).toBeVisible()
  await expect(page.getByRole('searchbox', { name: 'Search loads' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Scan load sheet photo' })).toBeVisible()
})

test('filters Floor loads by search query', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Search loads' }).fill('Harbour Chill')
  await expect(page.getByText('Harbour Chill Ltd').first()).toBeVisible()
  await expect(page.getByText('Northbridge Foods')).toHaveCount(0)
})

test('cycles a job status from the status badge', async ({ page }) => {
  const row = page.locator('tr', { hasText: 'Bracken Mill Foods' })
  await row.getByRole('button', { name: /pending/i }).click()
  await expect(row.getByRole('button', { name: /loaded/i })).toBeVisible()
})

test('saved Floor note appears on the Dispatch feed', async ({ page }) => {
  const row = page.locator('tr', { hasText: 'Bracken Mill Foods' })
  await row.getByRole('button', { name: 'Add note' }).click()
  await page.getByRole('textbox').last().fill('E2E wrap check on top pallet')
  await page.getByRole('button', { name: /Save & Sync/i }).click()

  await page.getByRole('button', { name: /Dispatch/i }).click()
  await expect(page.getByText(/Dispatch Live Dashboard/i)).toBeVisible()
  await expect(page.getByText('E2E wrap check on top pallet').first()).toBeVisible()
})

test('Temps shows stub banner and yard columns', async ({ page }) => {
  await page.getByRole('button', { name: /Temps/i }).click()
  await expect(page.getByText(/not connected to Mandata Enterprise TMS/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Open loads/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Ops thread/i })).toBeVisible()
})

test('Scan demo sample jumps search to the matched load', async ({ page }) => {
  await page.getByRole('button', { name: 'Scan load sheet photo' }).click()
  const dialog = page.getByRole('dialog', { name: /scan load sheet/i })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /try demo ocr sample/i }).click()
  await dialog.getByRole('button', { name: /Northbridge Foods/i }).first().click()
  await expect(page.getByRole('searchbox', { name: 'Search loads' })).not.toHaveValue('')
})
