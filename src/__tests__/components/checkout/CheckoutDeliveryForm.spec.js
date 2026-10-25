import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckoutDeliveryForm from '@/components/checkout/CheckoutDeliveryForm.vue'

let wrapper
afterEach(() => wrapper?.unmount())

function mountForm(phone = '') {
    const form = { firstName: '', lastName: '', city: '', postalCode: '',
        streetAddress: '', apartment: '', phone }
    wrapper = mount(CheckoutDeliveryForm, { props: { modelValue: form } })
    return { form, input: wrapper.get('input[type="tel"]') }
}

describe('CheckoutDeliveryForm phone input', () => {
    it.each([
        ['abc', ''],
        ['\u0430\u0431\u0432', ''],
        ['612abc345678', '612345678'],
        ['+34 612-345-678', '+34 612-345-678'],
        ['Phone: +34 (612) 345-678!', ' +34 612 345-678'],
        ['612\ud83d\ude00345678', '612345678'],
        ['+34\u00a0612\u202f345\u00a0678', '+34\u00a0612\u202f345\u00a0678'],
        ['612\n345\t678', '612345678'],
    ])('cleans typed or pasted text %s immediately', async (value, expected) => {
        const { form, input } = mountForm()

        await input.setValue(value)

        expect(input.element.value).toBe(expected)
        expect(form.phone).toBe(expected)
    })

    it('allows clearing the phone field', async () => {
        const { form, input } = mountForm('612345678')

        await input.setValue('')

        expect(form.phone).toBe('')
        expect(input.element.value).toBe('')
    })

    it.each([
        ['612345678999', '612345678'],
        ['612 345 678 999', '612 345 678'],
        ['+34612345678999', '+34612345678'],
        ['+34 612-345-678-999', '+34 612-345-678'],
    ])('limits the digits in pasted or autofilled text %s', async (value, expected) => {
        const { form, input } = mountForm()

        await input.setValue(value)

        expect(input.element.value).toBe(expected)
        expect(form.phone).toBe(expected)
    })

    it.each(['612345678', '+34612345678'])(
        'blocks extra typed digits in the middle of a full phone %s', phone => {
            const { form, input } = mountForm(phone)
            input.element.setSelectionRange(5, 5)
            const event = new InputEvent('beforeinput', {
                bubbles: true, cancelable: true, inputType: 'insertText', data: '9',
            })

            input.element.dispatchEvent(event)

            expect(event.defaultPrevented).toBe(true)
            expect(input.element.value).toBe(phone)
            expect(form.phone).toBe(phone)
            expect(input.element.selectionStart).toBe(5)
        }
    )

    it('allows replacing a selected digit even when the phone is full', () => {
        const { input } = mountForm('612345678')
        input.element.setSelectionRange(5, 6)
        const event = new InputEvent('beforeinput', {
            bubbles: true, cancelable: true, inputType: 'insertText', data: '9',
        })

        input.element.dispatchEvent(event)

        expect(event.defaultPrevented).toBe(false)
    })

    it('preserves the cursor position when removing letters in the middle', async () => {
        const { form, input } = mountForm('612345678')
        input.element.value = '61234abc5678'
        input.element.setSelectionRange(8, 8)

        await input.trigger('input')

        expect(form.phone).toBe('612345678')
        expect(input.element.value).toBe('612345678')
        expect(input.element.selectionStart).toBe(5)
        expect(input.element.selectionEnd).toBe(5)
    })

    it('cleans composed text after composition finishes', async () => {
        const { form, input } = mountForm('6')
        input.element.value = '6\u0430'
        input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }))
        expect(form.phone).toBe('6')

        await input.trigger('compositionend')

        expect(input.element.value).toBe('6')
        expect(form.phone).toBe('6')
    })

    it('does not restrict letters in other delivery fields', async () => {
        const { form } = mountForm()

        await wrapper.findAll('input')[0].setValue('Ana Garcia')

        expect(form.firstName).toBe('Ana Garcia')
    })
})

describe('CheckoutDeliveryForm address input', () => {
    it.each([
        ['00301', '00301'],
        ['00abc301', '00301'],
        ['00301999', '00301'],
        [' 00-301 ', '00301'],
        ['abc', ''],
        ['', ''],
    ])('cleans and limits the postal code %s without losing leading zeros', async (value, expected) => {
        const { form } = mountForm()
        const input = wrapper.get('input[autocomplete="postal-code"]')

        await input.setValue(value)

        expect(input.element.value).toBe(expected)
        expect(form.postalCode).toBe(expected)
        expect(input.attributes('inputmode')).toBe('numeric')
        expect(input.attributes('pattern')).toBe('[0-9]{5}')
        expect(input.attributes('maxlength')).toBeUndefined()
    })

    it('blocks extra postal digits in the middle without changing existing digits', async () => {
        const { form } = mountForm()
        const input = wrapper.get('input[autocomplete="postal-code"]')
        await input.setValue('00301')
        input.element.setSelectionRange(2, 2)
        const event = new InputEvent('beforeinput', {
            bubbles: true, cancelable: true, inputType: 'insertText', data: '9',
        })

        input.element.dispatchEvent(event)

        expect(event.defaultPrevented).toBe(true)
        expect(input.element.value).toBe('00301')
        expect(form.postalCode).toBe('00301')
    })

    it('limits address lengths and keeps apartment details optional', () => {
        mountForm()

        expect(wrapper.get('input[autocomplete="address-level2"]').attributes('maxlength')).toBe('100')
        expect(wrapper.get('input[autocomplete="address-line1"]').attributes('maxlength')).toBe('200')
        expect(wrapper.get('input[autocomplete="address-line2"]').attributes('maxlength')).toBe('100')
        expect(wrapper.get('input[autocomplete="address-line2"]').attributes('required')).toBeUndefined()
    })

    it('preserves valid accents, digits, apostrophes and punctuation in addresses', async () => {
        const { form } = mountForm()
        await wrapper.get('input[autocomplete="address-level2"]').setValue("L'Entregu")
        await wrapper.get('input[autocomplete="address-line1"]').setValue('Calle Pe\u00f1a, 12-B / s/n')
        await wrapper.get('input[autocomplete="address-line2"]').setValue('3\u00ba A')

        expect(form.city).toBe("L'Entregu")
        expect(form.streetAddress).toBe('Calle Pe\u00f1a, 12-B / s/n')
        expect(form.apartment).toBe('3\u00ba A')
    })
})
