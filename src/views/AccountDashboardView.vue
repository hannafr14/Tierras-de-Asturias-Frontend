<script setup>
import { useAuthStore } from '@/stores/authStore';
import ProfileSummary from '@/components/account/ProfileSummary.vue';

const authStore = useAuthStore();
</script>

<template>
    <div class="account-dashboard">
        <div class="account-dashboard__content">
            <h1>Mi Perfil</h1>

            <ProfileSummary
                v-if="authStore.user"
                :user="authStore.user"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.account-dashboard {
    min-height: calc(100dvh - 59px - 94px);
    padding: 32px 35px;
    background: #f9f9ff;

    &__content {
        max-width: 1100px;
        margin: 0 auto;

        h1 {
            margin: 0 0 24px;
            color: #172033;
            font-size: 28px;
            line-height: 36px;
            font-weight: 700;
        }
    }

    @media (max-width: 576px) {
        min-height: calc(100dvh - 44px - 76px);
        padding: 24px 14px;
    }
}
</style>