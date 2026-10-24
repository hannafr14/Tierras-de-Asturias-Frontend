<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getFarmById } from '@/services/catalogApi'
import StateMessage from '@/components/common/StateMessage.vue'
import fallbackImage from '@/assets/image-placeholder.svg'

const route = useRoute()
const farm = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const imageFailed = ref(false)

watch(
    () => route.params.id,
    async (id, previousId, onCleanup) => {
        let cancelled = false
        onCleanup(() => { cancelled = true })

        farm.value = null
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
                    :src="imageFailed ? fallbackImage : (farm.image || fallbackImage)"
                    :alt="imageFailed || !farm.image ? 'Imagen no disponible' : farm.name"
                    @error="imageFailed = true"
                />
                <div class="farm-details_hero-content">
                    <h1>{{ farm.name }}</h1>
                    <p>{{ farm.address }}</p>
                </div>
            </header>
            <section
                v-if="farm.description"
                class="farm-details_about"
                aria-labelledby="farm-history-title"
            >
                <article class="farm-details_history">
                    <h2 id="farm-history-title">Nuestra Historia</h2>
                    <p>{{ farm.description }}</p>
                </article>
            </section>
        </template>
    </section>
</template>

<style scoped lang="scss">
.farm-details {
    --farm-gutter: 35px;
    color: #111827;

    &_breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px var(--farm-gutter);
        font-size: 13px;
        overflow-wrap: anywhere;
        a { color: #596457; text-underline-offset: 3px; }
    }

    &_hero { position: relative; display: grid; align-items: end; min-height: 300px; }
    &_hero-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    &_hero-content {
        position: relative;
        padding: 24px var(--farm-gutter);
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        overflow-wrap: anywhere;
        h1 { margin: 0 0 8px; font-size: 32px; line-height: 1.2; }
        p { margin: 0; font-size: 14px; line-height: 1.5; }
    }

    &_about {
        padding: 40px var(--farm-gutter);
        background: #f4f6f3;
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
    }
}
@media (max-width: 768px) {
    .farm-details {
        --farm-gutter: 20px;
        &_hero { min-height: 240px; }
        &_hero-content h1 { font-size: 26px; }
    }
}
@media (max-width: 576px) {
    .farm-details { --farm-gutter: 12px; }
}
</style>
