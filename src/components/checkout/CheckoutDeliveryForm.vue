<script setup>
const form = defineModel({
    type: Object,
    required: true,
})

function phoneDigitLimit(value) {
    return value.replace(/[\p{Zs}-]/gu, '').startsWith('+') ? 11 : 9
}

function cleanPhoneInput(value) {
    const cleaned = value.replace(/[^0-9+\p{Zs}-]/gu, '')
    const limit = phoneDigitLimit(cleaned)
    let count = 0

    for (const digit of cleaned.matchAll(/[0-9]/g)) {
        if (++count > limit) {
            return cleaned.slice(0, digit.index).replace(/[\p{Zs}-]+$/u, '')
        }
    }

    return cleaned
}

function cleanPostalCodeInput(value) {
    return value.replace(/[^0-9]/g, '').slice(0, 5)
}

function handleBeforeDigitInput(event, limit) {
    if (event.isComposing || event.inputType !== 'insertText' || !/^[0-9]$/.test(event.data ?? '')) {
        return
    }

    const input = event.target
    const proposed = input.value.slice(0, input.selectionStart)
        + event.data + input.value.slice(input.selectionEnd)
    const digits = proposed.match(/[0-9]/g)?.length ?? 0

    // Block an extra typed digit without discarding the existing end of the number.
    if (digits > limit(proposed)) event.preventDefault()
}

function handleBeforePhoneInput(event) {
    handleBeforeDigitInput(event, phoneDigitLimit)
}

function handleBeforePostalCodeInput(event) {
    handleBeforeDigitInput(event, () => 5)
}

function handleCleanedInput(event, field, cleanInput) {
    if (event.isComposing) return

    const input = event.target
    const value = input.value
    const start = input.selectionStart
    const end = input.selectionEnd
    const cleaned = cleanInput(value)

    form.value[field] = cleaned

    if (value !== cleaned) {
        input.value = cleaned

        if (start !== null && end !== null) {
            input.setSelectionRange(
                cleanInput(value.slice(0, start)).length,
                cleanInput(value.slice(0, end)).length
            )
        }
    }
}

function handlePhoneInput(event) {
    handleCleanedInput(event, 'phone', cleanPhoneInput)
}

function handlePostalCodeInput(event) {
    handleCleanedInput(event, 'postalCode', cleanPostalCodeInput)
}
</script>

<template>
    <section class="checkout-delivery-form">
        <h1 class="checkout-delivery-form_title">Información de Entrega</h1>

        <form class="checkout-delivery-form_form">
            <label class="checkout-delivery-form_field">
                <span>Nombre</span>
                <input v-model="form.firstName" type="text" placeholder="Ej. Ana" />
            </label>

            <label class="checkout-delivery-form_field">
                <span>Apellidos</span>
                <input v-model="form.lastName" type="text" placeholder="Ej. García López" />
            </label>

            <label class="checkout-delivery-form_field">
                <span>Ciudad</span>
                <input v-model="form.city" type="text" maxlength="100"
                    autocomplete="address-level2" required placeholder="Oviedo" />
            </label>

            <label class="checkout-delivery-form_field">
                <span>Código Postal</span>
                <input :value="form.postalCode" type="text" inputmode="numeric"
                    autocomplete="postal-code" pattern="[0-9]{5}" required placeholder="33001"
                    @beforeinput="handleBeforePostalCodeInput"
                    @input="handlePostalCodeInput" @compositionend="handlePostalCodeInput" />
            </label>

            <div class="checkout-delivery-form_address">
                <span class="checkout-delivery-form_address-label">Dirección de Envío</span>

                <label class="checkout-delivery-form_field">
                    <input v-model="form.streetAddress" type="text" maxlength="200"
                        autocomplete="address-line1" required placeholder="Calle y número" />
                </label>

                <label class="checkout-delivery-form_field">
                    <input v-model="form.apartment" type="text" maxlength="100"
                        autocomplete="address-line2" placeholder="Piso, puerta ..." />
                </label>
            </div>

            <label class="checkout-delivery-form_field checkout-delivery-form_field--wide">
                <span>Teléfono de Contacto</span>
                <input :value="form.phone" type="tel" inputmode="tel"
                    autocomplete="tel" placeholder="+34 600 000 000"
                    @beforeinput="handleBeforePhoneInput"
                    @input="handlePhoneInput" @compositionend="handlePhoneInput" />
            </label>
        </form>
    </section>
</template>
<style scoped lang="scss">
.checkout-delivery-form {
    padding: 24px;
    border: 1px solid #DCE3EF;
    border-radius: 8px;
    background: #FFFFFF;

    &_title {
        margin: 0 0 20px;
        color: #111827;
        font-size: 20px;
        font-weight: 700;
        line-height: 28px;
    }

    &_form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }

    &_field {
        display: flex;
        flex-direction: column;
        gap: 6px;

        span {
            color: #3F4A3E;
            font-size: 13px;
            font-weight: 600;
            line-height: 18px;
        }

        input {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #BECABA;
            border-radius: 6px;
            background: #FFFFFF;
            color: #111827;
            font-size: 14px;
            line-height: 20px;

            &::placeholder {
                color: #8A9587;
            }

            &:focus {
                border-color: #007A3D;
                outline: none;
            }
        }

        &--wide {
            grid-column: 1 / -1;
        }
    }

    &_address {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px 16px;
        grid-column: 1 / -1;
    }

    &_address-label {
        grid-column: 1 / -1;
        color: #3F4A3E;
        font-size: 13px;
        font-weight: 600;
        line-height: 18px;
    }
}

@media (max-width: 768px) {
    .checkout-delivery-form {
        padding: 20px;

        &_form {
            grid-template-columns: 1fr;
        }

        &_field--wide {
            grid-column: auto;
        }

        &_address {
            grid-template-columns: 1fr;
        }
    }
}
</style>
