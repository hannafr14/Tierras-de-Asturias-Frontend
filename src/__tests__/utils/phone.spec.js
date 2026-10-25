import { describe, expect, it } from 'vitest'
import { normalizeSpanishPhone } from '@/utils/phone'

describe('normalizeSpanishPhone', () => {
    it.each([
        ['600000000', '+34600000000'],
        ['700000000', '+34700000000'],
        ['812345678', '+34812345678'],
        ['912345678', '+34912345678'],
        ['+34600000000', '+34600000000'],
        ['+34 600 000 000', '+34600000000'],
        ['600-000-000', '+34600000000'],
        [' +34 600-000-000 ', '+34600000000'],
        ['+34\u00a0600\u202f000\u00a0000', '+34600000000'],
    ])('normalizes %s to %s', (input, expected) => {
        expect(normalizeSpanishPhone(input)).toBe(expected)
        expect(normalizeSpanishPhone(expected)).toBe(expected)
    })

    it.each([
        null, undefined, 600000000, '', ' ', '---', '123', '60000000',
        '6000000000', '500000000', '+33600000000', '0034600000000',
        '34600000000', '++34600000000', '600+000000', '60000000a',
        '6        1', '+34', '600000000\n', '600\t000000',
    ])('rejects %s', input => {
        expect(normalizeSpanishPhone(input)).toBeNull()
    })
})
