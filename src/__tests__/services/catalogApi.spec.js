import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFarmById, getFarmProducts, getProductById, getProducts } from '@/services/catalogApi'

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe.each([
    {
        name: 'getFarmById',
        load: getFarmById,
        url: '/api/farms/7',
        data: { id: 7, name: 'La Saregana' },
        error: 'No se pudo cargar la granja. Inténtalo de nuevo.',
    },
    {
        name: 'getFarmProducts',
        load: getFarmProducts,
        url: '/api/farms/7/products',
        data: [{ id: 2, farmId: 7, price: 12.5 }],
        error: 'No se pudieron cargar los productos de la granja.',
    },
])('$name', ({ load, url, data, error }) => {
    it('requests the correct URL and returns data', async () => {
        fetch.mockResolvedValueOnce({
            ok: true, status: 200, json: async () => data,
        })
        await expect(load(7)).resolves.toEqual(data)
        expect(fetch).toHaveBeenCalledExactlyOnceWith(url)
    })

    it('handles an unknown farm', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 404 })
        await expect(load(7)).rejects.toThrow('Granja no encontrada.')
    })

    it('handles a server error', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 500 })
        await expect(load(7)).rejects.toThrow(error)
    })

    it('propagates a network error', async () => {
        fetch.mockRejectedValueOnce(new TypeError('Network error'))
        await expect(load(7)).rejects.toThrow(TypeError)
    })
})

it('returns an empty list for a farm without products', async () => {
    fetch.mockResolvedValueOnce({
        ok: true, status: 200, json: async () => [],
    })
    await expect(getFarmProducts(7)).resolves.toEqual([])
})

describe.each([
    { name: 'getProducts', load: () => getProducts(), url: '/api/products' },
    { name: 'getFarmProducts', load: () => getFarmProducts(7), url: '/api/farms/7/products' },
])('$name product visibility', ({ load, url }) => {
    it('returns only products with a positive numeric price without changing source data', async () => {
        const visible = { id: 1, price: 12.5 }
        const inexpensive = { id: 2, price: 0.01 }
        const data = [visible, { id: 3, price: 0 }, { id: 4, price: null },
            { id: 5 }, { id: 6, price: -1 }, { id: 7, price: NaN },
            { id: 8, price: Infinity }, { id: 9, price: '12.5' }, inexpensive]
        const original = [...data]
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => data })

        await expect(load()).resolves.toEqual([visible, inexpensive])
        expect(fetch).toHaveBeenCalledExactlyOnceWith(url)
        expect(data).toEqual(original)
    })

    it('returns an empty list when every product has no valid price', async () => {
        fetch.mockResolvedValueOnce({
            ok: true, status: 200, json: async () => [{ id: 1, price: 0 }],
        })

        await expect(load()).resolves.toEqual([])
    })
})

describe('getProductById product visibility', () => {
    it.each([0, null, undefined, -1, NaN, Infinity, '12.5'])(
        'hides a direct product link with invalid price %s', async price => {
            fetch.mockResolvedValueOnce({
                ok: true, status: 200, json: async () => ({ id: 7, price }),
            })

            await expect(getProductById(7)).rejects.toThrow('Producto no encontrado.')
        }
    )

    it('returns a product with a confirmed price', async () => {
        const product = { id: 7, price: 12.5 }
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => product })

        await expect(getProductById(7)).resolves.toEqual(product)
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/products/7')
    })

    it('keeps the existing not-found response', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 404 })

        await expect(getProductById(7)).rejects.toThrow('Producto no encontrado.')
    })
})
