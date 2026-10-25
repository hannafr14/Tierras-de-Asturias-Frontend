<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import { getFarms, getProducts } from '@/services/catalogApi';
import StateMessage from '@/components/common/StateMessage.vue';
import CatalogLayout from '@/components/catalog/CatalogLayout.vue';
import CategoryFilter from '@/components/catalog/CategoryFilter.vue';
import CatalogTabs from '@/components/catalog/CatalogTabs.vue';
import SearchBar from '@/components/catalog/SearchBar.vue';
import ProductCard from '@/components/cards/ProductCard.vue';
import MapSection from '@/components/map/MapSection.vue';
import { useCartStore } from '@/stores/cartStore';
import CatalogSortMenu from '@/components/catalog/CatalogSortMenu.vue'

const activeCategory = ref('Todos');
const searchQuery = ref('');
const sortOrder = ref('default')
const sortOptions = [
    { value: 'default', label: 'Por defecto' },
    { value: 'name-asc', label: 'Nombre: A–Z' },
    { value: 'name-desc', label: 'Nombre: Z–A' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
]

const products = ref([]);
const categories = computed(() => [
    'Todos',
    ...[...new Set(
        products.value
            .map(product => product.category)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es')),
])
const farms = ref([]);
const selectedFarmId = ref(null);
const productQuantities = ref({})
const cartStore = useCartStore()
const router = useRouter()
const openFarm = (id) => {
    router.push({ name: 'farm-details', params: { id } })
}
const isLoading = ref(false);
const errorMessage = ref('');
const catalogPageRef = ref(null)
const showScrollActions = ref(false)
const isNearPageBottom = ref(false)

const updateScrollActionsVisibility = () => {
    const appMain = document.querySelector('.app-main')

    if (!appMain) {
        showScrollActions.value = false
        isNearPageBottom.value = false
        return
    }

    const isMobile = window.innerWidth <= 576
    const isPastFilters = appMain.scrollTop > 220
    const distanceToBottom = appMain.scrollHeight - appMain.scrollTop - appMain.clientHeight

    showScrollActions.value = isMobile && isPastFilters
    isNearPageBottom.value = distanceToBottom < 120
}

const scrollToCatalogTop = () => {
    catalogPageRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    })
}

const scrollToCatalogBottom = () => {
    catalogPageRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
    })
}

const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return products.value.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(query)

        const matchesCategory =
            activeCategory.value === 'Todos' ||
            product.category === activeCategory.value

        return matchesSearch && matchesCategory
    })
})

const sortedProducts = computed(() => {
    const result = [...filteredProducts.value]

    switch (sortOrder.value) {
        case 'name-asc':
            return result.sort((a, b) =>
                a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
            )

        case 'name-desc':
            return result.sort((a, b) =>
                b.name.localeCompare(a.name, 'es', { sensitivity: 'base' })
            )

        case 'price-asc':
            return result.sort((a, b) => a.price - b.price)

        case 'price-desc':
            return result.sort((a, b) => b.price - a.price)

        default:
            return result
    }
})

const selectProductFarm = (product) => {
    selectedFarmId.value = product.farmId
}

const getProductQuantity = (productId) => {
    return productQuantities.value[productId] ?? 1
}

const decreaseProductQuantity = (productId) => {
    const quantity = getProductQuantity(productId)

    if (quantity === 1) {
        return
    }

    productQuantities.value[productId] = quantity - 1
}

const increaseProductQuantity = (productId) => {
    const quantity = getProductQuantity(productId)

    productQuantities.value[productId] = quantity + 1
}

const addProductToCart = (product) => {
    const quantity = getProductQuantity(product.id)

    for (let index = 0; index < quantity; index += 1) {
        cartStore.addToCart(product)
    }

    productQuantities.value[product.id] = 1
}

onMounted(async () => {
    document.querySelector('.app-main')?.scrollTo({
        top: 0,
        behavior: 'auto',
    })

    updateScrollActionsVisibility()
    document
    .querySelector('.app-main')
    ?.addEventListener('scroll', updateScrollActionsVisibility)

    isLoading.value = true
    errorMessage.value = ''

    try {
       const [productsData, farmsData] = await Promise.all([
            getProducts(),
            getFarms(),
        ])

        products.value = productsData
        farms.value = farmsData
    } catch (error) {
        errorMessage.value = 'No se pudieron cargar los productos.'
    } finally {
        isLoading.value = false
    }
})

onBeforeUnmount(() => {
    document
    .querySelector('.app-main')
    ?.removeEventListener('scroll', updateScrollActionsVisibility)
})
</script>

