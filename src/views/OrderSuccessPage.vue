<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import OrderConfirmationSummary from '@/components/order/OrderConfirmationSummary.vue'
import { useAuthStore } from '@/stores/authStore'

const LAST_ORDER_STORAGE_KEY = 'tierras-last-order'

const cartStore = useCartStore()
const authStore = useAuthStore()
const lastOrder = ref(null)

const formattedDate = computed(() => {
    if (!lastOrder.value?.date) {
        return ''
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(lastOrder.value.date))
})

const formattedTotal = computed(() => {
    if (lastOrder.value?.total === undefined) {
        return ''
    }

    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(lastOrder.value.total)
})

onMounted(() => {
    const storedOrder = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)

    if (storedOrder) {
        lastOrder.value = JSON.parse(storedOrder)
    }

    cartStore.clearCart()
})
</script>

<template>
    <main class="order-success-page">
        <section class="order-success-page_content">
            <div class="order-success-page_icon">
                ✓
            </div>

            <h1 class="order-success-page_title">¡Pedido confirmado!</h1>

            <p class="order-success-page_text">
                Gracias por apoyar a los productores locales de Asturias.
                Tu compra ayuda a mantener viva la tradición artesana.
            </p>

            <OrderConfirmationSummary
                v-if="lastOrder"
                :order-number="lastOrder.orderNumber"
                :date="formattedDate"
                :total="formattedTotal"
            />

            <p v-else class="order-success-page_fallback">
                Hemos recibido tu pedido correctamente.
            </p>

            <div class="order-success-page_actions">
                <RouterLink
                    v-if="authStore.isAuthenticated"
                    class="order-success-page_primary"
                    to="/mi-cuenta"
                >
                    Ver mis pedidos
                </RouterLink>

                <RouterLink
                    :class="authStore.isAuthenticated
                        ? 'order-success-page_secondary'
                        : 'order-success-page_primary'"
                    to="/productos"
                >
                    Seguir Comprando
                </RouterLink>
            </div>

            <p class="order-success-page_note">
                Tu pedido será preparado con esmero en menos de 24h.
            </p>
        </section>
    </main>
</template>

<style scoped lang="scss">
.order-success-page {
    min-height: calc(100vh - 59px - 94px);
    display: flex;
    justify-content: center;
    padding: 64px 24px 80px;
    background: #F9F9FF;

    &_content {
        width: 100%;
        max-width: 640px;
        text-align: center;
    }

    &_icon {
        width: 72px;
        height: 72px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        border-radius: 50%;
        background: #D8FAD8;
        color: #007A3D;
        font-size: 44px;
        font-weight: 700;
    }

    &_title {
        margin: 0 0 12px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
        line-height: 36px;
    }

    &_text,
    &_fallback {
        max-width: 420px;
        margin: 0 auto 28px;
        color: #3F4A3E;
        font-size: 14px;
        line-height: 22px;
    }

    &_actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 36px;
    }

    &_primary,
    &_secondary {
        min-width: 150px;
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 18px;
        border-radius: 7px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
    }

    &_primary {
        background: #007A3D;
        color: #FFFFFF;
    }

    &_secondary {
        border: 1px solid #BECABA;
        background: #E9EEFC;
        color: #111827;
    }

    &_note {
        margin: 0;
        color: #6F7A6D;
        font-size: 12px;
        line-height: 18px;
    }
}

@media (max-width: 576px) {
    .order-success-page {
        min-height: calc(100vh - 44px - 76px);
        padding: 40px 16px 56px;

        &_actions {
            flex-direction: column;
        }

        &_primary,
        &_secondary {
            width: 100%;
        }
    }
}
</style>