import { expect, test } from '@playwright/test'

test.use({ headless: true })

for (const width of [320, 390, 576, 577, 1440]) {
    for (const count of [0, 1, 8]) {
        test(`cart footer reaches the bottom at ${width}px with ${count} items`, async ({ page }) => {
            await page.setViewportSize({ width, height: 1000 })
            await page.route('**/api/auth/me', route => route.fulfill({ status: 401 }))
            await page.addInitScript(count => {
                const items = Array.from({ length: count }, (_, index) => ({
                    id: index + 1,
                    name: `Producto ${index + 1}`,
                    image: '/images/products/los-arandanos/zumo-ecologico-de-arandanos.webp',
                    farmName: 'Granja de prueba',
                    price: 3.3,
                    quantity: 1,
                }))
                localStorage.setItem('tierras-cart', JSON.stringify(items))
            }, count)

            await page.goto('/cart')
            await expect(page.locator('.cart-page')).toBeVisible()
            await expect(page.locator('.cart-item')).toHaveCount(count)
            await page.evaluate(() => document.fonts.ready)
            await page.locator('.app-main').evaluate(el => { el.scrollTop = el.scrollHeight })

            await expect.poll(() => page.locator('.footer').evaluate(el =>
                Math.abs(window.innerHeight - el.getBoundingClientRect().bottom)
            )).toBeLessThanOrEqual(1)

            const footer = await page.locator('.footer').boundingBox()
            const cart = await page.locator('.cart-page').boundingBox()
            expect(footer.y).toBeGreaterThanOrEqual(cart.y + cart.height - 1)
            expect(await page.locator('.app-main').evaluate(el => el.scrollWidth <= el.clientWidth))
                .toBe(true)
        })
    }
}
