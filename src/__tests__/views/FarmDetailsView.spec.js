import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import FarmDetailsView from '@/views/FarmDetailsView.vue'
import { getFarmById, getFarmProducts } from '@/services/catalogApi'
import { useCartStore } from '@/stores/cartStore'
import fallbackImage from '@/assets/image-placeholder.svg'

vi.mock('@/services/catalogApi', () => ({
    getFarmById: vi.fn(),
    getFarmProducts: vi.fn(),
}))

let wrapper
let pinia

beforeEach(() => {
    localStorage.removeItem('tierras-cart')
    pinia = createPinia()
    getFarmById.mockReset()
    getFarmById.mockResolvedValue({
        id: 7, name: 'La Saregana', address: 'Asturias',
        description: 'Granja familiar asturiana.',
    })
    getFarmProducts.mockReset()
    getFarmProducts.mockResolvedValue([])
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    localStorage.removeItem('tierras-cart')
})

async function mountPage() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/granjas/:id', component: FarmDetailsView },
            { path: '/productos/:id', component: { template: '<div />' } },
        ],
    })
    await router.push('/granjas/7')
    await router.isReady()
    wrapper = mount(FarmDetailsView, {
        global: { plugins: [pinia, router] },
    })
    await flushPromises()
    return router
}

describe('FarmDetailsView', () => {
    it('splits a long description into paragraphs without changing the text', async () => {
        const first = 'Esta granja familiar elabora productos tradicionales con leche de su propia ganaderia.'
        const rest = 'La produccion combina recetas artesanas con el trabajo diario de varias generaciones. Sus productos mantienen el vinculo con el entorno rural y ofrecen una seleccion de quesos y yogures.'
        const description = `${first} ${rest}`
        getFarmById.mockResolvedValueOnce({ id: 7, name: 'Granja', description })
        await mountPage()

        const paragraphs = wrapper.findAll('.farm-details_history p').map(paragraph => paragraph.text())
        expect(paragraphs).toEqual([first, rest])
        expect(paragraphs.join(' ')).toBe(description)
    })

    it('preserves paragraph breaks already present in the description', async () => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'Granja', description: 'Primera parte.\n\nSegunda parte.',
        })
        await mountPage()

        expect(wrapper.findAll('.farm-details_history p').map(paragraph => paragraph.text()))
            .toEqual(['Primera parte.', 'Segunda parte.'])
    })

    it('keeps a long description with no sentence breaks intact', async () => {
        const description = 'Texto de la granja '.repeat(20).trim()
        getFarmById.mockResolvedValueOnce({ id: 7, name: 'Granja', description })
        await mountPage()

        expect(wrapper.findAll('.farm-details_history p')).toHaveLength(1)
        expect(wrapper.get('.farm-details_history p').text()).toBe(description)
    })

    it('uses the banner image rather than the farm logo in the hero', async () => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'La Saregana', address: 'Asturias',
            image: 'logo.jpg', bannerImage: 'banner.jpg',
        })
        await mountPage()

        const image = wrapper.get('.farm-details_hero-image')
        expect(image.attributes('src')).toBe('banner.jpg')
        expect(image.attributes('alt')).toBe('La Saregana')
    })

    it.each([undefined, null, ''])('uses a placeholder when the banner is %s', async (bannerImage) => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'La Saregana', address: 'Asturias',
            image: 'logo.jpg', bannerImage,
        })
        await mountPage()

        const image = wrapper.get('.farm-details_hero-image')
        expect(image.attributes('src')).toBe(fallbackImage)
        expect(image.attributes('alt')).toBe('Imagen no disponible')
    })

    it('handles a broken banner and resets the fallback for the next farm', async () => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'La Saregana', address: 'Asturias',
            image: 'logo.jpg', bannerImage: 'broken-banner.jpg',
        })
        const router = await mountPage()
        await wrapper.get('.farm-details_hero-image').trigger('error')
        expect(wrapper.get('.farm-details_hero-image').attributes('src')).toBe(fallbackImage)
        expect(wrapper.get('.farm-details_hero-image').attributes('alt')).toBe('Imagen no disponible')

        getFarmById.mockResolvedValueOnce({
            id: 8, name: 'Otra granja', address: 'Asturias',
            image: 'other-logo.jpg', bannerImage: 'other-banner.jpg',
        })
        await router.push('/granjas/8')
        await flushPromises()
        expect(wrapper.get('.farm-details_hero-image').attributes('src')).toBe('other-banner.jpg')
        expect(wrapper.get('.farm-details_hero-image').attributes('alt')).toBe('Otra granja')
    })

    it('renders compact products and adds the selected quantity to the cart', async () => {
        const product = {
            id: 2, name: 'Queso artesano', description: 'Queso de la granja.',
            image: '', price: 12.5, farmName: 'La Saregana', farmAddress: 'Asturias',
        }
        getFarmProducts.mockResolvedValueOnce([product])
        await mountPage()

        const card = wrapper.get('.product-card--farm')
        expect(card.get('.product-card_link').attributes('href')).toBe('/productos/2')
        expect(card.text()).toContain(product.name)
        expect(card.get('.product-card_description').text()).toBe(product.description)
        expect(card.get('.product-card_price').text()).toBe(
            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                .format(product.price)
        )
        expect(card.get('.quantity-control_value').text()).toBe('1')
        await card.get('button[aria-label="Increase quantity"]').trigger('click')
        await card.get('button[aria-label="Increase quantity"]').trigger('click')
        expect(card.get('.quantity-control_value').text()).toBe('3')
        expect(useCartStore(pinia).items).toHaveLength(0)

        const button = card.get('button[aria-label="Add to cart"]')
        await button.trigger('click')
        const cart = useCartStore(pinia)
        expect(cart.items).toHaveLength(1)
        expect(cart.items[0]).toMatchObject({ id: product.id, price: 12.5, quantity: 3 })
        expect(card.get('.quantity-control_value').text()).toBe('1')
        await button.trigger('click')
        expect(cart.items).toHaveLength(1)
        expect(cart.items[0].quantity).toBe(4)
        expect(JSON.parse(localStorage.getItem('tierras-cart'))[0].quantity).toBe(4)
    })

    it('keeps product quantities independent and never decreases below one', async () => {
        getFarmProducts.mockResolvedValueOnce([
            { id: 2, name: 'Queso', price: 12.5 },
            { id: 3, name: 'Yogur', price: 1.1 },
        ])
        await mountPage()
        const [first, second] = wrapper.findAll('.product-card--farm')

        await first.get('button[aria-label="Decrease quantity"]').trigger('click')
        expect(first.get('.quantity-control_value').text()).toBe('1')
        await first.get('button[aria-label="Increase quantity"]').trigger('click')
        await first.get('button[aria-label="Increase quantity"]').trigger('click')
        await first.get('button[aria-label="Decrease quantity"]').trigger('click')
        expect(first.get('.quantity-control_value').text()).toBe('2')
        expect(second.get('.quantity-control_value').text()).toBe('1')
        expect(useCartStore(pinia).items).toHaveLength(0)
    })

    it('resets selected quantities when navigating to another farm', async () => {
        getFarmProducts.mockResolvedValue([{ id: 2, name: 'Queso', price: 12.5 }])
        const router = await mountPage()
        await wrapper.get('button[aria-label="Increase quantity"]').trigger('click')
        expect(wrapper.get('.quantity-control_value').text()).toBe('2')

        getFarmById.mockResolvedValueOnce({ id: 8, name: 'Otra granja', address: 'Asturias' })
        await router.push('/granjas/8')
        await flushPromises()

        expect(getFarmProducts).toHaveBeenLastCalledWith('8')
        expect(wrapper.get('h1').text()).toBe('Otra granja')
        expect(wrapper.get('.quantity-control_value').text()).toBe('1')
    })

    it('shows product loading without hiding the farm', async () => {
        getFarmProducts.mockReturnValueOnce(new Promise(() => {}))
        await mountPage()

        expect(wrapper.get('h1').text()).toBe('La Saregana')
        expect(wrapper.get('.farm-details_products [role="status"]').text())
            .toBe('Cargando productos...')
        expect(wrapper.find('.product-card').exists()).toBe(false)
    })

    it('shows the empty products message', async () => {
        await mountPage()

        expect(wrapper.get('.farm-details_products [role="status"]').text())
            .toBe('Esta granja todavía no tiene productos.')
        expect(wrapper.find('.product-card').exists()).toBe(false)
    })

    it.each([
        [new Error('No se pudieron cargar los productos.'), 'No se pudieron cargar los productos.'],
        [new TypeError('Network error'), 'No se pudo conectar con el servidor.'],
    ])('shows product failure without hiding the farm %s', async (error, message) => {
        getFarmProducts.mockRejectedValueOnce(error)
        await mountPage()

        expect(wrapper.get('h1').text()).toBe('La Saregana')
        expect(wrapper.get('.farm-details_products [role="alert"]').text()).toBe(message)
        expect(wrapper.find('.product-card').exists()).toBe(false)
    })

    it('loads and displays the farm', async () => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'La Saregana', address: 'Asturias',
            description: 'Granja familiar asturiana.',
        })
        await mountPage()
        expect(getFarmById).toHaveBeenCalledExactlyOnceWith('7')
        expect(getFarmProducts).toHaveBeenCalledExactlyOnceWith('7')
        expect(wrapper.get('h1').text()).toBe('La Saregana')
        expect(wrapper.text()).toContain('Asturias')
        expect(wrapper.get('.farm-details_history p').text())
            .toBe('Granja familiar asturiana.')
    })

    it('shows loading while the request is pending', async () => {
        getFarmById.mockReturnValueOnce(new Promise(() => {}))
        await mountPage()
        expect(wrapper.get('[role="status"]').text()).toBe('Cargando granja...')
        expect(wrapper.find('h1').exists()).toBe(false)
    })

    it.each([
        [new Error('Granja no encontrada.'), 'Granja no encontrada.'],
        [new TypeError('Network error'), 'No se pudo conectar con el servidor.'],
    ])('handles request failure %s', async (error, message) => {
        getFarmById.mockRejectedValueOnce(error)
        await mountPage()
        expect(wrapper.get('[role="alert"]').text()).toBe(message)
        expect(wrapper.find('h1').exists()).toBe(false)
    })
})
