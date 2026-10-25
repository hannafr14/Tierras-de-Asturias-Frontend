import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '@/stores/cartStore'

const product = {
    id: 1,
    name: 'Queso Gamoneu',
    image: 'https://example.com/queso.jpg',
    farmName: 'Finca La Vara',
    price: 12.5,
}

describe('cartStore', () => {
    beforeEach(() => {
        localStorage.clear()
        setActivePinia(createPinia())
    })

    it.each([0, null, undefined, -1, NaN, Infinity, '12.5'])(
        'does not add a product with invalid price %s', price => {
            const cartStore = useCartStore()

            cartStore.addToCart({ ...product, price })

            expect(cartStore.items).toEqual([])
            expect(cartStore.total).toBe(0)
            expect(localStorage.getItem('tierras-cart')).toBeNull()
        }
    )

    it('hides saved products without prices while preserving valid cart quantities', () => {
        const valid = { ...product, quantity: 3 }
        localStorage.setItem('tierras-cart', JSON.stringify([
            valid, { ...product, id: 2, price: 0, quantity: 2 },
            { ...product, id: 3, price: null, quantity: 1 },
        ]))

        const cartStore = useCartStore()

        expect(cartStore.items).toEqual([valid])
        expect(cartStore.itemsCount).toBe(1)
        expect(cartStore.subtotal).toBe(37.5)
    })

    it('increases product quantity', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.increaseQuantity(product.id)

        expect(cartStore.items[0].quantity).toBe(2)
    })

    it('decreases product quantity', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.increaseQuantity(product.id)
        cartStore.decreaseQuantity(product.id)

        expect(cartStore.items[0].quantity).toBe(1)
    })

    it('does not decrease product quantity below one', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.decreaseQuantity(product.id)

        expect(cartStore.items[0].quantity).toBe(1)
    })

    it('updates localStorage when product quantity changes', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.increaseQuantity(product.id)

        const storedCart = JSON.parse(localStorage.getItem('tierras-cart'))

        expect(storedCart[0].quantity).toBe(2)
    })

    it('removes a product from the cart', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.addToCart({
            id: 2,
            name: 'Sidra Natural',
            image: 'https://example.com/sidra.jpg',
            farmName: 'Llagar Asturias',
            price: 4.2,
        })

        cartStore.removeFromCart(product.id)

        expect(cartStore.items).toHaveLength(1)
        expect(cartStore.items[0].name).toBe('Sidra Natural')
    })

    it('removes the last product from the cart', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)

        cartStore.removeFromCart(product.id)

        expect(cartStore.items).toHaveLength(0)
    })

    it('calculates the subtotal', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)
        cartStore.addToCart({
            id: 2,
            name: 'Sidra Natural',
            image: 'https://example.com/sidra.jpg',
            farmName: 'Llagar Asturias',
            price: 4.2,
        })

        cartStore.increaseQuantity(product.id)

        expect(cartStore.subtotal).toBe(29.2)
    })

    it('calculates the total amount', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)

        expect(cartStore.total).toBe(12.5)
    })

    it('recalculates the total after cart changes', () => {
        const cartStore = useCartStore()

        cartStore.addToCart(product)

        expect(cartStore.total).toBe(12.5)

        cartStore.increaseQuantity(product.id)

        expect(cartStore.total).toBe(25)

        cartStore.removeFromCart(product.id)

        expect(cartStore.total).toBe(0)
    })
})
