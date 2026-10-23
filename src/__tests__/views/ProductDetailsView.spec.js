import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import ProductDetailsView from '@/views/ProductDetailsView.vue'
import { getProductById } from '@/services/catalogApi'
import { useCartStore } from '@/stores/cartStore'
import fallbackImage from '@/assets/image-placeholder.svg'

vi.mock('@/services/catalogApi', () => ({
    getProductById: vi.fn(),
}))

const product = {
    id: 1,
    name: 'Queso Gamoneu',
    description: 'Queso artesano asturiano',
    image: '/images/queso.jpg',
    price: 12.5,
    farmName: 'Finca La Vara',
}

let wrapper

beforeEach(() => {
    getProductById.mockReset()
    localStorage.clear()
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

async function mountPage(id = '1') {
    const pinia = createPinia()
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/productos', component: { template: '<div />' } },
            { path: '/productos/:id', component: ProductDetailsView },
        ],
    })

    await router.push(`/productos/${id}`)
    await router.isReady()
    wrapper = mount(
        { template: '<RouterView />' },
        { global: { plugins: [pinia, router] } }
    )
    await flushPromises()
    return { router, pinia }
}

describe('ProductDetailsView', () => {
    it('loads and displays the selected product', async () => {
        getProductById.mockResolvedValueOnce(product)
        await mountPage()

        expect(getProductById).toHaveBeenCalledExactlyOnceWith('1')
        expect(wrapper.get('h1').text()).toBe(product.name)
        expect(wrapper.get('.product-details_description p').text())
            .toBe(product.description)
        expect(wrapper.text()).toContain(product.farmName)
        expect(wrapper.get('.product-details_price').text()).toContain('12,50')
        expect(wrapper.get('.product-details_image').attributes('src'))
            .toBe(product.image)
    })

    it('shows loading while the product request is pending', async () => {
        let resolveRequest
        getProductById.mockReturnValueOnce(new Promise((resolve) => {
            resolveRequest = resolve
        }))

        await mountPage()

        expect(wrapper.get('[role="status"]').text())
            .toBe('Cargando producto...')
        expect(wrapper.find('.product-details_content').exists()).toBe(false)

        resolveRequest(product)
        await flushPromises()

        expect(wrapper.find('.state-message--loading').exists()).toBe(false)
        expect(wrapper.get('h1').text()).toBe(product.name)
    })

    it('shows an error when the product is not found', async () => {
        getProductById.mockRejectedValueOnce(
            new Error('Producto no encontrado.')
        )

        await mountPage('999')

        expect(getProductById).toHaveBeenCalledExactlyOnceWith('999')
        expect(wrapper.get('[role="alert"]').text())
            .toBe('Producto no encontrado.')
        expect(wrapper.find('.product-details_content').exists()).toBe(false)
        expect(wrapper.find('.product-details_add-button').exists()).toBe(false)
        expect(wrapper.get('.product-details_breadcrumbs a').attributes('href'))
            .toBe('/productos')
    })

    it('does not decrease quantity below one', async () => {
        getProductById.mockResolvedValueOnce(product)
        await mountPage()

        await wrapper.get('button[aria-label="Decrease quantity"]')
            .trigger('click')

        expect(wrapper.get('.quantity-control_value').text()).toBe('1')
    })

    it('adds the selected quantity to the cart', async () => {
        getProductById.mockResolvedValueOnce(product)
        const { pinia } = await mountPage()
        const cartStore = useCartStore(pinia)

        const increaseButton = wrapper.get(
            'button[aria-label="Increase quantity"]'
        )
        await increaseButton.trigger('click')
        await increaseButton.trigger('click')

        expect(wrapper.get('.quantity-control_value').text()).toBe('3')

        await wrapper.get('.product-details_add-button').trigger('click')

        expect(cartStore.items).toHaveLength(1)
        expect(cartStore.items[0]).toMatchObject({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 3,
        })
        expect(cartStore.subtotal).toBe(37.5)
        expect(wrapper.get('.quantity-control_value').text()).toBe('1')
        expect(wrapper.get('.product-details_feedback').text())
            .toBe('Producto añadido al carrito.')
    })

    it('shows a fallback when the product has no image', async () => {
        getProductById.mockResolvedValueOnce({ ...product, image: '' })
        await mountPage()

        const image = wrapper.get('.product-details_image')

        expect(image.attributes('src')).toBe(fallbackImage)
        expect(image.attributes('alt')).toBe('Imagen no disponible')
    })

    it('shows a fallback when the product image fails to load', async () => {
        getProductById.mockResolvedValueOnce(product)
        await mountPage()

        const image = wrapper.get('.product-details_image')
        await image.trigger('error')

        expect(image.attributes('src')).toBe(fallbackImage)
        expect(image.attributes('alt')).toBe('Imagen no disponible')
    })

    it('returns to the catalog through the breadcrumbs', async () => {
        getProductById.mockResolvedValueOnce(product)
        const { router } = await mountPage()

        expect(wrapper.get('[aria-current="page"]').text())
            .toBe(product.name)

        const link = wrapper.get('.product-details_breadcrumbs a')
        expect(link.text()).toBe('Productos')

        await link.trigger('click')
        await flushPromises()

        expect(router.currentRoute.value.path).toBe('/productos')
        expect(wrapper.find('.product-details').exists()).toBe(false)
    })
})