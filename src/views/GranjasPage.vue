<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import { getFarms } from '@/services/catalogApi';
import StateMessage from '@/components/common/StateMessage.vue';
import CatalogLayout from '@/components/catalog/CatalogLayout.vue';
import CategoryFilter from '@/components/catalog/CategoryFilter.vue';
import CatalogTabs from '@/components/catalog/CatalogTabs.vue';
import SearchBar from '@/components/catalog/SearchBar.vue';
import CatalogSortMenu from '@/components/catalog/CatalogSortMenu.vue';
import FarmCard from '@/components/cards/FarmCard.vue';
import MapSection from '@/components/map/MapSection.vue';

const categories = ['Todos', 'Quesos', 'Sidra', 'Miel', 'Verduras', 'Frutos', 'Vinos'];
const router = useRouter()
const openFarm = (id) => {
    router.push({ name: 'farm-details', params: { id } })
}
const activeCategory = ref('Todos');
const searchQuery = ref('');
const sortOrder = ref('default')
const sortOptions = [
    { value: 'default', label: 'Por defecto' },
    { value: 'name-asc', label: 'Nombre: A\u2013Z' },
    { value: 'name-desc', label: 'Nombre: Z\u2013A' },
]
const farms = ref([]);
const selectedFarmId = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

const filteredFarms = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return farms.value.filter((farm) => {
        const matchesCategory =
            activeCategory.value === 'Todos' ||
            farm.categories.includes(activeCategory.value)

        const searchableText = [
            farm.name,
            farm.address,
            ...farm.categories,
        ]
            .join(' ')
            .toLowerCase()

        const matchesSearch = searchableText.includes(query)

        return matchesCategory && matchesSearch
    })
})

const sortedFarms = computed(() => {
    const result = [...filteredFarms.value]

    if (sortOrder.value === 'name-asc') {
        return result.sort((a, b) =>
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        )
    }

    if (sortOrder.value === 'name-desc') {
        return result.sort((a, b) =>
            b.name.localeCompare(a.name, 'es', { sensitivity: 'base' })
        )
    }

    return result
})

onMounted(async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        farms.value = await getFarms()
    } catch (error) {
        errorMessage.value = 'No se pudieron cargar las granjas.'
    } finally {
        isLoading.value = false
    }
})

</script>
<template>
    <CatalogLayout>
        <template #content>
            <section class="catalog-page">
                <CatalogTabs />
                
                <div class="catalog-page_header">
                    <h1 class="catalog-page_title">Granjas locales de Asturias</h1>
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
                        placeholder="Buscar granjas"
                    />

                    <CatalogSortMenu v-model="sortOrder" :options="sortOptions" />
                </div>

                <StateMessage
                    v-if="isLoading"
                    type="loading"
                    message="Cargando granjas..."
                />

                <StateMessage
                    v-else-if="errorMessage"
                    type="error"
                    :message="errorMessage"
                />

                <StateMessage
                    v-else-if="filteredFarms.length === 0"
                    type="empty"
                    message="No hay granjas disponibles."
                />

                <div v-else class="catalog-page_list">
                    <FarmCard
                        v-for="farm in sortedFarms"
                        :key="farm.id"
                        :image="farm.image"
                        :name="farm.name"
                        :location="farm.address"
                        :tags="farm.categories"
                        @view-farm="openFarm(farm.id)"
                        @click="selectedFarmId = farm.id"
                    />
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
    }
}

@media (max-width: 576px) {
    .catalog-page {
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
            grid-template-columns: 1fr;
            gap: 16px;
        }
    }
}
</style>
