<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getFarmById, getFarmProducts } from '@/services/catalogApi'
import StateMessage from '@/components/common/StateMessage.vue'
import MapSection from '@/components/map/MapSection.vue'
import ProductCard from '@/components/cards/ProductCard.vue'
import { useCartStore } from '@/stores/cartStore'
import fallbackImage from '@/assets/image-placeholder.svg'

const route = useRoute()
const cartStore = useCartStore()
const priceFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
})
const farm = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const imageFailed = ref(false)
const products = ref([])
const isProductsLoading = ref(true)
const productsError = ref('')
const productQuantities = ref({})

function getProductQuantity(id) {
    return productQuantities.value[id] ?? 1
}

function changeProductQuantity(id, change) {
    productQuantities.value[id] = Math.max(
        1,
        getProductQuantity(id) + change
    )
}

function addProductToCart(product) {
    const quantity = getProductQuantity(product.id)

    for (let index = 0; index < quantity; index += 1) {
        cartStore.addToCart(product)
    }

    productQuantities.value[product.id] = 1
}

const hasCoordinates = computed(() =>
    Number.isFinite(farm.value?.latitude) &&
    Number.isFinite(farm.value?.longitude)
)

const historyParagraphs = computed(() => {
    const description = farm.value?.description?.trim()
    if (!description) return []

    const paragraphs = description.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean)
    if (paragraphs.length > 1 || description.length <= 220) return paragraphs

    const sentences = Array.from(
        new Intl.Segmenter('es', { granularity: 'sentence' }).segment(description),
        ({ segment }) => segment
    )
    return sentences.length > 1
        ? [sentences[0].trim(), sentences.slice(1).join('').trim()]
        : paragraphs
})

watch(
    () => route.params.id,
    async (id, previousId, onCleanup) => {
        let cancelled = false
        onCleanup(() => { cancelled = true })

        farm.value = null
        productQuantities.value = {}
        imageFailed.value = false
        isLoading.value = true
        errorMessage.value = ''

        try {
            const data = await getFarmById(id)
            if (!cancelled) farm.value = data
        } catch (error) {
            if (!cancelled) {
                errorMessage.value = error instanceof TypeError
                    ? 'No se pudo conectar con el servidor.'
                    : error.message || 'No se pudo cargar la granja.'
            }
        } finally {
            if (!cancelled) isLoading.value = false
        }
    },
    { immediate: true }
)
watch(
    () => route.params.id,
    async (id, previousId, onCleanup) => {
        let cancelled = false
        onCleanup(() => { cancelled = true })

        products.value = []
        isProductsLoading.value = true
        productsError.value = ''

        try {
            const data = await getFarmProducts(id)
            if (!cancelled) products.value = data
        } catch (error) {
            if (!cancelled) {
                productsError.value = error instanceof TypeError
                    ? 'No se pudo conectar con el servidor.'
                    : error.message || 'No se pudieron cargar los productos.'
            }
        } finally {
            if (!cancelled) isProductsLoading.value = false
        }
    },
    { immediate: true }
)
</script>

