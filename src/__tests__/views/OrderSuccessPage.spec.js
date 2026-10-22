import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import OrderSuccessPage from '@/views/OrderSuccessPage.vue'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const mountOrderSuccessPage = (profile = null) => {
    const pinia = createPinia()
    setActivePinia(pinia)

    if (profile) {
        useAuthStore(pinia).setUser(profile)
    }

    return mount(OrderSuccessPage, {
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

describe('OrderSuccessPage', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('renders the confirmation page', () => {
        const wrapper = mountOrderSuccessPage()

        expect(wrapper.text()).toContain('Pedido confirmado')
        expect(wrapper.text()).toContain('Gracias por apoyar a los productores locales de Asturias')
        expect(wrapper.text()).toContain('Seguir Comprando')
        expect(wrapper.text()).not.toContain('Ver mis pedidos')
        expect(wrapper.findAll('.order-success-page_actions a')).toHaveLength(1)
    })

    it('renders confirmed order information from sessionStorage', async () => {
        sessionStorage.setItem(
            'tierras-last-order',
            JSON.stringify({
                orderNumber: 'ORD-123',
                date: '2026-10-12T10:30:00',
                total: 32.3,
            })
        )

        const wrapper = mountOrderSuccessPage()

        await nextTick()

        expect(wrapper.text()).toContain('ORD-123')
        expect(wrapper.text()).toContain('32,30')
    })

    it('clears the cart when the confirmation page opens', async () => {
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

        mount(OrderSuccessPage, {
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

        await nextTick()

        expect(cartStore.items).toHaveLength(0)
    })

    it('has a continue shopping link to the products page', () => {
        const wrapper = mountOrderSuccessPage()

        const continueShoppingLink = wrapper.find('.order-success-page_primary')

        expect(continueShoppingLink.exists()).toBe(true)
        expect(continueShoppingLink.attributes('href')).toBe('/productos')
    })

    it('shows my orders and continue shopping for an authenticated user', () => {
        const wrapper = mountOrderSuccessPage({
            id: 1,
            firstName: 'Ana',
            email: 'ana@example.com',
        })

        const myOrdersLink = wrapper.get('.order-success-page_primary')

        expect(myOrdersLink.text()).toBe('Ver mis pedidos')
        expect(myOrdersLink.attributes('href')).toBe('/mi-cuenta')
        expect(wrapper.get('.order-success-page_secondary').attributes('href'))
            .toBe('/productos')
        expect(wrapper.findAll('.order-success-page_actions a')).toHaveLength(2)
    })
})