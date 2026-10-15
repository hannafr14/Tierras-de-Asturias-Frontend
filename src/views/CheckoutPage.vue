<script setup>
import CheckoutDeliveryForm from '@/components/checkout/CheckoutDeliveryForm.vue'
import CheckoutPaymentInfo from '@/components/checkout/CheckoutPaymentInfo.vue'
import OrderSummary from '@/components/cart/OrderSummary.vue'
import { useCartStore } from '@/stores/cartStore'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCsrfHeaders } from '@/services/csrfApi'

const deliveryForm = reactive({
    firstName: '',
    lastName: '',
    city: '',
    postalCode: '',
    streetAddress: '',
    apartment: '',
    phone: '',
})

const checkoutError = ref('')
const isSubmitting = ref(false)

const isPostalCodeValid = computed(() => {
    return /^\d{5}$/.test(deliveryForm.postalCode.trim())
})

const isPhoneValid = computed(() => {
    return /^\+?\d[\d\s]{8,}$/.test(deliveryForm.phone.trim())
})

const isDeliveryFormValid = computed(() => {
    return Boolean(
        deliveryForm.firstName.trim()
        && deliveryForm.lastName.trim()
        && deliveryForm.city.trim()
        && deliveryForm.postalCode.trim()
        && deliveryForm.streetAddress.trim()
        && deliveryForm.phone.trim()
        && isPostalCodeValid.value
        && isPhoneValid.value
    )
})

const cartStore = useCartStore()

const router = useRouter()
const LAST_ORDER_STORAGE_KEY = 'tierras-last-order'

function roundMoney(value) {
    return Number(value.toFixed(2))
}

function createOrderPayload() {
    return {
        delivery: {
            firstName: deliveryForm.firstName.trim(),
            lastName: deliveryForm.lastName.trim(),
            city: deliveryForm.city.trim(),
            postalCode: deliveryForm.postalCode.trim(),
            streetAddress: deliveryForm.streetAddress.trim(),
            apartment: deliveryForm.apartment.trim(),
            phone: deliveryForm.phone.trim(),
        },
        items: cartStore.items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: roundMoney(item.price),
        })),
        subtotal: roundMoney(cartStore.subtotal),
        shipping: roundMoney(cartStore.shipping),
        taxes: roundMoney(cartStore.taxes),
        total: roundMoney(cartStore.total),
    }
}

async function handleCheckoutConfirm() {
    if (isSubmitting.value) {
        return
    }
    
    checkoutError.value = ''

    if (
        !deliveryForm.firstName.trim()
        || !deliveryForm.lastName.trim()
        || !deliveryForm.city.trim()
        || !deliveryForm.postalCode.trim()
        || !deliveryForm.streetAddress.trim()
        || !deliveryForm.phone.trim()
    ) {
        checkoutError.value = 'Completa los datos de entrega antes de continuar.'
        return
    }

    if (!isPostalCodeValid.value) {
        checkoutError.value = 'Introduce un código postal válido de 5 dígitos.'
        return
    }

    if (!isPhoneValid.value) {
        checkoutError.value = 'Introduce un teléfono válido.'
        return
    }

    const orderPayload = createOrderPayload()

    isSubmitting.value = true

    try {
        const csrfHeaders = await getCsrfHeaders();

        const response = await fetch('/api/orders', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                ...csrfHeaders,
            },
            body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
            throw new Error('Order request failed')
        }

        const createdOrder = await response.json()

        sessionStorage.setItem(
            LAST_ORDER_STORAGE_KEY,
            JSON.stringify({
                orderNumber: createdOrder.orderNumber,
                date: createdOrder.orderDate,
                total: createdOrder.total,
            })
        )

        router.push('/checkout/success')
    } catch (error) {
        checkoutError.value = 'No se pudo crear el pedido. Inténtalo de nuevo.'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <main class="checkout-page">
        <section
            v-if="cartStore.items.length === 0"
            class="checkout-page_empty"
        >
            <h1 class="checkout-page_empty-title">Tu cesta está vacía.</h1>
            <p class="checkout-page_empty-text">
                Añade productos antes de continuar con el pago.
            </p>

            <RouterLink class="checkout-page_empty-link" to="/productos">
                Ver productos
            </RouterLink>
        </section>

        <div v-else>
            <RouterLink class="checkout-page_back" to="/cart">
                ← Volver a la cesta
            </RouterLink>

            <div class="checkout-page_layout">
                <div class="checkout-page_forms">
                    <CheckoutDeliveryForm v-model="deliveryForm" />

                    <p v-if="checkoutError" class="checkout-page_error">
                        {{ checkoutError }}
                    </p>

                    <CheckoutPaymentInfo />
                </div>

                <OrderSummary
                    :subtotal="cartStore.subtotal"
                    :shipping="cartStore.shipping"
                    :taxes="cartStore.taxes"
                    :total="cartStore.total"
                    button-text="Confirmar y pagar"
                    :button-to="null"
                    :items="cartStore.items"
                    :is-loading="isSubmitting"
                    @confirm="handleCheckoutConfirm"
                />
            </div>
        </div>
    </main>
</template>

<style scoped lang="scss">
.checkout-page {
    min-height: calc(100vh - 59px - 94px);
    padding: 32px 48px 80px;

    &_back {
        display: inline-flex;
        align-items: center;
        margin-bottom: 18px;
        color: #007A3D;
        font-size: 13px;
        font-weight: 700;
        line-height: 18px;
        text-decoration: none;

        &:hover {
            color: #006727;
        }
    }

    &_layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 32px;
        align-items: start;
    }

    &_forms {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    &_error {
        margin: -12px 0 0;
        color: #B42318;
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
    }

    &_empty {
        max-width: 520px;
    }

    &_empty-title {
        margin: 0 0 8px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
        line-height: 36px;
    }

    &_empty-text {
        margin: 0 0 24px;
        color: #3F4A3E;
        font-size: 14px;
        line-height: 20px;
    }

    &_empty-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 18px;
        border-radius: 7px;
        background: #007A3D;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            background: #006727;
        }
    }
}

@media (max-width: 900px) {
    .checkout-page {
        &_layout {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 768px) {
    .checkout-page {
        padding: 24px 16px 64px;
    }
}
</style>