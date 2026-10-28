import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import ProductsPage from '@/views/ProductsPage.vue'
import MapSection from '@/components/map/MapSection.vue'
import ProductCard from '@/components/cards/ProductCard.vue'
import CategoryFilter from '@/components/catalog/CategoryFilter.vue'
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

describe('shared product sort menu', () => {
    let wrapper
    afterEach(() => wrapper?.unmount())

    it.each([
        [1, [1, 2]],
        [2, [2, 1]],
        [3, [2, 1]],
        [4, [1, 2]],
    ])('preserves product sorting option %s after sharing the menu', async (option, ids) => {
        wrapper = mount(ProductsPage, {
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
        await flushPromises()

        expect(wrapper.findAll('.catalog-sort_list button')).toHaveLength(5)
        await wrapper.findAll('.catalog-sort_list button')[option].trigger('click')

        expect(wrapper.findAllComponents(ProductCard).map(card => card.props('productId')))
            .toEqual(ids)

        await wrapper.findAll('.catalog-sort_list button')[0].trigger('click')
        expect(wrapper.findAllComponents(ProductCard).map(card => card.props('productId')))
            .toEqual([1, 2])
    })
})

describe('product catalog controls and states', () => {
    let wrapper
    let container
    let router
    let visible

    beforeEach(async () => {
        vi.stubGlobal('innerWidth', 390)
        container = document.createElement('main')
        container.className = 'app-main'
        container.scrollTo = vi.fn()
        Object.defineProperties(container, {
            scrollHeight: { configurable: true, value: 3000 },
            clientHeight: { configurable: true, value: 700 },
        })
        document.body.append(container)
        router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/productos', component: { template: '<div />' } },
                { path: '/granjas/:id', name: 'farm-details', component: { template: '<div />' } },
            ],
        })
        await router.push('/productos')
        await router.isReady()
        visible = ref(true)
    })

    afterEach(() => {
        wrapper?.unmount()
        wrapper = undefined
        container.remove()
        vi.unstubAllGlobals()
    })

    async function mountCatalog() {
        wrapper = mount({
            components: { ProductsPage },
            setup: () => ({ visible }),
            template: '<KeepAlive><ProductsPage v-if="visible" /></KeepAlive>',
        }, {
            attachTo: container,
            global: {
                plugins: [createPinia(), router],
                stubs: {
                    CatalogLayout: { template: '<div><slot name="content" /><slot name="map" /></div>' },
                    MapSection: true,
                },
            },
        })
        await flushPromises()
    }

    it('shows loading until the product request completes', async () => {
        let finishLoading
        getProducts.mockReturnValueOnce(new Promise(resolve => { finishLoading = resolve }))
        await mountCatalog()
        expect(wrapper.text()).toContain('Cargando productos...')

        finishLoading([])
        await flushPromises()
        expect(wrapper.text()).not.toContain('Cargando productos...')
        expect(wrapper.text()).toContain('No hay productos disponibles.')
    })

    it('reports a failed catalog request', async () => {
        getProducts.mockRejectedValueOnce(new TypeError('Offline'))
        await mountCatalog()
        expect(wrapper.text()).toContain('No se pudieron cargar los productos.')
        expect(wrapper.findAllComponents(ProductCard)).toHaveLength(0)
    })

    it('combines category and search filters and shows an empty result', async () => {
        await mountCatalog()
        await wrapper.findComponent(CategoryFilter).vm.$emit('select', 'Sidra')
        expect(wrapper.findAllComponents(ProductCard).map(card => card.props('productId'))).toEqual([2])
        await wrapper.get('input[type="search"]').setValue('queso')
        expect(wrapper.text()).toContain('No hay productos disponibles.')
        await wrapper.findComponent(CategoryFilter).vm.$emit('select', 'Todos')
        expect(wrapper.findAllComponents(ProductCard).map(card => card.props('productId'))).toEqual([1])
    })

    it('adds the chosen quantity, resets it and prevents quantities below one', async () => {
        await mountCatalog()
        const card = wrapper.findAllComponents(ProductCard)[0]
        const decrease = card.get('button[aria-label="Decrease quantity"]')
        const increase = card.get('button[aria-label="Increase quantity"]')
        await decrease.trigger('click')
        expect(card.props('cartQuantity')).toBe(1)
        await increase.trigger('click')
        await increase.trigger('click')
        await decrease.trigger('click')
        expect(card.props('cartQuantity')).toBe(2)
        await card.get('button[aria-label="Add to cart"]').trigger('click')
        expect(useCartStore().items[0]).toMatchObject({ id: 1, quantity: 2 })
        expect(card.props('cartQuantity')).toBe(1)
    })

    it('offers mobile scroll actions only when useful and scrolls to the correct edge', async () => {
        await mountCatalog()
        const catalog = wrapper.get('.catalog-page').element
        catalog.scrollIntoView = vi.fn()
        expect(wrapper.find('[aria-label="Subir al inicio"]').exists()).toBe(false)

        container.scrollTop = 300
        container.dispatchEvent(new Event('scroll'))
        await nextTick()
        await wrapper.get('[aria-label="Subir al inicio"]').trigger('click')
        expect(catalog.scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' })
        await wrapper.get('[aria-label="Bajar al final"]').trigger('click')
        expect(catalog.scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'end' })

        container.scrollTop = 2300
        container.dispatchEvent(new Event('scroll'))
        await nextTick()
        expect(wrapper.find('[aria-label="Bajar al final"]').exists()).toBe(false)
        expect(wrapper.find('[aria-label="Subir al inicio"]').exists()).toBe(true)
    })

    it('restores scroll tracking after the cached catalog becomes active again', async () => {
        await mountCatalog()
        await wrapper.get('input[type="search"]').setValue('queso')
        visible.value = false
        await nextTick()
        visible.value = true
        await flushPromises()

        expect(wrapper.get('input[type="search"]').element.value).toBe('queso')
        expect(getProducts).toHaveBeenCalledTimes(1)
        container.scrollTop = 500
        container.dispatchEvent(new Event('scroll'))
        await nextTick()
        expect(wrapper.find('[aria-label="Subir al inicio"]').exists()).toBe(true)
    })

    it('opens the farm selected in the map popup', async () => {
        await mountCatalog()
        await wrapper.findComponent(MapSection).vm.$emit('view-farm', 7)
        await flushPromises()
        expect(router.currentRoute.value.path).toBe('/granjas/7')
    })
})
