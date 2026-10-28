import { expect, test } from '@playwright/test'

test.use({ headless: true })

const farms = Array.from({ length: 40 }, (_, index) => ({
    id: index + 1,
    name: `Granja ${String(index + 1).padStart(2, '0')}`,
    address: 'Asturias',
    description: 'Granja familiar de Asturias.',
    image: '/images/test-farm.svg',
    categories: ['Quesos'],
    latitude: 43.36,
    longitude: -5.84,
}))

test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, json: {} }))
    await page.route('**/api/farms', route => route.fulfill({ json: farms }))
    await page.route(/\/api\/farms\/\d+$/, route => {
        const id = Number(new URL(route.request().url()).pathname.split('/').pop())
        return route.fulfill({ json: farms.find(farm => farm.id === id) })
    })
    await page.route(/\/api\/farms\/\d+\/products$/, route => route.fulfill({ json: [] }))
    await page.route('**/images/test-farm.svg', route => route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190"><rect width="320" height="190" fill="#e5eee5"/></svg>',
    }))
})

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    for (const returnMethod of ['browser back', 'catalog link']) {
        test(`restores the middle of the farm list via ${returnMethod} at ${viewport.width}px`, async ({ page }, testInfo) => {
            await page.setViewportSize(viewport)
            let catalogRequests = 0
            page.on('request', request => {
                if (new URL(request.url()).pathname === '/api/farms') catalogRequests += 1
            })
            await page.goto('/granjas')
            const cards = page.locator('.catalog-page_list .farm-card')
            await expect(cards).toHaveCount(40)
            await page.getByPlaceholder('Buscar granjas').fill('Granja')
            await page.locator('.catalog-sort summary').click()
            await page.locator('.catalog-sort_list button').nth(2).click()

            const button = cards.nth(18).getByRole('button', { name: 'Ver granja' })
            await button.scrollIntoViewIfNeeded()
            const originalTop = await page.locator('.app-main').evaluate(el => el.scrollTop)
            expect(originalTop).toBeGreaterThan(500)
            await button.click()
            await expect(page.locator('.farm-details h1')).toBeVisible()
            await expect.poll(() => page.locator('.app-main').evaluate(el => el.scrollTop)).toBe(0)

            if (returnMethod === 'browser back') await page.goBack()
            else await page.getByRole('navigation', { name: 'Ruta de navegaci\u00f3n' }).getByRole('link', { name: 'Granjas' }).click()

            await expect(page).toHaveURL(/\/granjas$/)
            await expect(cards).toHaveCount(40)
            await expect.poll(async () => Math.abs(
                await page.locator('.app-main').evaluate(el => el.scrollTop) - originalTop
            )).toBeLessThan(3)
            await expect(page.getByPlaceholder('Buscar granjas')).toHaveValue('Granja')
            await expect(cards.first().locator('h3')).toHaveText('Granja 40')
            expect(catalogRequests).toBe(1)
            await page.screenshot({ path: testInfo.outputPath('restored-farm-list.png') })
        })
    }
}
