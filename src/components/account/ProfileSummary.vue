<script setup>
import userDefaultIcon from '@/assets/user-default.svg';

defineProps({
    user: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <section class="profile-summary" aria-label="Mi perfil">
        <img
            class="profile-summary__avatar"
            :src="userDefaultIcon"
            alt=""
        >

        <div class="profile-summary__details">
            <h2>Hola de nuevo, {{ user.firstName }}</h2>
            <p>{{ user.email }}</p>
        </div>
    </section>
</template>

<style scoped lang="scss">
.profile-summary {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 24px;
    background: #f0f8f3;
    border: 1px solid #deebe2;
    border-radius: 8px;

    &__avatar {
        flex-shrink: 0;
        width: 88px;
        height: 88px;
        border-radius: 50%;
        object-fit: cover;
    }

    &__details {
        min-width: 0;
        overflow-wrap: anywhere;

        h2 {
            margin: 0 0 8px;
            font-size: 18px;
            line-height: 26px;
            color: #172033;
        }

        p {
            margin: 0;
            color: #4f5a4f;
            font-size: 14px;
        }
    }
}
</style>