<script setup>
import HeaderComponent from './components/header/HeaderComponent.vue';
import FooterComponent from './components/footer/FooterComponent.vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function retrySession() {
    if (authStore.isRestoringSession) return;

    try {
        await authStore.restoreSession();
        const route = router.currentRoute.value;

        if (authStore.isAuthenticated && route.name === 'login') {
            await router.replace('/mi-cuenta');
        } else if (!authStore.isAuthenticated && route.meta.requiresAuth) {
            await router.replace('/login');
        }
    } catch (error) {
        console.error('Session restoration failed:', error);
    }
}
</script>

<template>
  <HeaderComponent/>
  
  <main class="app-main">
    <div v-if="authStore.sessionError" class="app-session-error">
        <p role="alert">{{ authStore.sessionError }}</p>
        <button type="button" @click="retrySession"
                :disabled="authStore.isRestoringSession"
                :aria-busy="authStore.isRestoringSession">
            {{ authStore.isRestoringSession ? 'Comprobando...' : 'Reintentar' }}
        </button>
    </div>
    <RouterView />
    <FooterComponent />
  </main>
</template>

<style scoped lang="scss">
.app-main {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-session-error {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fff0f0;
    color: #b42318;
}

.app-session-error p { margin: 0; flex: 1 1 240px; }

.app-session-error button {
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid currentColor;
    border-radius: 4px;
    background: transparent;
    color: inherit;
}
</style>
