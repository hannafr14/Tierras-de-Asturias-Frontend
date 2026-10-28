<script setup>
defineProps({
    subtotal: {
        type: Number,
        required: true,
    },
    shipping: {
        type: Number,
        required: true,
    },
    taxes: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    items: {
        type: Array,
        default: () => [],
    },
    buttonText: {
        type: String,
        default: 'Continuar con el pedido',
    },
    buttonTo: {
        type: String,
        default: '/checkout',
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['confirm'])
</script>
<template>
    <aside class="order-summary">
        <h2 class="order-summary_title">Resumen del pedido</h2>
        <div v-if="items.length > 0" class="order-summary_items">
            <div
                v-for="item in items"
                :key="item.id"
                class="order-summary_item"
            >
                <img
                    class="order-summary_item-image"
                    :src="item.image"
                    :alt="item.name"
                />

                <div class="order-summary_item-info">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.quantity }} x {{ item.price.toFixed(2) }}€</span>
                </div>
            </div>
        </div>

        <div class="order-summary_rows">
            <div class="order-summary_row">
                <span>Subtotal</span>
                <span>{{ subtotal.toFixed(2) }}€</span>
            </div>

            <div class="order-summary_row">
                <span>Envío</span>
                <span v-if="shipping === 0" class="order-summary_free">Gratis</span>
                <span v-else>{{ shipping.toFixed(2) }}€</span>
            </div>

            <div class="order-summary_row">
                <span>Impuestos (IVA incl.)</span>
                <span>{{ taxes.toFixed(2) }}€</span>
            </div>
        </div>

        <div class="order-summary_total">
            <span>Total</span>
            <strong>{{ total.toFixed(2) }}€</strong>
        </div>

        <RouterLink
            v-if="buttonTo"
            class="order-summary_button"
            :to="buttonTo"
        >
            {{ buttonText }}
        </RouterLink>

        <button
            v-else
            class="order-summary_button"
            type="button"
            :disabled="isLoading"
            @click="emit('confirm')"
        >
            {{ isLoading ? 'Creando pedido...' : buttonText }}
        </button>
    </aside>
</template>
<style scoped lang="scss">
.order-summary {
    padding: 22px;
    border: 1px solid #DCE3EF;
    border-radius: 8px;
    background: #F3F6FF;
    box-shadow: 0 3px 8px rgba(17, 24, 39, 0.08);

    &_title {
        margin: 0 0 20px;
        color: #111827;
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
    }

    &_items {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #DCE3EF;
    }

    &_item {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
    }

    &_item-image {
        width: 56px;
        height: 56px;
        border-radius: 6px;
        object-fit: cover;
    }

    &_item-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;

        strong {
            overflow: hidden;
            color: #111827;
            font-size: 13px;
            font-weight: 700;
            line-height: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        span {
            color: #3F4A3E;
            font-size: 13px;
            line-height: 18px;
        }
    }

    &_rows {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-bottom: 18px;
        border-bottom: 1px solid #BECABA;
    }

    &_row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        color: #3F4A3E;
        font-size: 13px;
        line-height: 18px;
    }

    &_free {
        color: #007A3D;
        font-weight: 700;
    }

    &_total {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 18px;
        color: #111827;
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;

        strong {
            color: #007A3D;
            font-size: 26px;
            font-weight: 400;
            line-height: 32px;
        }
    }

    &_button {
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        width: 100%;
        height: 44px;
        margin-top: 24px;
        border: none;
        border-radius: 7px;
        background: #007A3D;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        cursor: pointer;

        &:hover {
            background: #006727;
        }

        &:focus-visible {
            outline: 2px solid rgba(0, 122, 61, 0.35);
            outline-offset: 2px;
        }

        &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    }
}


</style>
