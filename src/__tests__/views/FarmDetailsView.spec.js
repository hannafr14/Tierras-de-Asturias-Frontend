import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import FarmDetailsView from '@/views/FarmDetailsView.vue'
import { getFarmById } from '@/services/catalogApi'

vi.mock('@/services/catalogApi', () => ({ getFarmById: vi.fn() }))

let wrapper

beforeEach(() => {
    getFarmById.mockReset()
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

async function mountPage() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/granjas/:id', component: FarmDetailsView }],
    })
    await router.push('/granjas/7')
    await router.isReady()
    wrapper = mount(FarmDetailsView, {
        global: { plugins: [router] },
    })
    await flushPromises()
}

describe('FarmDetailsView', () => {
    it('loads and displays the farm', async () => {
        getFarmById.mockResolvedValueOnce({
            id: 7, name: 'La Saregana', address: 'Asturias',
            description: 'Granja familiar asturiana.',
        })
        await mountPage()
        expect(getFarmById).toHaveBeenCalledExactlyOnceWith('7')
        expect(wrapper.get('h1').text()).toBe('La Saregana')
        expect(wrapper.text()).toContain('Asturias')
        expect(wrapper.get('.farm-details_history p').text())
            .toBe('Granja familiar asturiana.')
    })

    it('shows loading while the request is pending', async () => {
        getFarmById.mockReturnValueOnce(new Promise(() => {}))
        await mountPage()
        expect(wrapper.get('[role="status"]').text()).toBe('Cargando granja...')
        expect(wrapper.find('h1').exists()).toBe(false)
    })

    it.each([
        [new Error('Granja no encontrada.'), 'Granja no encontrada.'],
        [new TypeError('Network error'), 'No se pudo conectar con el servidor.'],
    ])('handles request failure %s', async (error, message) => {
        getFarmById.mockRejectedValueOnce(error)
        await mountPage()
        expect(wrapper.get('[role="alert"]').text()).toBe(message)
        expect(wrapper.find('h1').exists()).toBe(false)
    })
})
