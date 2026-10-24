import { expect, test } from '@playwright/test'

test.use({ headless: true })

const farm = {
    id: 7, name: 'Granja de prueba', address: 'Asturias',
    description: 'Granja familiar', image: '',
    latitude: 43.36, longitude: -5.84, categories: ['Quesos'],
}
const product = {
    id: 2, name: 'Queso', image: '', price: 12.5,
    category: 'Quesos', farmId: 7,
    farmName: farm.name, farmAddress: farm.address,
}

test.beforeEach(async ({ page }) => {
    await page.route('**/api/farms', route =>
        route.fulfill({ json: [farm] }))
    await page.route('**/api/farms/7', route =>
        route.fulfill({ json: farm }))
    await page.route('**/api/farms/7/products', route =>
        route.fulfill({ json: [product] }))
    await page.route('**/api/products', route =>
        route.fulfill({ json: [product] }))
})

test('opens farm details from the catalog button', async ({ page }) => {
    await page.goto('/granjas')
    await page.locator('.catalog-page_list .farm-card_button').first().click()
    await expect(page).toHaveURL(/\/granjas\/7$/)
    await expect(page.locator('.farm-details h1')).toHaveText(farm.name)
})

for (const path of ['/granjas', '/productos']) {
    test(`opens farm details from the map on ${path}`, async ({ page }) => {
        await page.goto(path)
        const image = path === '/granjas'
            ? '.farm-card_image'
            : '.product-card_image'
        await page.locator(`.catalog-page_list ${image}`).first().click()
        await page.locator('.leaflet-popup .farm-card_button').click()
        await expect(page).toHaveURL(/\/granjas\/7$/)
        await expect(page.locator('.farm-details h1')).toHaveText(farm.name)
    })
}
