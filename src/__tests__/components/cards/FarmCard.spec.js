import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FarmCard from '@/components/cards/FarmCard.vue'
import fallbackImage from '@/assets/image-placeholder.svg'

const mountFarmCard = () => {
    return mount(FarmCard, {
        props: {
            image: 'https://example.com/farm.jpg',
            name: 'Finca La Vara',
            location: 'Oviedo',
            tags: ['Quesos', 'Miel'],
        },
    })
}

describe('FarmCard', () => {
    it('emits the farm action without propagating its click to the card', async () => {
        const wrapper = mountFarmCard()
        await wrapper.get('button').trigger('click')
        expect(wrapper.emitted('view-farm')).toHaveLength(1)
        expect(wrapper.emitted('click')).toBeUndefined()
        wrapper.unmount()
    })

    it('replaces a broken farm image with the placeholder', async () => {
        const wrapper = mountFarmCard()
        await wrapper.get('.farm-card_image').trigger('error')
        expect(wrapper.get('.farm-card_image').attributes('src')).toBe(fallbackImage)
        wrapper.unmount()
    })

    it('renders farm information', () => {
        const wrapper = mountFarmCard()

        expect(wrapper.text()).toContain('Finca La Vara')
        expect(wrapper.text()).toContain('Oviedo')
        expect(wrapper.text()).toContain('Quesos')
        expect(wrapper.text()).toContain('Miel')
        expect(wrapper.text()).toContain('Ver granja')
    })
})
