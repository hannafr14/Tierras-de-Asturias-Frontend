<script setup>
import { useAuthStore } from '@/stores/authStore';
import ProfileSummary from '@/components/account/ProfileSummary.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import OrderHistory from '@/components/account/OrderHistory.vue';

const authStore = useAuthStore();
</script>

<template>
    <div class="account-dashboard">
        <div class="account-dashboard__layout">
            <AccountSidebar v-if="authStore.isAuthenticated" />

            <section class="account-dashboard__content">
                <h1>Mi Perfil</h1>

                <ProfileSummary
                    v-if="authStore.user"
                    :user="authStore.user"
                />

                <OrderHistory />
            </section>
        </div>
    </div>
</template>

<style scoped lang="scss">
.account-dashboard {
    min-height: calc(100dvh - 59px - 94px);
    padding: 32px 35px;
    background: #f9f9ff;

    &__layout {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        align-items: start;
        gap: 28px;
        max-width: 1100px;
        margin: 0 auto;
    }

    &__content {
        min-width: 0;

        h1 {
            margin: 0 0 24px;
            color: #172033;
            font-size: 28px;
            line-height: 36px;
            font-weight: 700;
        }
    }

    @media (max-width: 768px) {
        &__layout {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    @media (max-width: 576px) {
        min-height: calc(100dvh - 44px - 76px);
        padding: 24px 14px;
    }
}
</style>