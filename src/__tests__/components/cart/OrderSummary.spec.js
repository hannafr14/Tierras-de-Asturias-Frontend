import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderSummary from '@/components/cart/OrderSummary.vue'

const mountOrderSummary = (props = {}) => {
    return mount(OrderSummary, {
        props: {
            subtotal: 25,
            shipping: 0,
            taxes: 4.34,
            total: 25,
            items: [
                {
                    id: 1,
                    name: 'Queso Gamoneu',
                    image: 'https://example.com/queso.jpg',
                    quantity: 2,
                    price: 12.5,
                },
            ],
            ...props,
        },
        global: {
            stubs: {
                RouterLink: {
                    props: ['to'],
                    template: '<a :href="to"><slot /></a>',
                },
            },
        },
    })
}

describe('OrderSummary', () => {
    it('renders order summary data', () => {
        const wrapper = mountOrderSummary()

        expect(wrapper.text()).toContain('Resumen del pedido')
        expect(wrapper.text()).toContain('Queso Gamoneu')
        expect(wrapper.text()).toContain('2 x 12.50')
        expect(wrapper.text()).toContain('Subtotal')
        expect(wrapper.text()).toContain('25.00')
        expect(wrapper.text()).toContain('Gratis')
        expect(wrapper.text()).toContain('Impuestos')
        expect(wrapper.text()).toContain('4.34')
        expect(wrapper.get('.order-summary_button').text()).toBe('Continuar con el pedido')
        expect(wrapper.get('.order-summary_button').attributes('href')).toBe('/checkout')
    })

    it('renders the total amount', () => {
        const wrapper = mountOrderSummary({
            total: 32.75,
        })

        expect(wrapper.text()).toContain('Total')
        expect(wrapper.text()).toContain('32.75')
    })
})
