<script setup>
import { computed, onMounted, ref } from 'vue';
import { getMyOrders } from '@/services/ordersApi';

const orders = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const currentPage = ref(0);
const totalPages = ref(0);

const visiblePages = computed(() => {
    const count = Math.max(1, totalPages.value);
    const start = Math.max(0, Math.min(currentPage.value - 1, count - 3));

    return Array.from(
        { length: Math.min(3, count) },
        (_, index) => start + index
    );
});

async function loadOrders(page = 0) {
    if (isLoading.value) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const data = await getMyOrders(page);

        orders.value = data.content;
        currentPage.value = data.page.number;
        totalPages.value = data.page.totalPages;
    } catch (error) {
        orders.value = [];
        errorMessage.value = error instanceof Error
            ? error.message
            : 'No se pudieron cargar los pedidos.';
    } finally {
        isLoading.value = false;
    }
}

const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

onMounted(() => loadOrders());
</script>

<template>
    <section class="order-history" aria-labelledby="order-history-title">
        <h2 id="order-history-title">Historial de Pedidos</h2>
        <p class="order-history__description">
            Consulta el historial de tus pedidos.
        </p>

        <div v-if="isLoading" class="order-history__empty" role="status">
            Cargando pedidos...
        </div>

        <div v-else-if="errorMessage" class="order-history__empty">
            <p role="alert">{{ errorMessage }}</p>
            <button type="button" @click="loadOrders(currentPage)">
                Reintentar
            </button>
        </div>

        <div v-else-if="orders.length === 0"
            class="order-history__empty" role="status">
            Todavía no tienes pedidos.
        </div>

        <ul v-else class="order-history__list">
            <li v-for="order in orders" :key="order.id"
                class="order-history__item">
                <div class="order-history__details">
                    <strong>#{{ order.orderNumber }}</strong>
                    <p>
                        <time :datetime="order.orderDate">
                            {{ dateFormatter.format(new Date(order.orderDate)) }}
                        </time>
                    </p>
                    <span class="order-history__status">
                        {{ order.status === 'PENDING' ? 'Pedido recibido' : order.status }}
                    </span>
                </div>
                <div class="order-history__total">
                    <span>TOTAL</span>
                    <strong>{{ currencyFormatter.format(order.total) }}</strong>
                </div>
            </li>
        </ul>

        <nav v-if="!errorMessage" class="order-history__pagination"
            aria-label="Paginación de pedidos">
            <button type="button" aria-label="Página anterior"
                    :disabled="isLoading || currentPage === 0"
                    @click="loadOrders(currentPage - 1)">
                &lsaquo;
            </button>

            <button v-for="page in visiblePages" :key="page"
                    type="button" :disabled="isLoading"
                    :aria-label="`Página ${page + 1}`"
                    :aria-current="page === currentPage ? 'page' : null"
                    @click="loadOrders(page)">
                {{ page + 1 }}
            </button>

            <button type="button" aria-label="Página siguiente"
                    :disabled="isLoading || currentPage >= totalPages - 1"
                    @click="loadOrders(currentPage + 1)">
                &rsaquo;
            </button>
        </nav>
    </section>
</template>

<style scoped>
.order-history h2 { margin: 0 0 6px; font-size: 16px; }
.order-history__description { margin: 0; color: #4f5a4f; font-size: 14px; }

.order-history__empty {
    display: grid;
    place-items: center;
    min-height: 180px;
    margin-top: 24px;
    padding: 24px;
    border: 1px solid #cbd5c6;
    border-radius: 8px;
    color: #4f5a4f;
    text-align: center;
}

.order-history__pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
}

.order-history__pagination button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 1px solid #cbd5c6;
    border-radius: 4px;
    font-size: 13px;
}

.order-history__pagination button { background: #fff; cursor: pointer; }
.order-history__pagination button:disabled { opacity: 0.5; cursor: default; }
.order-history__pagination button[aria-current="page"] {
    background: #006727;
    border-color: #006727;
    color: #fff;
}

.order-history__list {
    display: grid;
    gap: 12px;
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
}

.order-history__item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #cbd5c6;
    border-radius: 8px;
    background: #f9f9ff;
}

.order-history__details { min-width: 0; overflow-wrap: anywhere; }
.order-history__details strong { color: #172033; font-size: 14px; }
.order-history__details p { margin: 8px 0; color: #4f5a4f; font-size: 13px; }

.order-history__status {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    background: #e8edff;
    color: #35445d;
    font-size: 12px;
}

.order-history__total { display: grid; gap: 6px; text-align: right; }
.order-history__total span { color: #4f5a4f; font-size: 11px; }
.order-history__total strong { color: #006727; font-size: 20px; }

.order-history button:focus-visible {
    outline: 2px solid #006727;
    outline-offset: 3px;
}

@media (max-width: 576px) {
    .order-history__item {
        grid-template-columns: minmax(0, 1fr);
    }

    .order-history__total {
        padding-top: 12px;
        border-top: 1px solid #ecefed;
        text-align: left;
        overflow-wrap: anywhere;
    }
}
</style>