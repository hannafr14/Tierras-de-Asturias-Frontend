import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ProductsPage from '@/views/ProductsPage.vue'
import MapSection from '@/components/map/MapSection.vue'
import ProductCard from '@/components/cards/ProductCard.vue'
import { useCartStore } from '@/stores/cartStore'

vi.mock('@/services/catalogApi', () => {
    return {
        getProducts: vi.fn(),
        getFarms: vi.fn(),
    }
})

import { getProducts, getFarms } from '@/services/catalogApi'
beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    getProducts.mockResolvedValue([
        {
            id: 1,
            name: 'Queso Gamoneu',
            image: 'https://example.com/queso.jpg',
            farmName: 'Finca La Vara',
            farmAddress: 'Oviedo',
            price: 12.5,
            category: 'Quesos',
            farmId: 10,
        },
        {
            id: 2,
            name: 'Sidra Natural',
            image: 'https://example.com/sidra.jpg',
            farmName: 'Llagar Asturias',
            farmAddress: 'Gijon',
            price: 4.2,
            category: 'Sidra',
            farmId: 11,
        },
    ])

    getFarms.mockResolvedValue([])
})

describe('ProductsPage', () => {
    it('shares farm selection between map markers and product cards', async () => {
        const wrapper = mount(ProductsPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => setTimeout(resolve, 0))

        const map = wrapper.findComponent(MapSection)
        await map.vm.$emit('update:selectedFarmId', 11)

        expect(map.props('selectedFarmId')).toBe(11)

        await wrapper.findAllComponents(ProductCard)[0].trigger('click')

        expect(map.props('selectedFarmId')).toBe(10)
    })

    it('loads and renders products', async () => {
        const wrapper = mount(ProductsPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        expect(getProducts).toHaveBeenCalled()
        expect(wrapper.text()).toContain('Queso Gamoneu')
        expect(wrapper.text()).toContain('Sidra Natural')
        expect(wrapper.text()).toContain('Finca La Vara')
        expect(wrapper.text()).toContain('Llagar Asturias')
    })

    it('filters products by search query', async () => {
        const wrapper = mount(ProductsPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        const searchInput = wrapper.find('input[type="search"]')

        await searchInput.setValue('queso')

        expect(wrapper.text()).toContain('Queso Gamoneu')
        expect(wrapper.text()).not.toContain('Sidra Natural')
    })

    it('adds a product to the cart', async () => {
        const wrapper = mount(ProductsPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        const cartStore = useCartStore()
        const cartButtons = wrapper.findAll('button[aria-label="Add to cart"]')

        await cartButtons[0].trigger('click')

        expect(cartStore.items).toHaveLength(1)
        expect(cartStore.items[0].name).toBe('Queso Gamoneu')
        expect(cartStore.items[0].quantity).toBe(1)
    })

    it('increases quantity when adding the same product again', async () => {
        const wrapper = mount(ProductsPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        const cartStore = useCartStore()
        const cartButtons = wrapper.findAll('button[aria-label="Add to cart"]')

        await cartButtons[0].trigger('click')
        await cartButtons[0].trigger('click')

        expect(cartStore.items).toHaveLength(1)
        expect(cartStore.items[0].name).toBe('Queso Gamoneu')
        expect(cartStore.items[0].quantity).toBe(2)
    })
})
