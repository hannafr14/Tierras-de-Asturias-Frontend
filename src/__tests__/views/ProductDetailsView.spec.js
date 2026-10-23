import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import ProductDetailsView from '@/views/ProductDetailsView.vue'
import { getProductById } from '@/services/catalogApi'

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
})