<script setup>
import cartIcon from '@/assets/carrito.svg'
import fallbackImage from '@/assets/image-placeholder.svg'
import locationIcon from '@/assets/location.svg'
import QuantityControl from '@/components/common/QuantityControl.vue'
import { RouterLink } from 'vue-router'

const emit = defineEmits(['add-to-cart', 'increase', 'decrease'])

defineProps({
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    farmName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    cartQuantity: {
        type: Number,
        default: 0,
    },
    productId: {
        type: Number,
        required: true,
    },
    variant: { type: String, default: 'default' },
    description: { type: String, default: '' },
})

function handleImageError(event) {
    event.target.src = fallbackImage
}
</script>

<template>
    <article
        class="product-card"
        :class="{ 'product-card--farm': variant === 'farm' }"
    >
        <img
            class="product-card_image"
            :src="image"
            :alt="name"
            @error="handleImageError"
        >

        <div class="product-card_body">
            <h3 class="product-card_title">
                <RouterLink
                    class="product-card_link"
                    :to="`/productos/${productId}`"
                    @click.stop
                >
                    {{ name }}
                </RouterLink>
            </h3>

            <p
                v-if="variant === 'farm' && description"
                class="product-card_description"
            >
                {{ description }}
            </p>

            <p v-if="variant !== 'farm'" class="product-card_farm">
                {{ farmName }}
            </p>

            <p v-if="variant !== 'farm'" class="product-card_location">
                <img
                    class="product-card_location-icon"
                    :src="locationIcon"
                    alt=""
                >
                {{ location }}
            </p>
        </div>

        <div class="product-card_footer">
            <span class="product-card_price">
                {{ price }}
            </span>

            <div class="product-card_actions" @click.stop>
                <QuantityControl
                    :quantity="cartQuantity"
                    @decrease="emit('decrease')"
                    @increase="emit('increase')"
                />

                <button 
                    class="product-card_cart-button" 
                    type="button" 
                    aria-label="Add to cart" 
                    @click.stop="emit('add-to-cart')"
                >
                    <img
                        class="product-card_cart-icon"
                        :src="cartIcon"
                        alt=""
                    >
                </button>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">
.product-card {
    width: 100%;
    max-width: 320px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #BECABA;
    border-radius: 11px;
    background: #FFFFFF;
    box-shadow: 0 3px 8px rgba(17, 24, 39, 0.08);
    display: flex;
    flex-direction: column;

    &_image {
        width: 100%;
        height: 190px;
        display: block;
        object-fit: cover;
        border-radius: 7px;
    }

    &_body {
        padding-top: 14px;
    }

    &_title {
        margin: 0 0 4px;
        color: #111827;
        font-size: 16px;
        font-weight: 500;
        line-height: 25px;
    }

    &_farm,
    &_location {
        margin: 0;
        color: #6F7A6D;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        margin-bottom: 6px;
    }

    &_location {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    &_location-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }

    &_footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 14px;
    }

    &_price {
        color: #007A3D;
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
    }

    &_cart-button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    &_cart-icon {
        width: 18px;
        height: 18px;
    }

    &_actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &_link {
        color: inherit;
        text-decoration: none;

        &:hover { text-decoration: underline; }
        &:focus-visible { outline: 2px solid #007a3d; outline-offset: 3px; }
    }
}

@media (max-width: 576px) {
    .product-card {
        width: 100%;
        max-width: none;
        min-width: 0;
        padding: 8px;

        &_image {
            width: 100%;
            height: 160px;
            object-fit: cover;
            margin: 0;
            border-radius: 10px;
        }

        &_body {
            padding-top: 10px;
        }

        &_title {
            font-size: 13px;
            line-height: 18px;
        }

        &_farm,
        &_location {
            font-size: 10px;
            line-height: 14px;
        }

        &_price {
            font-size: 12px;
            line-height: 17px;
        }
    }
}
.product-card--farm {
    max-width: none;
    padding: 0;
    overflow: hidden;
    border-radius: 8px;

    .product-card_image {
        height: 190px;
        padding: 12px;
        box-sizing: border-box;
        object-fit: contain;
        border-radius: 0;
        background: #f5f6f5;
    }

    .product-card_cart-button {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        background: #eef7f0;

        &:hover {
            background: #dceee1;
        }

        &:focus-visible {
            outline: 2px solid #007a3d;
            outline-offset: 2px;
        }
    }

    .product-card_body {
        padding: 20px;
    }

    .product-card_footer {
        padding: 4px 20px 20px;
        gap: 12px;
        flex-wrap: wrap;
    }
    .product-card_title { overflow-wrap: anywhere; }

    .product-card_description {
        margin: 0;
        color: #596457;
        font-size: 12px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }
}
</style>
