import { expect, test } from '@playwright/test'

test.use({ headless: true })

const products = Array.from({ length: 40 }, (_, index) => ({
    id: index + 1,
    name: `Queso ${String(index + 1).padStart(2, '0')}`,
    description: 'Queso de Asturias.',
    image: '/images/test-product.svg',
    price: index + 1,
    category: index % 2 ? 'Miel' : 'Quesos',
    farmId: 7,
    farmName: 'Granja de prueba',
    farmAddress: 'Asturias',
}))

test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me', route => route.fulfill({ status: 401, json: {} }))
    await page.route('**/api/farms', route => route.fulfill({ json: [] }))
    await page.route('**/api/products', route => route.fulfill({ json: products }))
    await page.route(/\/api\/products\/\d+$/, route => {
        const id = Number(new URL(route.request().url()).pathname.split('/').pop())
        return route.fulfill({ json: products.find(product => product.id === id) })
    })
    await page.route('**/images/test-product.svg', route => route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190"><rect width="320" height="190" fill="#e5eee5"/></svg>',
    }))
})

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    for (const returnMethod of ['browser back', 'catalog link']) {
        test(`restores products via ${returnMethod} at ${viewport.width}px`, async ({ page }, testInfo) => {
            await page.setViewportSize(viewport)
            let catalogRequests = 0
            page.on('request', request => {
                if (new URL(request.url()).pathname === '/api/products') catalogRequests += 1
            })
            await page.goto('/productos')
            const cards = page.locator('.catalog-page_list .product-card')
            await expect(cards).toHaveCount(40)
            await page.getByPlaceholder('Buscar productos').fill('Queso')
            await page.locator('.catalog-page_categories').getByRole('button', { name: 'Quesos', exact: true }).click()
            await page.locator('.catalog-sort summary').click()
            await page.locator('.catalog-sort_list button').nth(4).click()
            await expect(cards).toHaveCount(20)

            const card = cards.nth(10)
            await card.getByRole('button', { name: 'Increase quantity' }).click()
            const link = card.locator('.product-card_link')
            await link.scrollIntoViewIfNeeded()
            const originalTop = await page.locator('.app-main').evaluate(el => el.scrollTop)
            expect(originalTop).toBeGreaterThan(500)
            await link.click()
            await expect(page.locator('.product-details h1')).toBeVisible()
            await expect.poll(() => page.locator('.app-main').evaluate(el => el.scrollTop)).toBe(0)

            if (returnMethod === 'browser back') await page.goBack()
            else await page.getByRole('navigation', { name: 'Ruta de navegaci\u00f3n' }).getByRole('link', { name: 'Productos' }).click()

            await expect(page).toHaveURL(/\/productos$/)
            await expect(cards).toHaveCount(20)
            await expect.poll(async () => Math.abs(
                await page.locator('.app-main').evaluate(el => el.scrollTop) - originalTop
            )).toBeLessThan(3)
            await expect(page.getByPlaceholder('Buscar productos')).toHaveValue('Queso')
            await expect(cards.first().locator('h3')).toHaveText('Queso 39')
            await expect(card.locator('.quantity-control')).toContainText('2')
            expect(catalogRequests).toBe(1)
            if (viewport.width === 390) {
                await expect(page.getByRole('button', { name: 'Subir al inicio' })).toBeVisible()
            }
            await page.screenshot({ path: testInfo.outputPath('restored-products.png') })
        })
    }
}