<template>
    <section class="farm-details">
        <StateMessage v-if="isLoading" role="status"
            type="loading" message="Cargando granja..." />
        <StateMessage v-else-if="errorMessage" role="alert"
            type="error" :message="errorMessage" />
        <template v-else-if="farm">
            <nav class="farm-details_breadcrumbs" aria-label="Ruta de navegación">
                <RouterLink to="/granjas">Granjas</RouterLink>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{{ farm.name }}</span>
            </nav>

            <header class="farm-details_hero">
                <img
                    class="farm-details_hero-image"
                    :src="imageFailed ? fallbackImage : (farm.bannerImage || fallbackImage)"
                    :alt="imageFailed || !farm.bannerImage ? 'Imagen no disponible' : farm.name"
                    @error="imageFailed = true"
                />
                <div class="farm-details_hero-content">
                    <h1>{{ farm.name }}</h1>
                    <p>{{ farm.address }}</p>
                </div>
            </header>
            <section
                v-if="farm.description || hasCoordinates"
                class="farm-details_about"
                aria-label="Información de la granja"
            >
                <article v-if="farm.description" class="farm-details_history">
                    <h2 id="farm-history-title">Nuestra Historia</h2>
                    <p v-for="(paragraph, index) in historyParagraphs" :key="index">
                        {{ paragraph }}
                    </p>
                </article>

                <aside v-if="hasCoordinates" class="farm-details_location">
                    <h2>Ubicación</h2>
                    <div class="farm-details_location-map">
                        <MapSection
                            :farms="[farm]"
                            :selected-farm-id="farm.id"
                            :show-popups="false"
                        />
                    </div>
                    <p><strong>Dirección</strong><br />{{ farm.address }}</p>
                </aside>
            </section>
            <section class="farm-details_products" aria-labelledby="farm-products-title">
                <h2 id="farm-products-title">Productos de esta granja</h2>

                <StateMessage v-if="isProductsLoading" role="status"
                    type="loading" message="Cargando productos..." />
                <StateMessage v-else-if="productsError" role="alert"
                    type="error" :message="productsError" />
                <StateMessage v-else-if="!products.length" role="status"
                    type="empty" message="Esta granja todavía no tiene productos." />

                <div v-else class="farm-details_products-grid">
                    <ProductCard
                        v-for="product in products"
                        :key="product.id"
                        variant="farm"
                        :product-id="product.id"
                        :image="product.image || fallbackImage"
                        :name="product.name"
                        :description="product.description || ''"
                        :farm-name="farm.name"
                        :location="farm.address"
                        :price="priceFormatter.format(product.price)"
                        :cart-quantity="getProductQuantity(product.id)"
                        @increase="changeProductQuantity(product.id, 1)"
                        @decrease="changeProductQuantity(product.id, -1)"
                        @add-to-cart="addProductToCart(product)"
                    />
                </div>
            </section>
        </template>
    </section>
</template>

<style scoped lang="scss">
.farm-details {
    --farm-gutter: 35px;
    --farm-content-gutter: max(var(--farm-gutter), calc((100% - 1200px) / 2));
    color: #111827;

    &_breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px var(--farm-content-gutter);
        font-size: 13px;
        overflow-wrap: anywhere;
        a { color: #596457; text-underline-offset: 3px; }
    }

    &_hero { position: relative; display: grid; align-items: end; min-height: 300px; }
    &_hero-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 35%;
    }
    &_hero-content {
        position: relative;
        padding: 16px var(--farm-content-gutter);
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
        overflow-wrap: anywhere;
        h1 { margin: 0 0 8px; font-size: 32px; line-height: 1.2; }
        p { margin: 0; font-size: 14px; line-height: 1.5; }
    }

    &_about {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
        align-items: start;
        gap: 32px;
        padding: 40px var(--farm-content-gutter);
        background: #f4f6f3;
    }

    &_location {
        grid-column: 2;
        min-width: 0;
        overflow: hidden;
        border: 1px solid #e5e9e3;
        border-radius: 8px;
        background: #fff;
        h2 { margin: 0; padding: 16px; font-size: 16px; }
        p { margin: 0; padding: 16px; background: #f0f3ff; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
    }

    &_location-map {
        height: 180px;
        :deep(.map-section), :deep(.map-section_map) { min-height: 0; height: 100%; }
    }

    &_history {
        max-width: 680px;
        min-width: 0;
        overflow-wrap: anywhere;

        h2 {
            margin: 0 0 16px;
            color: #006727;
            font-size: 22px;
            line-height: 1.3;
        }

        p {
            margin: 0;
            color: #3f4a3e;
            font-size: 15px;
            line-height: 1.75;
            white-space: pre-line;
        }

        p + p { margin-top: 12px; }
    }
}
.farm-details_products {
    padding: 40px var(--farm-content-gutter);
    background: #fff;

    h2 { margin: 0 0 24px; font-size: 22px; }
}
.farm-details_products-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
}
@media (max-width: 1024px) {
    .farm-details_products-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
@media (max-width: 768px) {
    .farm-details {
        --farm-gutter: 20px;
        &_hero { min-height: 240px; }
        &_hero-content h1 { font-size: 26px; }
        &_about { grid-template-columns: minmax(0, 1fr); gap: 24px; }
        &_location { grid-column: auto; }
        &_products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
}
@media (max-width: 576px) {
    .farm-details {
        --farm-gutter: 12px;
        &_products-grid { grid-template-columns: minmax(0, 1fr); }
    }
}
</style>
