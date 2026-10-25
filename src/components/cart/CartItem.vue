<script setup>
import QuantityControl from '@/components/common/QuantityControl.vue'

defineProps({
    item: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['increase', 'decrease', 'remove'])
</script>
<template>
        <article class="cart-item">
            <img
                class="cart-item_image"
                :src="item.image"
                :alt="item.name"
            >
            <div class="cart-item_info">
                <h2 class="cart-item_name">{{ item.name }}</h2>
                <p class="cart-item_farm">{{ item.farmName }}</p>
            </div>

            <span class="cart-item_price">
                {{ (item.price * item.quantity).toFixed(2) }}€
            </span>

            <QuantityControl
                class="cart-item_quantity"
                :quantity="item.quantity"
                @decrease="emit('decrease')"
                @increase="emit('increase')"
            />

            <button
                class="cart-item_remove"
                type="button"
                @click="emit('remove')"
            >
                <svg
                    class="cart-item_remove-icon"
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M2.5 15C2.04167 15 1.64931 14.8368 1.32292 14.5104C0.996528 14.184 0.833333 13.7917 0.833333 13.3333V2.5H0V0.833333H4.16667V0H9.16667V0.833333H13.3333V2.5H12.5V13.3333C12.5 13.7917 12.3368 14.184 12.0104 14.5104C11.684 14.8368 11.2917 15 10.8333 15H2.5ZM10.8333 2.5H2.5V13.3333H10.8333V2.5ZM4.16667 11.6667H5.83333V4.16667H4.16667V11.6667ZM7.5 11.6667H9.16667V4.16667H7.5V11.6667Z"
                        fill="currentColor"
                    />
                </svg>

                <span class="cart-item_remove-text">
                    Eliminar
                </span>
            </button>
        </article>
</template>
<style scoped lang="scss">
.cart-item {
    display: grid;
    grid-template-columns: 90px minmax(0, 1fr) auto;
    grid-template-areas:
        "image info price"
        "image quantity remove";
    align-items: center;
    column-gap: 18px;
    row-gap: 14px;
    padding: 14px;
    border-radius: 8px;
    background: #FFFFFF;
    box-shadow: 0 3px 8px rgba(17, 24, 39, 0.08);

    &_image {
        grid-area: image;
        width: 90px;
        height: 90px;
        border-radius: 6px;
        object-fit: cover;
    }

    &_name {
        margin: 0 0 4px;
        color: #111827;
        font-size: 15px;
        font-weight: 500;
        line-height: 21px;
    }

    &_farm {
        margin: 0;
        color: #007A3D;
        font-size: 12px;
        font-weight: 700;
        line-height: 17px;
    }

    &_price {
        color: #111827;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        white-space: nowrap;
        grid-area: price;
        align-self: start;
        justify-self: end;
    }

    &_quantity {
        grid-area: quantity;
    }

    &_remove {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 0;
        border: none;
        background: transparent;
        color: #6F7A6D;
        font-size: 12px;
        font-weight: 500;
        line-height: 14px;
        grid-area: remove;
        align-self: end;
        justify-self: end;
        cursor: pointer;

        &:hover {
            color: #c2270c;
        }

        &:focus-visible {
            outline: 2px solid rgba(0, 122, 61, 0.35);
            outline-offset: 2px;
        }
    }

    &_remove-icon {
        width: 14px;
        height: 15px;
        flex: 0 0 auto;
        display: block;
    }

    &_remove-text {
        display: block;
        line-height: 14px;
        transform: translateY(1px);
    }

    &_info {
        grid-area: info;
    }
}

@media (max-width: 576px) {
    .cart-item {
        grid-template-columns: 64px 1fr;
        grid-template-areas:
            "image info"
            "image price"
            "image quantity"
            "image remove";
        align-items: start;

        &_image {
            width: 64px;
            height: 64px;
        }

        &_price {
            align-self: start;
            justify-self: start;
        }

        &_quantity {
            justify-self: start;
        }

        &_remove {
            justify-self: start;
        }
    }
}
</style>
