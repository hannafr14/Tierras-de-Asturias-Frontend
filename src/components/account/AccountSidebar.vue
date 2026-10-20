<script setup>
import ordersIcon from '@/assets/orders.svg';
</script>

<template>
    <nav class="account-sidebar" aria-label="Mi cuenta">
        <p class="account-sidebar__title">MI CUENTA</p>
        <RouterLink
            class="account-sidebar__link"
            to="/mi-cuenta"
            exact-active-class="account-sidebar__link--active"
        >
            <img :src="ordersIcon" alt="" width="16" height="16">
            <span>Mis Pedidos</span>
        </RouterLink>
    </nav>
</template>

<style scoped lang="scss">
.account-sidebar {
    min-width: 0;

    &__title {
        margin: 0 12px 16px;
        color: #4f5a4f;
        font-size: 13px;
        line-height: 20px;
    }

    &__link {
        display: flex;
        align-items: center;
        min-height: 46px;
        padding: 12px;
        border-radius: 8px;
        color: #3f4a3e;
        text-decoration: none;
        font-size: 14px;
        gap: 10px;

        &--active {
            background: #006727;
            color: #ffffff;

            img {
                filter: brightness(0) invert(1);
            }
        }

        &:focus-visible {
            outline: 2px solid #006727;
            outline-offset: 3px;
        }
    }
}

@media (max-width: 576px) {
    .account-sidebar__title {
        display: none;
    }
}
</style>