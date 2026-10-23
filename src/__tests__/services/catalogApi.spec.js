import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFarmById, getFarmProducts } from '@/services/catalogApi'

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
        data: [{ id: 2, farmId: 7 }],
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
