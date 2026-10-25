import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { hasProductPrice } from '@/utils/productAvailability'

const CART_STORAGE_KEY = 'tierras-cart'

function getStoredCartItems() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)

    if (!storedCart) {
        return []
    }

    return JSON.parse(storedCart).filter(hasProductPrice)
}

export const useCartStore = defineStore('cart', () => {
    const items = ref(getStoredCartItems())

    const itemsCount = computed(() => {
        return items.value.length
    })

    const subtotal = computed(() => {
        return items.value.reduce((total, item) => {
            return total + item.price * item.quantity
        }, 0)
    })

    const shipping = computed(() => {
        return items.value.length === 0 ? 0 : 0
    })

    const taxes = computed(() => {
        return subtotal.value - subtotal.value / 1.21
    })

    const total = computed(() => {
        return subtotal.value + shipping.value
    })

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
    }

    function addToCart(product) {
        if (!hasProductPrice(product)) {
            return
        }

        const existingItem = items.value.find((item) => {
            return item.id === product.id
        })

        if (existingItem) {
            existingItem.quantity += 1
            saveCart()
            return
        }

        items.value.push({
            id: product.id,
            name: product.name,
            image: product.image,
            farmName: product.farmName,
            price: product.price,
            quantity: 1,
        })

        saveCart()
    }

    function increaseQuantity(productId) {
        const item = items.value.find((item) => {
            return item.id === productId
        })

        if (!item) {
            return
        }

        item.quantity += 1
        saveCart()
    }

    function decreaseQuantity(productId) {
        const item = items.value.find((item) => {
            return item.id === productId
        })

        if (!item || item.quantity === 1) {
            return
        }

        item.quantity -= 1
        saveCart()
    }

    function removeFromCart(productId) {
        items.value = items.value.filter((item) => {
            return item.id !== productId
        })

        saveCart()
    }

    function clearCart() {
        items.value = []
        saveCart()
    }

    return {
        items,
        itemsCount,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        shipping,
        taxes,
        total,
    }
})
