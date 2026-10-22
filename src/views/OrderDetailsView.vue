<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getMyOrder } from '@/services/ordersApi';
import OrderConfirmationSummary from '@/components/order/OrderConfirmationSummary.vue';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const route = useRoute();
const order = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
let requestId = 0;

async function loadOrder() {
    const currentRequest = ++requestId;
    isLoading.value = true;
    errorMessage.value = '';
    order.value = null;

    try {
        const data = await getMyOrder(route.params.id);
        if (currentRequest === requestId) {
            order.value = data;
        }
    } catch (error) {
        if (currentRequest === requestId) {
            errorMessage.value = error instanceof Error
                ? error.message
                : 'No se pudo cargar el pedido.';
        }
    } finally {
        if (currentRequest === requestId) {
            isLoading.value = false;
        }
    }
}

watch(() => route.params.id, loadOrder, { immediate: true });
</script>

<template>
    <section class="order-details">
        <RouterLink to="/mi-cuenta">Volver a mis pedidos</RouterLink>
        <h1>Detalles del pedido</h1>

        <p v-if="isLoading" role="status">Cargando pedido...</p>

        <div v-else-if="errorMessage">
            <p role="alert">{{ errorMessage }}</p>
            <button type="button" @click="loadOrder">Reintentar</button>
        </div>

        <div v-else-if="order" class="order-details__content">
            <OrderConfirmationSummary
                :order-number="order.orderNumber"
                :date="dateFormatter.format(new Date(order.orderDate))"
                :total="currencyFormatter.format(order.total)"
            />

            <p class="order-details__status">
                {{ order.status === 'PENDING' ? 'Pedido recibido' : order.status }}
            </p>

            <h2>Productos</h2>
            <ul class="order-details__items">
                <li v-for="item in order.items" :key="item.productId"
                    class="order-details__item">
                    <img v-if="item.image" :src="item.image" alt=""
                        width="72" height="72" loading="lazy">
                    <div class="order-details__item-info">
                        <h3>{{ item.name }}</h3>
                        <p>
                            {{ item.quantity }} &times;
                            {{ currencyFormatter.format(item.unitPrice) }}
                        </p>
                    </div>
                    <strong class="order-details__item-total">
                        {{ currencyFormatter.format(item.quantity * item.unitPrice) }}
                    </strong>
                </li>
            </ul>
            <div class="order-details__bottom">
                <section v-if="order.delivery" class="order-details__delivery">
                    <h2>Datos de entrega</h2>
                    <address>
                        <p>
                            {{ order.delivery.firstName }}
                            {{ order.delivery.lastName }}
                        </p>
                        <p>{{ order.delivery.streetAddress }}</p>
                        <p v-if="order.delivery.apartment">
                            {{ order.delivery.apartment }}
                        </p>
                        <p>
                            {{ order.delivery.postalCode }}
                            {{ order.delivery.city }}
                        </p>
                        <p>{{ order.delivery.phone }}</p>
                    </address>
                </section>

                <section class="order-details__totals">
                    <h2>Resumen del pedido</h2>
                    <dl>
                        <div>
                            <dt>Subtotal</dt>
                            <dd>{{ currencyFormatter.format(order.subtotal) }}</dd>
                        </div>
                        <div>
                            <dt>Envío</dt>
                            <dd>
                                {{ order.shipping === 0
                                    ? 'Gratis'
                                    : currencyFormatter.format(order.shipping) }}
                            </dd>
                        </div>
                        <div>
                            <dt>IVA incluido</dt>
                            <dd>{{ currencyFormatter.format(order.taxes) }}</dd>
                        </div>
                        <div class="order-details__grand-total">
                            <dt>Total</dt>
                            <dd>{{ currencyFormatter.format(order.total) }}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    </section>
</template>

<style scoped>
.order-details {
    min-height: calc(100dvh - 59px - 94px);
    padding: 32px max(20px, calc((100% - 960px) / 2));
    background: #f9f9ff;
    color: #172033;
    overflow-wrap: anywhere;
}

.order-details > a { color: #006727; font-size: 14px; }
.order-details h1 { margin: 20px 0 24px; font-size: 28px; }
.order-details h2 { margin: 0 0 16px; font-size: 18px; }
.order-details h3 { margin: 0; font-size: 14px; line-height: 1.5; }

.order-details__status {
    display: inline-block;
    margin: 0 0 24px;
    padding: 6px 10px;
    border-radius: 4px;
    background: #e8edff;
    font-size: 13px;
}

.order-details__items {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.order-details__item {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #deebe2;
    border-radius: 8px;
    background: #fff;
}
.order-details__item img { width: 72px; height: 72px; object-fit: contain; }
.order-details__item-info { grid-column: 2; min-width: 0; }
.order-details__item-info p { margin: 8px 0 0; color: #4f5a4f; font-size: 14px; }
.order-details__item-total { grid-column: 3; text-align: right; color: #006727; }

.order-details__bottom {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #deebe2;
}
.order-details address { font-style: normal; font-size: 14px; }
.order-details address p { margin: 0 0 8px; }
.order-details dl { margin: 0; font-size: 14px; }
.order-details dl > div { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.order-details dd { margin: 0; min-width: 0; text-align: right; }
.order-details__grand-total { padding-top: 16px; border-top: 1px solid #deebe2; font-weight: 700; }
.order-details [role="alert"] { color: #b42318; }

.order-details button {
    min-height: 44px;
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    background: #006727;
    color: #fff;
    font: inherit;
    cursor: pointer;
}

.order-details button:hover { background: #00551f; }
.order-details :is(a, button):focus-visible {
    outline: 2px solid #006727;
    outline-offset: 3px;
}

@media (max-width: 576px) {
    .order-details { min-height: calc(100dvh - 44px - 76px); padding: 24px 14px; }
    .order-details h1 { font-size: 24px; }
    .order-details__item { grid-template-columns: 72px minmax(0, 1fr); gap: 12px; }
    .order-details__item-total { grid-column: 2; text-align: left; }
    .order-details__bottom { grid-template-columns: minmax(0, 1fr); gap: 24px; }
}
</style>
