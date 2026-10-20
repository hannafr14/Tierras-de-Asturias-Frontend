<script setup>
defineProps({
    order: {
        type: Object,
        required: true,
    },
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
</script>

<template>
    <li class="order-history-card">
        <div class="order-history-card__details">
            <strong>#{{ order.orderNumber }}</strong>

            <p>
                <time :datetime="order.orderDate">
                    {{ dateFormatter.format(new Date(order.orderDate)) }}
                </time>
                <span>
                    &middot; {{ order.productCount }}
                    {{ order.productCount === 1 ? 'producto' : 'productos' }}
                </span>
            </p>

            <span class="order-history-card__status">
                {{ order.status === 'PENDING' ? 'Pedido recibido' : order.status }}
            </span>
        </div>

        <div class="order-history-card__total">
            <span>TOTAL</span>
            <strong>{{ currencyFormatter.format(order.total) }}</strong>
        </div>
    </li>
</template>

<style scoped>
.order-history-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #cbd5c6;
    border-radius: 8px;
    background: #f9f9ff;
}

.order-history-card__details {
    min-width: 0;
    overflow-wrap: anywhere;
}

.order-history-card__details strong {
    color: #172033;
    font-size: 14px;
}

.order-history-card__details p {
    margin: 8px 0;
    color: #4f5a4f;
    font-size: 13px;
}

.order-history-card__status {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    background: #e8edff;
    color: #35445d;
    font-size: 12px;
}

.order-history-card__total {
    display: grid;
    gap: 6px;
    text-align: right;
}

.order-history-card__total span { color: #4f5a4f; font-size: 11px; }
.order-history-card__total strong { color: #006727; font-size: 20px; }

@media (max-width: 576px) {
    .order-history-card {
        grid-template-columns: minmax(0, 1fr);
    }

    .order-history-card__total {
        padding-top: 12px;
        border-top: 1px solid #ecefed;
        text-align: left;
        overflow-wrap: anywhere;
    }
}
</style>