<script setup>
import AuthLayout from '@/components/auth/AuthLayout.vue';
</script>

<template>
    <AuthLayout>
        <form class="login-form" @submit.prevent>
            <div class="login-form__header">
                <h2>Bienvenido de nuevo</h2>
                <p>Identifícate para gestionar tus pedidos.</p>
            </div>
        </form>
    </AuthLayout>
</template>