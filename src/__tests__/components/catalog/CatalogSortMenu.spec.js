import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import CatalogSortMenu from '@/components/catalog/CatalogSortMenu.vue'

const options = [
    { value: 'default', label: 'Por defecto' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
    { value: 'name-desc', label: 'Nombre: Z-A' },
]
let wrapper

afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
})

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

    it('closes outside without changing the selection or moving focus from the clicked input', () => {
        mountMenu('name-desc')
        wrapper.get('details').element.open = true
        const input = document.createElement('input')
        document.body.append(input)
        try {
            input.focus()
            input.click()

            expect(wrapper.get('details').element.open).toBe(false)
            expect(wrapper.emitted('update:modelValue')).toBeUndefined()
            expect(document.activeElement).toBe(input)
        } finally {
            input.remove()
        }
    })

    it('closes even when an outside control stops click propagation', () => {
        mountMenu()
        wrapper.get('details').element.open = true
        const button = document.createElement('button')
        button.addEventListener('click', event => event.stopPropagation())
        document.body.append(button)
        try {
            button.click()
            expect(wrapper.get('details').element.open).toBe(false)
        } finally {
            button.remove()
        }
    })

    it('does not close for a click inside the list without selecting an option', async () => {
        mountMenu()
        wrapper.get('details').element.open = true

        await wrapper.get('.catalog-sort_list').trigger('click')

        expect(wrapper.get('details').element.open).toBe(true)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('removes its document listener on unmount', () => {
        mountMenu()
        const removeListener = vi.spyOn(document, 'removeEventListener')

        wrapper.unmount()
        wrapper = undefined

        expect(removeListener).toHaveBeenCalledWith('click', expect.any(Function), true)
    })

    it('closes on deactivation and handles outside clicks after reactivation', async () => {
        const visible = ref(true)
        wrapper = mount({
            components: { CatalogSortMenu },
            setup: () => ({ visible, options }),
            template: '<KeepAlive><CatalogSortMenu v-if="visible" :options="options" /></KeepAlive>',
        }, { attachTo: document.body })
        wrapper.get('details').element.open = true

        visible.value = false
        await nextTick()
        visible.value = true
        await nextTick()
        expect(wrapper.get('details').element.open).toBe(false)

        wrapper.get('details').element.open = true
        document.body.click()
        expect(wrapper.get('details').element.open).toBe(false)
    })
})
