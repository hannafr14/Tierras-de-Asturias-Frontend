export async function getProducts() {
    const response = await fetch('/api/products')

    if (!response.ok) {
        throw new Error('Failed to load products')
    }

    return response.json()
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

    return response.json()
}