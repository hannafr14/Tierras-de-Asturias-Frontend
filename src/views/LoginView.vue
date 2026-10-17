<script setup>
import { reactive, ref } from 'vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { loginUser } from '@/services/authApi';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
    email: '',
    password: '',
    rememberMe: false,
});

const errors = reactive({});
const isSubmitting = ref(false);
const submitError = ref('');

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

async function handleSubmit() {
    if (isSubmitting.value) {
        return;
    }

    submitError.value = '';

    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    try {
        const user = await loginUser({
            email: form.email.trim().toLowerCase(),
            password: form.password,
            rememberMe: form.rememberMe,
        });

        authStore.setUser(user);
        form.password = '';

        await router.push('/productos');
    } catch (error) {
        if (error instanceof TypeError) {
            submitError.value = 'No se pudo conectar con el servidor.';
        } else {
            submitError.value = error.message || 'No se pudo iniciar sesión.';
        }
    } finally {
        isSubmitting.value = false;
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

            <label class="login-form__remember">
                <input
                    v-model="form.rememberMe"
                    type="checkbox"
                    :disabled="isSubmitting"
                >
                <span>Recordarme en este dispositivo</span>
            </label>

            <p
                v-if="submitError"
                class="login-form__error"
                role="alert"
            >
                {{ submitError }}
            </p>

            <button
                class="login-form__submit"
                type="submit"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
            >
                {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
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

    &__remember {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 20px;
        color: #4f5a4f;
        font-size: 13px;
        line-height: 20px;
        cursor: pointer;

        input {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            margin: 2px 0 0;
            accent-color: #006727;
        }
    }

    &__error {
        display: block;
        color: #d60000;
        font-size: 12px;
        line-height: 18px;
    }
}
</style>