<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getProductById } from '@/services/catalogApi'
import StateMessage from '@/components/common/StateMessage.vue'
import QuantityControl from '@/components/common/QuantityControl.vue'
import { useCartStore } from '@/stores/cartStore'
import fallbackImage from '@/assets/image-placeholder.svg'

const route = useRoute()
const product = ref(null)
const imageFailed = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const priceFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
})
const cartStore = useCartStore()
const quantity = ref(1)
const addedMessage = ref('')

function addProductToCart() {
    if (!product.value) return

    for (let index = 0; index < quantity.value; index += 1) {
        cartStore.addToCart(product.value)
    }

    addedMessage.value = 'Producto añadido al carrito.'
    quantity.value = 1
}

watch(
    () => route.params.id,
    async (id, previousId, onCleanup) => {
        let cancelled = false
        onCleanup(() => { cancelled = true })

        product.value = null
        imageFailed.value = false
        quantity.value = 1
        addedMessage.value = ''
        isLoading.value = true
        errorMessage.value = ''

        try {
            const data = await getProductById(id)
            if (!cancelled) product.value = data
        } catch (error) {
            if (!cancelled) {
                errorMessage.value = error instanceof TypeError
                    ? 'No se pudo conectar con el servidor.'
                    : error.message || 'No se pudo cargar el producto.'
            }
        } finally {
            if (!cancelled) isLoading.value = false
        }
    },
    { immediate: true }
)
</script>

<template>
    <section class="product-details">
        <nav class="product-details_breadcrumbs" aria-label="Ruta de navegación">
            <ol>
                <li>
                    <RouterLink to="/productos">Productos</RouterLink>
                </li>
                <li v-if="product">
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{{ product.name }}</span>
                </li>
            </ol>
        </nav>

        <StateMessage
            v-if="isLoading"
            role="status"
            type="loading"
            message="Cargando producto..."
        />
        <StateMessage
            v-else-if="errorMessage"
            role="alert"
            type="error"
            :message="errorMessage"
        />

        <div v-else-if="product" class="product-details_content">
            <div class="product-details_top">
                <div class="product-details_media">
                    <img
                        class="product-details_image"
                        :src="imageFailed ? fallbackImage : (product.image || fallbackImage)"
                        :alt="imageFailed || !product.image
                            ? 'Imagen no disponible'
                            : product.name"
                        @error="imageFailed = true"
                    />
                </div>

                <div class="product-details_sidebar">
                    <div class="product-details_info">
                        <h1 class="product-details_title">{{ product.name }}</h1>

                        <p class="product-details_price">
                            {{ priceFormatter.format(product.price) }}
                        </p>

                        <dl class="product-details_attributes">
                            <div class="product-details_attribute">
                                <dt>Granja</dt>
                                <dd>{{ product.farmName }}</dd>
                            </div>
                        </dl>

                        <div class="product-details_actions">
                            <QuantityControl
                                :quantity="quantity"
                                @increase="quantity += 1"
                                @decrease="quantity = Math.max(1, quantity - 1)"
                            />

                            <button
                                class="product-details_add-button"
                                type="button"
                                @click="addProductToCart"
                            >
                                Añadir al carrito
                            </button>
                        </div>

                        <p role="status" class="product-details_feedback">
                            {{ addedMessage }}
                        </p>
                    </div>

                    <section class="product-details_farm">
                        <h2>Sobre la granja</h2>
                        <p><strong>{{ product.farmName }}</strong></p>
                        <p v-if="product.farmAddress">
                            {{ product.farmAddress }}
                        </p>
                    </section>
                </div>
            </div>
            <div class="product-details_lower">
                <section class="product-details_description">
                    <h2>Descripción</h2>
                    <p>{{ product.description }}</p>
                </section>

                <aside class="product-details_commitment">
                    <h2>Compromiso Rural</h2>
                    <p>
                        Apostamos por los productos de Asturias y por dar
                        visibilidad a sus granjas y productores.
                    </p>
                </aside>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.product-details {
    max-width: 1040px;
    margin: 24px auto 64px;
    padding: 0 24px;
    color: #111827;
    overflow-wrap: anywhere;

    &_content { margin-top: 20px; }

    &_top {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
        gap: 24px;
    }

    &_media {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        border: 1px solid #e5e9e3;
        border-radius: 8px;
        background: #fff;
    }

    &_image {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
        padding: 16px;
        object-fit: contain;
        object-position: center;
    }

    &_sidebar {
        display: grid;
        gap: 16px;
        min-width: 0;
    }

    &_farm {
        padding: 20px;
        border-radius: 8px;
        background: #f0f3ff;

        h2 {
            margin: 0 0 8px;
            font-size: 14px;
            line-height: 1.4;
        }

        p {
            margin: 4px 0 0;
            font-size: 14px;
            line-height: 1.5;
        }
    }

    &_info {
        min-width: 0;
        padding: 22px;
        border: 1px solid #e5e9e3;
        border-radius: 8px;
        background: #fff;
    }

    &_title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.35;
    }

    &_price {
        margin: 12px 0 16px;
        color: #006b2d;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.2;
    }

    &_attributes { margin: 0; }

    &_attribute {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 10px 0;
        font-size: 14px;
        border-bottom: 1px solid #e5e7eb;

        dt { color: #596457; }
        dd { margin: 0; text-align: right; }
    }

    &_actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-top: 18px;

        :deep(.quantity-control) {
            flex: 0 0 104px;
            width: 104px;
            height: 36px;
            grid-template-columns: 32px minmax(0, 1fr) 32px;
        }

        :deep(.quantity-control_button) {
            width: 32px;
            font-size: 16px;
        }

        :deep(.quantity-control_value) {
            font-size: 16px;
            line-height: 34px;
        }
    }

    &_add-button {
        flex: 0 1 200px;
        max-width: 100%;
        min-height: 36px;
        padding: 8px 12px;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        background: #006b2d;
        color: #fff;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            background: #005322;
        }

        &:focus-visible {
            outline: 2px solid #006b2d;
            outline-offset: 3px;
        }
    }

    &_feedback {
        min-height: 20px;
        margin: 12px 0 0;
        color: #006b2d;
        font-size: 14px;
        line-height: 20px;
    }

    &_lower {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        align-items: start;
        gap: 24px;
        margin-top: 40px;
    }

    &_description {
        min-width: 0;

        h2 { margin: 0 0 12px; font-size: 22px; }
        p {
            margin: 0;
            color: #3f4a3e;
            line-height: 1.7;
            white-space: pre-line;
        }
    }

    &_commitment {
        padding: 20px;
        border-radius: 8px;
        background: #006b2d;
        color: #fff;

        h2 { margin: 0 0 8px; font-size: 16px; }
        p { margin: 0; font-size: 14px; line-height: 1.6; }
    }

    &_breadcrumbs {
        font-size: 13px;
        line-height: 1.5;
        color: #596457;

        ol {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        li {
            display: flex;
            gap: 8px;
            min-width: 0;
            max-width: 100%;
        }

        a {
            color: #006b2d;
            text-decoration: none;

            &:hover { text-decoration: underline; }

            &:focus-visible {
                outline: 2px solid #006b2d;
                outline-offset: 3px;
            }
        }

        [aria-current="page"] {
            min-width: 0;
            color: #111827;
        }
    }
}

@media (max-width: 768px) {
    .product-details {
        padding: 0 16px;

        &_top { grid-template-columns: minmax(0, 1fr); }
        &_info { padding: 20px 16px; }
        &_lower {
            grid-template-columns: minmax(0, 1fr);
            margin-top: 32px;
        }
    }
}
</style>