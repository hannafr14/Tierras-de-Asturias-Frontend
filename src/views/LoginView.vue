<script setup>
import AuthLayout from '@/components/auth/AuthLayout.vue';
</script>

<template>
    <AuthLayout class="auth-layout--top">
        <form class="login-form" @submit.prevent>
            <div class="login-form__header">
                <h2>Bienvenido de nuevo</h2>
                <p>Identifícate para gestionar tus pedidos.</p>
            </div>

            <label class="login-form__field">
                <span>Correo electrónico</span>
                <input
                    type="email"
                    autocomplete="username"
                    placeholder="nombre@ejemplo.com"
                    required
                >
            </label>

            <label class="login-form__field">
                <span>Contraseña</span>
                <input
                    type="password"
                    autocomplete="current-password"
                    placeholder="********"
                    required
                >
            </label>

            <button class="login-form__submit" type="submit">
                Iniciar sesión
            </button>

            <p class="login-form__register">
                ¿No tienes cuenta?
                <RouterLink to="/register">Crear cuenta</RouterLink>
            </p>
        </form>
    </AuthLayout>
</template>

<style scoped lang="scss">
@use '@/scss/auth-form';

.login-form {
    @include auth-form.base;
}
</style>