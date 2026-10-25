import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import GranjasPage from '@/views/GranjasPage.vue'
import MapSection from '@/components/map/MapSection.vue'
import FarmCard from '@/components/cards/FarmCard.vue'
import CategoryFilter from '@/components/catalog/CategoryFilter.vue'

vi.mock('@/services/catalogApi', () => {
    return {
        getFarms: vi.fn(),
    }
})

import { getFarms } from '@/services/catalogApi'

beforeEach(() => {
    vi.clearAllMocks()

    getFarms.mockResolvedValue([
        {
            id: 1,
            name: 'Finca La Vara',
            address: 'Oviedo',
            image: 'https://example.com/finca.jpg',
            categories: ['Quesos', 'Miel'],
            latitude: 43.36,
            longitude: -5.84,
        },
        {
            id: 2,
            name: 'Llagar Asturias',
            address: 'Gijon',
            image: 'https://example.com/llagar.jpg',
            categories: ['Sidra'],
            latitude: 43.53,
            longitude: -5.66,
        },
    ])
})

describe('GranjasPage', () => {
    it('shares farm selection between map markers and cards', async () => {
        const wrapper = mount(GranjasPage, {
            global: {
                stubs: {
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => setTimeout(resolve, 0))

        const map = wrapper.findComponent(MapSection)
        await map.vm.$emit('update:selectedFarmId', 2)

        expect(map.props('selectedFarmId')).toBe(2)

        await wrapper.findAllComponents(FarmCard)[0].trigger('click')

        expect(map.props('selectedFarmId')).toBe(1)
    })

    it('loads and renders farms', async () => {
        const wrapper = mount(GranjasPage, {
            global: {
                stubs: {
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        expect(getFarms).toHaveBeenCalled()
        expect(wrapper.text()).toContain('Finca La Vara')
        expect(wrapper.text()).toContain('Llagar Asturias')
        expect(wrapper.text()).toContain('Oviedo')
        expect(wrapper.text()).toContain('Gijon')
        expect(wrapper.text()).toContain('Quesos')
        expect(wrapper.text()).toContain('Sidra')
    })

    it('filters farms by search query', async () => {
        const wrapper = mount(GranjasPage, {
            global: {
                stubs: {
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })

        await new Promise((resolve) => {
            setTimeout(resolve, 0)
        })

        const searchInput = wrapper.find('input[type="search"]')

        await searchInput.setValue('llagar')

        expect(wrapper.text()).toContain('Llagar Asturias')
        expect(wrapper.text()).not.toContain('Finca La Vara')
    })
})

describe('farm name sorting', () => {
    let wrapper
    let source

    beforeEach(() => {
        source = [
            { id: 1, name: 'Finca Zeta', categories: ['Miel'] },
            { id: 2, name: 'Finca \u00c1lamo', categories: ['Miel'] },
            { id: 3, name: 'Finca beta', categories: ['Sidra'] },
        ].map(farm => ({ ...farm, address: 'Oviedo', image: '/farm.jpg' }))
        getFarms.mockResolvedValue(source)
    })

    afterEach(() => wrapper?.unmount())

    async function mountPage() {
        wrapper = mount(GranjasPage, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub,
                    CatalogLayout: {
                        template: '<div><slot name="content" /><slot name="map" /></div>',
                    },
                    MapSection: true,
                },
            },
        })
        await flushPromises()
    }

    const renderedNames = () => wrapper.findAllComponents(FarmCard)
        .map(card => card.props('name'))

    it('keeps the API order by default and offers only alphabetical sorting', async () => {
        await mountPage()

        expect(renderedNames()).toEqual(source.map(farm => farm.name))
        expect(wrapper.findAll('.catalog-sort_list button')).toHaveLength(3)
        expect(wrapper.get('.catalog-sort_list').text()).not.toContain('Precio')
    })

    it.each([
        [1, [2, 3, 1]],
        [2, [1, 3, 2]],
    ])('sorts with option %s using Spanish names without mutating the map data', async (option, ids) => {
        await mountPage()
        const map = wrapper.findComponent(MapSection)
        await map.vm.$emit('update:selectedFarmId', 2)

        await wrapper.findAll('.catalog-sort_list button')[option].trigger('click')

        expect(renderedNames()).toEqual(ids.map(id => source.find(farm => farm.id === id).name))
        expect(source.map(farm => farm.id)).toEqual([1, 2, 3])
        expect(map.props('farms').map(farm => farm.id)).toEqual([1, 2, 3])
        expect(map.props('selectedFarmId')).toBe(2)
    })

    it('restores the original order when choosing Por defecto', async () => {
        await mountPage()
        await wrapper.findAll('.catalog-sort_list button')[1].trigger('click')

        await wrapper.findAll('.catalog-sort_list button')[0].trigger('click')

        expect(renderedNames()).toEqual(source.map(farm => farm.name))
    })

    it('combines sorting with the selected category and search query', async () => {
        await mountPage()
        await wrapper.findAll('.catalog-sort_list button')[1].trigger('click')
        await wrapper.findComponent(CategoryFilter).vm.$emit('select', 'Miel')
        await wrapper.get('input[type="search"]').setValue('finca')
        expect(renderedNames()).toEqual([source[1].name, source[0].name])

        await wrapper.get('input[type="search"]').setValue('zeta')
        expect(renderedNames()).toEqual([source[0].name])
    })

    it('keeps the empty state when sorted results have no search matches', async () => {
        await mountPage()
        await wrapper.findAll('.catalog-sort_list button')[2].trigger('click')
        await wrapper.get('input[type="search"]').setValue('unmatched farm')

        expect(renderedNames()).toEqual([])
        expect(wrapper.text()).toContain('No hay granjas disponibles.')
    })
})