<template>
    <CatalogLayout>
        <template #content>
            <section ref="catalogPageRef" class="catalog-page">
                <CatalogTabs />
                
                <div class="catalog-page_header">
                    <h1 class="catalog-page_title">Productos locales de Asturias</h1>
                    <p class="catalog-page_description">
                        Descubre alimentos frescos directamente de granjas asturianas.
                    </p>
                </div>

                <div class="catalog-page_categories">
                    <CategoryFilter
                        :categories="categories"
                        :active-category="activeCategory"
                        @select="activeCategory = $event"
                    />
                </div>
                
                <div class="catalog-page_toolbar">
                    <SearchBar
                        v-model="searchQuery"
                        placeholder="Buscar productos"
                    />

                    <CatalogSortMenu v-model="sortOrder" :options="sortOptions" />
                </div>

                <StateMessage
                    v-if="isLoading"
                    type="loading"
                    message="Cargando productos..."
                />

                <StateMessage
                    v-else-if="errorMessage"
                    type="error"
                    :message="errorMessage"
                />

                <StateMessage
                    v-else-if="filteredProducts.length === 0"
                    type="empty"
                    message="No hay productos disponibles."
                />

                <div v-else class="catalog-page_list">
                    <ProductCard
                        v-for="product in sortedProducts"
                        :key="product.id"
                        :product-id="product.id"
                        :image="product.image"
                        :name="product.name"
                        :farm-name="product.farmName"
                        :location="product.farmAddress"
                        :price="`${product.price}€`"
                        :cart-quantity="getProductQuantity(product.id)"
                        @click="selectProductFarm(product)"
                        @add-to-cart="addProductToCart(product)"
                        @decrease="decreaseProductQuantity(product.id)"
                        @increase="increaseProductQuantity(product.id)"
                    />
                </div>

                <div
                    v-if="filteredProducts.length > 0 && showScrollActions"
                    class="catalog-page_scroll-actions"
                >
                    <button
                        class="catalog-page_scroll-button"
                        type="button"
                        aria-label="Subir al inicio"
                        @click="scrollToCatalogTop"
                    >
                        ↑
                    </button>

                    <button
                        v-if="!isNearPageBottom"
                        class="catalog-page_scroll-button"
                        type="button"
                        aria-label="Bajar al final"
                        @click="scrollToCatalogBottom"
                    >
                        ↓
                    </button>
                </div>
            </section>
        </template>

        <template #map>
            <MapSection 
                :farms="farms"
                v-model:selected-farm-id="selectedFarmId"
                @view-farm="openFarm"
            />
        </template>
    </CatalogLayout>
</template>
<style scoped lang="scss">
.catalog-page {
    &_header {
        margin-bottom: 28px;
    }

    &_title {
        margin: 0 0 8px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
        line-height: 36px;
    }

    &_description {
        margin: 0;
        color: #3F4A3E;
        font-size: 13px;
        font-weight: 400;
        line-height: 20px;
    }

    &_categories {
        min-width: 0;
        max-width: 100%;
        margin-bottom: 22px;
        overflow: hidden;
    }

    &_toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }
    
    &_list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 28px;
        padding-bottom: 32px;
    }
    &_scroll-actions {
        display: none;
    }

    &_scroll-button {
        position: fixed;
        left: 50%;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border: 1px solid rgba(190, 202, 186, 0.65);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.72);
        color: #007A3D;
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(17, 24, 39, 0.16);
        backdrop-filter: blur(4px);
        transform: translateX(-50%);
        pointer-events: auto;

        &:first-child {
            top: 72px;
        }

        &:last-child {
            bottom: 36px;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.92);
        }
    }
}

@media (max-width: 576px) {
    .catalog-page {
        width: 100%;
        max-width: 100%;
        min-width: 0;

        &_header {
            margin-bottom: 16px;
        }

        &_title {
            font-size: 20px;
            line-height: 26px;
            margin-bottom: 6px;
        }

        &_description {
            font-size: 12px;
            line-height: 18px;
        }

        &_categories {
            margin-bottom: 16px;
        }

        &_toolbar {
            gap: 8px;
            margin-bottom: 18px;
        }

        &_list {
            grid-template-columns: repeat(2, minmax(0, 190px));
            justify-content: space-between;
            gap: 12px;
        }

        &_scroll-button {
            width: 36px;
            height: 36px;
            font-size: 19px;

            &:first-child {
                top: 56px;
            }

            &:last-child {
                bottom: 30px;
            }
        }

        &_scroll-actions {
            display: block;
            pointer-events: none;
        }
    }
}
</style>
