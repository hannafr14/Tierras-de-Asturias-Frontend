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
    it('renders the farm variant with quantity controls and without farm metadata', async () => {
        const wrapper = mountProductCard()
        await wrapper.setProps({ variant: 'farm', description: 'Queso artesano.' })

        expect(wrapper.classes()).toContain('product-card--farm')
        expect(wrapper.get('.product-card_description').text()).toBe('Queso artesano.')
        expect(wrapper.find('.product-card_farm').exists()).toBe(false)
        expect(wrapper.find('.product-card_location').exists()).toBe(false)
        expect(wrapper.get('.quantity-control_value').text()).toBe('2')
        expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/productos/1')

        await wrapper.get('button[aria-label="Increase quantity"]').trigger('click')
        await wrapper.get('button[aria-label="Decrease quantity"]').trigger('click')
        expect(wrapper.emitted('increase')).toHaveLength(1)
        expect(wrapper.emitted('decrease')).toHaveLength(1)
        await wrapper.get('button[aria-label="Add to cart"]').trigger('click')
        expect(wrapper.emitted('add-to-cart')).toHaveLength(1)
        wrapper.unmount()
    })

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
