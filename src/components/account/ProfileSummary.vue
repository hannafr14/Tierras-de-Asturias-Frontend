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
    gap: 20px;
    padding: 20px;
    background: #f0f8f3;
    border: 1px solid #deebe2;
    border-radius: 8px;

    &__avatar {
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
    }

    &__details {
        min-width: 0;
        max-width: 100%;
        overflow-wrap: anywhere;

        h2 {
            margin: 0 0 6px;
            color: #172033;
            font-size: 18px;
            line-height: 26px;
        }

        p {
            margin: 0;
            color: #4f5a4f;
            font-size: 14px;
            line-height: 20px;
        }
    }
}

@media (max-width: 768px) {
    .profile-summary {
        flex-direction: column;
        gap: 12px;
        text-align: center;
    }
}
</style>
