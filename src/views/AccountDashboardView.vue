<script setup>
import { useAuthStore } from '@/stores/authStore';
import ProfileSummary from '@/components/account/ProfileSummary.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import OrderHistory from '@/components/account/OrderHistory.vue';
import AccountLogoutButton from '@/components/account/AccountLogoutButton.vue';

const authStore = useAuthStore();
</script>

<template>
    <div class="account-dashboard">
        <div class="account-dashboard__layout">
            <section class="account-dashboard__content">
                <RouterLink class="account-dashboard__back" to="/">
                    <span aria-hidden="true">&larr;</span>
                    Volver al inicio
                </RouterLink>
                <h1>Mi Perfil</h1>
                <ProfileSummary v-if="authStore.user" :user="authStore.user" />
            </section>

            <AccountSidebar class="account-dashboard__sidebar" />
            <OrderHistory class="account-dashboard__history" />
            <AccountLogoutButton class="account-dashboard__logout" />
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
        margin: 0;
        grid-template-areas: "sidebar profile" "logout profile" ". history";
    }

    &__content {
        grid-area: profile;
        padding: 24px 24px 0;
        min-width: 0;

        h1 {
            margin: 0 0 24px;
            color: #172033;
            font-size: 28px;
            line-height: 36px;
            font-weight: 700;
        }
    }
}

.account-dashboard__sidebar { grid-area: sidebar; }

.account-dashboard .account-dashboard__history {
    grid-area: history;
    padding: 0 24px 24px;
}

.account-dashboard .account-dashboard__logout {
    grid-area: logout;
}

.account-dashboard__back {
    display: none;
}

.account-dashboard__back:focus-visible {
    outline: 2px solid #006727;
    outline-offset: 3px;
}

@media (max-width: 576px) {
    .account-dashboard {
        min-height: calc(100dvh - 44px - 76px);
        padding: 4px 14px;
    }

    .account-dashboard__back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 32px;
        margin-bottom: 12px;
        color: #006727;
        font-size: 13px;
        text-decoration: none;
    }

    .account-dashboard__content h1 {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }
}

.account-dashboard__layout::before {
    content: "";
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: stretch;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 24px rgba(23, 32, 51, 0.07);
    pointer-events: none;
}

@media (max-width: 768px) {
    .account-dashboard__layout::before { display: none; }
    .account-dashboard__content { padding: 0; }
    .account-dashboard .account-dashboard__history { padding: 0; }

    .account-dashboard {
        display: flex;
        flex-direction: column;
    }

    .account-dashboard__layout {
        flex: 1 0 auto;
        width: 100%;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto 1fr auto;
        grid-template-areas:
            "profile"
            "sidebar"
            "history"
            "logout";
    }

    .account-dashboard .account-dashboard__logout {
        align-self: end;
    }
}
</style>