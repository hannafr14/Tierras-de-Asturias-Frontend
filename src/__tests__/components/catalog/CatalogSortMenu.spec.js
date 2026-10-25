import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CatalogSortMenu from '@/components/catalog/CatalogSortMenu.vue'

const options = [
    { value: 'default', label: 'Por defecto' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
    { value: 'name-desc', label: 'Nombre: Z-A' },
]
let wrapper

afterEach(() => wrapper?.unmount())

function mountMenu(modelValue = 'default') {
    wrapper = mount(CatalogSortMenu, {
        props: { modelValue, options },
        attachTo: document.body,
    })
    return wrapper
}

describe('CatalogSortMenu', () => {
    it('renders the supplied options and marks the current selection', () => {
        mountMenu('name-desc')

        expect(wrapper.get('summary').text()).toBe('Filtros')
        expect(wrapper.findAll('button').map(button => button.text()))
            .toEqual(options.map(option => option.label))
        expect(wrapper.get('button[aria-pressed="true"]').text()).toBe('Nombre: Z-A')
    })

    it('emits the selected value, closes the list and returns focus to its trigger', async () => {
        mountMenu()
        wrapper.get('details').element.open = true

        await wrapper.findAll('button')[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')).toEqual([['name-asc']])
        expect(wrapper.get('details').element.open).toBe(false)
        expect(document.activeElement).toBe(wrapper.get('summary').element)
    })

    it('closes on Escape without changing the selected sort', async () => {
        mountMenu('name-desc')
        wrapper.get('details').element.open = true

        await wrapper.findAll('button')[1].trigger('keydown', { key: 'Escape' })

        expect(wrapper.get('details').element.open).toBe(false)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(document.activeElement).toBe(wrapper.get('summary').element)
    })

    it('reflects a change to the parent selection', async () => {
        mountMenu()

        await wrapper.setProps({ modelValue: 'name-asc' })

        expect(wrapper.get('button[aria-pressed="true"]').text()).toBe('Nombre: A-Z')
    })
})
