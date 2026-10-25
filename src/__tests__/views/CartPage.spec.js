import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import CartPage from '@/views/CartPage.vue'
import { useCartStore } from '@/stores/cartStore'

const mountCartPage = () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    return mount(CartPage, {
        global: {
            plugins: [pinia],
            stubs: {
                RouterLink: {
                    props: ['to'],
                    template: '<a :href="to"><slot /></a>',
                },
            },
        },
    })
}

describe('CartPage', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders products stored in the cart', () => {
        const pinia = createPinia()
        setActivePinia(pinia)

        const cartStore = useCartStore()

        cartStore.addToCart({
            id: 1,
            name: 'Queso Gamoneu',
            image: 'https://example.com/queso.jpg',
            farmName: 'Finca La Vara',
            price: 12.5,
        })

        const wrapper = mount(CartPage, {
            global: {
                plugins: [pinia],
                stubs: {
                    RouterLink: {
                        props: ['to'],
                        template: '<a><slot /></a>',
                    },
                },
            },
        })

        expect(wrapper.text()).toContain('Queso Gamoneu')
        expect(wrapper.text()).toContain('Finca La Vara')
        expect(wrapper.text()).toContain('12.5')
    })

    it('loads cart products from localStorage', () => {
        localStorage.setItem(
            'tierras-cart',
            JSON.stringify([
                {
                    id: 1,
                    name: 'Sidra Natural',
                    image: 'https://example.com/sidra.jpg',
                    farmName: 'Llagar Asturias',
                    price: 4.2,
                    quantity: 2,
                },
            ])
        )

        const wrapper = mountCartPage()

        expect(wrapper.text()).toContain('Sidra Natural')
        expect(wrapper.text()).toContain('Llagar Asturias')
        expect(wrapper.get('.cart-item_price').text()).toBe('8.40\u20ac')
    })

    it.each([
        [12.5, 1, '12.50'],
        [12.5, 3, '37.50'],
        [4.2, 2, '8.40'],
        [0.1, 3, '0.30'],
    ])('displays the line total for unit price %s and quantity %s', (price, quantity, total) => {
        localStorage.setItem('tierras-cart', JSON.stringify([
            { id: 1, name: 'Queso', image: '/queso.jpg', farmName: 'Finca', price, quantity },
        ]))
        const wrapper = mountCartPage()

        expect(wrapper.get('.cart-item_price').text()).toBe(`${total}\u20ac`)
        expect(wrapper.get('.order-summary_total strong').text()).toBe(`${total}\u20ac`)
        expect(useCartStore().items[0].price).toBe(price)
        wrapper.unmount()
    })

    it('updates each line and the summary when quantity changes without changing unit prices', async () => {
        localStorage.setItem('tierras-cart', JSON.stringify([
            { id: 1, name: 'Sidra', image: '/sidra.jpg', farmName: 'Llagar', price: 4.2, quantity: 2 },
            { id: 2, name: 'Queso', image: '/queso.jpg', farmName: 'Finca', price: 12.5, quantity: 1 },
        ]))
        const wrapper = mountCartPage()
        const first = wrapper.findAll('.cart-item')[0]
        const second = wrapper.findAll('.cart-item')[1]

        expect(first.get('.cart-item_price').text()).toBe('8.40\u20ac')
        expect(second.get('.cart-item_price').text()).toBe('12.50\u20ac')
        expect(wrapper.get('.order-summary_total strong').text()).toBe('20.90\u20ac')

        await first.get('button[aria-label="Increase quantity"]').trigger('click')

        expect(first.get('.cart-item_price').text()).toBe('12.60\u20ac')
        expect(second.get('.cart-item_price').text()).toBe('12.50\u20ac')
        expect(wrapper.get('.order-summary_total strong').text()).toBe('25.10\u20ac')

        await first.get('button[aria-label="Decrease quantity"]').trigger('click')

        expect(first.get('.cart-item_price').text()).toBe('8.40\u20ac')
        expect(wrapper.get('.order-summary_total strong').text()).toBe('20.90\u20ac')
        expect(useCartStore().items[0].price).toBe(4.2)
        expect(JSON.parse(localStorage.getItem('tierras-cart'))[0])
            .toMatchObject({ price: 4.2, quantity: 2 })
        wrapper.unmount()
    })

    it('renders the empty cart state', () => {
        const wrapper = mountCartPage()

        expect(wrapper.text()).toContain('Tu cesta está vacía.')
    })

    it('has a continue shopping link to the products page', () => {
        const wrapper = mountCartPage()

        const continueShoppingLink = wrapper.find('.cart-page_continue')

        expect(continueShoppingLink.exists()).toBe(true)
        expect(continueShoppingLink.attributes('href')).toBe('/productos')
    })

    it('has a checkout link when the cart has products', () => {
        const pinia = createPinia()
        setActivePinia(pinia)

        const cartStore = useCartStore()

        cartStore.addToCart({
            id: 1,
            name: 'Queso Gamoneu',
            image: 'https://example.com/queso.jpg',
            farmName: 'Finca La Vara',
            price: 12.5,
        })

        const wrapper = mount(CartPage, {
            global: {
                plugins: [pinia],
                stubs: {
                    RouterLink: {
                        props: ['to'],
                        template: '<a :href="to"><slot /></a>',
                    },
                },
            },
        })

        const checkoutLink = wrapper.find('.order-summary_button')

        expect(checkoutLink.exists()).toBe(true)
        expect(checkoutLink.attributes('href')).toBe('/checkout')
    })

    it('keeps cart data available before navigating to checkout', () => {
        const pinia = createPinia()
        setActivePinia(pinia)

        const cartStore = useCartStore()

        cartStore.addToCart({
            id: 1,
            name: 'Queso Gamoneu',
            image: 'https://example.com/queso.jpg',
            farmName: 'Finca La Vara',
            price: 12.5,
        })

        mount(CartPage, {
            global: {
                plugins: [pinia],
                stubs: {
                    RouterLink: {
                        props: ['to'],
                        template: '<a :href="to"><slot /></a>',
                    },
                },
            },
        })

        expect(cartStore.items).toHaveLength(1)
        expect(cartStore.items[0].name).toBe('Queso Gamoneu')
    })

    it('does not show checkout link when the cart is empty', () => {
        const wrapper = mountCartPage()

        const checkoutLink = wrapper.find('.order-summary_button')

        expect(checkoutLink.exists()).toBe(false)
    })
})
