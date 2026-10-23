import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import ProductCard from '@/components/cards/ProductCard.vue'

const mountProductCard = () => {
    return mount(ProductCard, {
        props: {
            productId: 1,
            image: 'https://example.com/product.jpg',
            name: 'Queso Gamonéu',
            farmName: 'Finca La Vara',
            location: 'Oviedo',
            price: '12.50€',
            cartQuantity: 2,
        },
        global: {
            stubs: {
                RouterLink: RouterLinkStub,
            },
        },
    })
}

describe('ProductCard', () => {
    it('renders product information', () => {
        const wrapper = mountProductCard()

        expect(wrapper.text()).toContain('Queso Gamonéu')
        expect(wrapper.text()).toContain('Finca La Vara')
        expect(wrapper.text()).toContain('Oviedo')
        expect(wrapper.text()).toContain('12.50€')
    })

    it('emits increase when the plus button is clicked', async () => {
        const wrapper = mountProductCard()

        const increaseButton = wrapper.find('button[aria-label="Increase quantity"]')

        await increaseButton.trigger('click')

        expect(wrapper.emitted('increase')).toHaveLength(1)
    })

    it('emits decrease when the minus button is clicked', async () => {
        const wrapper = mountProductCard()

        const decreaseButton = wrapper.find('button[aria-label="Decrease quantity"]')

        await decreaseButton.trigger('click')

        expect(wrapper.emitted('decrease')).toHaveLength(1)
    })

    it('emits add-to-cart when the cart button is clicked', async () => {
        const wrapper = mountProductCard()

        const cartButton = wrapper.find('button[aria-label="Add to cart"]')

        await cartButton.trigger('click')

        expect(wrapper.emitted('add-to-cart')).toHaveLength(1)
    })

    it('links the product name to its details page', () => {
        const wrapper = mountProductCard()
        const link = wrapper.findComponent(RouterLinkStub)

        expect(link.props('to')).toBe('/productos/1')
        expect(link.text()).toBe('Queso Gamonéu')
    })
})