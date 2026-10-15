<script setup>
import { reactive } from 'vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';

const form = reactive({
    email: '',
    password: '',
});

const errors = reactive({});

function validateForm() {
    Object.keys(errors).forEach((key) => {
        delete errors[key];
    });

    if (!form.email.trim()) {
        errors.email = 'Introduce tu correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = 'Introduce un correo electrónico válido.';
    }

    if (!form.password) {
        errors.password = 'Introduce tu contraseña.';
    }

    return Object.keys(errors).length === 0;
}

function handleSubmit() {
    if (!validateForm()) {
        return;
    }
}
</script>

<template>
    <AuthLayout class="auth-layout--top">
        <form
            class="login-form"
            novalidate
            @submit.prevent="handleSubmit"
        >
            <div class="login-form__header">
                <h2>Bienvenido de nuevo</h2>
                <p>Identifícate para gestionar tus pedidos.</p>
            </div>

            <label class="login-form__field">
                <span>Correo electrónico</span>
                <input
                    v-model="form.email"
                    type="email"
                    autocomplete="username"
                    placeholder="nombre@ejemplo.com"
                    required
                    :aria-invalid="Boolean(errors.email)"
                    :aria-describedby="errors.email ? 'login-email-error' : undefined"
                >
                <small
                    v-if="errors.email"
                    id="login-email-error"
                    class="login-form__error"
                    aria-live="polite"
                >
                    {{ errors.email }}
                </small>
            </label>

            <label class="login-form__field">
                <span>Contraseña</span>
                <input
                    v-model="form.password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="********"
                    required
                    :aria-invalid="Boolean(errors.password)"
                    :aria-describedby="errors.password ? 'login-password-error' : undefined"
                >
                <small
                    v-if="errors.password"
                    id="login-password-error"
                    class="login-form__error"
                    aria-live="polite"
                >
                    {{ errors.password }}
                </small>
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

    &__error {
        display: block;
        color: #d60000;
        font-size: 12px;
        line-height: 18px;
    }
}
</style>