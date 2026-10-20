<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import logoutIcon from '@/assets/logout.svg';

const router = useRouter();
const authStore = useAuthStore();
const isLoggingOut = ref(false);
const logoutError = ref('');

async function handleLogout() {
    if (isLoggingOut.value) return;

    isLoggingOut.value = true;
    logoutError.value = '';

    try {
        await authStore.logout();
        await router.replace('/login');
    } catch {
        logoutError.value =
            'No se pudo cerrar sesión. Inténtalo de nuevo.';
    } finally {
        isLoggingOut.value = false;
    }
}
</script>

<template>
    <div class="account-logout">
        <button
            class="account-logout__button"
            type="button"
            :disabled="isLoggingOut"
            :aria-busy="isLoggingOut"
            @click="handleLogout"
        >
            <img :src="logoutIcon" alt="" width="16" height="16">
            <span>
                {{ isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
            </span>
        </button>

        <p v-if="logoutError" class="account-logout__error" role="alert">
            {{ logoutError }}
        </p>
    </div>
</template>

<style scoped lang="scss">
.account-logout {
    &__button {
        min-height: 44px;
        max-width: 100%;
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: #273141;
        font-size: 14px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;

        &:hover:not(:disabled) {
            background: #e3e7f5;
        }

        &:focus-visible {
            outline: 2px solid #006727;
            outline-offset: 3px;
        }

        &:disabled {
            opacity: 0.65;
            cursor: wait;
        }
    }

    &__error {
        color: #d60000;
        font-size: 13px;
        line-height: 20px;
    }
}
</style>