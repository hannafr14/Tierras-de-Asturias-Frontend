<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFarmById } from '@/services/catalogApi'
import StateMessage from '@/components/common/StateMessage.vue'

const route = useRoute()
const farm = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

watch(
    () => route.params.id,
    async (id, previousId, onCleanup) => {
        let cancelled = false
        onCleanup(() => { cancelled = true })

        farm.value = null
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
        <div v-else-if="farm">
            <h1>{{ farm.name }}</h1>
            <p>{{ farm.address }}</p>
        </div>
    </section>
</template>
