import { expect, test } from '@playwright/test'

test.use({ headless: true })

const farm = {
    id: 7, name: 'Granja de prueba', address: 'Asturias',
    image: '', categories: ['Quesos'], latitude: 43.36, longitude: -5.84,
}
const product = {
    id: 2, name: 'Queso', image: '', price: 12.5, category: 'Quesos',
    farmId: 7, farmName: farm.name, farmAddress: farm.address,
}

for (const width of [1280, 390]) {
    test.describe(`catalog sort dismissal at ${width}px`, () => {
        test.use({ viewport: { width, height: 844 }, hasTouch: width === 390 })

        test.beforeEach(async ({ page }) => {
            await page.route('**/api/auth/me', route => route.fulfill({ status: 401, json: {} }))
            await page.route('**/api/farms', route => route.fulfill({ json: [farm] }))
            await page.route('**/api/products', route => route.fulfill({ json: [product] }))
        })

        for (const path of ['/granjas', '/productos']) {
            test(`dismisses sort outside on ${path} and preserves normal controls`, async ({ page }) => {
                await page.goto(path)
                const menu = page.locator('.catalog-sort')
                const trigger = menu.locator('summary')
                const search = page.locator('input[type="search"]')
                await trigger.click()
                await expect(menu).toHaveAttribute('open', '')

                if (width === 390) await search.tap()
                else await search.click()
                await expect(menu).not.toHaveAttribute('open')
                await expect(search).toBeFocused()

                await trigger.click()
                await page.locator('.catalog-page_title').click()
                await expect(menu).not.toHaveAttribute('open')

                await trigger.click()
                const option = menu.locator('button').nth(1)
                await option.click()
                await expect(option).toHaveAttribute('aria-pressed', 'true')
                await expect(menu).not.toHaveAttribute('open')
                await expect(trigger).toBeFocused()

                await trigger.click()
                await trigger.press('Escape')
                await expect(menu).not.toHaveAttribute('open')
                await expect(option).toHaveAttribute('aria-pressed', 'true')
                await expect(trigger).toBeFocused()
            })
        }
    })
}
