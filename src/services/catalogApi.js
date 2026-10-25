import { hasProductPrice } from '@/utils/productAvailability'

export async function getProducts() {
    const response = await fetch('/api/products')

    if (!response.ok) {
        throw new Error('Failed to load products')
    }

    const products = await response.json()
    return products.filter(hasProductPrice)
}

export async function getFarms() {
    const response = await fetch('/api/farms')

    if (!response.ok) {
        throw new Error('Failed to load farms')
    }

    return response.json()
}

export async function getProductById(id) {
    const response = await fetch(
        `/api/products/${encodeURIComponent(id)}`
    )

    if (response.status === 404) {
        throw new Error('Producto no encontrado.')
    }

    if (!response.ok) {
        throw new Error(
            'No se pudo cargar el producto. Inténtalo de nuevo.'
        )
    }

    const product = await response.json()

    if (!hasProductPrice(product)) {
        throw new Error('Producto no encontrado.')
    }

    return product
}

export async function getFarmById(id) {
    const response = await fetch(
        `/api/farms/${encodeURIComponent(id)}`
    )

    if (response.status === 404) {
        throw new Error('Granja no encontrada.')
    }

    if (!response.ok) {
        throw new Error(
            'No se pudo cargar la granja. Inténtalo de nuevo.'
        )
    }

    return response.json()
}

export async function getFarmProducts(id) {
    const response = await fetch(
        `/api/farms/${encodeURIComponent(id)}/products`
    )

    if (response.status === 404) {
        throw new Error('Granja no encontrada.')
    }

    if (!response.ok) {
        throw new Error(
            'No se pudieron cargar los productos de la granja.'
        )
    }

    const products = await response.json()
    return products.filter(hasProductPrice)
}
