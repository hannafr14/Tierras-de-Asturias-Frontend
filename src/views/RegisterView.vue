<script setup>
import { reactive, ref } from 'vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { registerUser, loginUser } from '@/services/authApi';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const isAccountCreated = ref(false);

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
});

const errors = reactive({});
const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref('');

function validateForm() {
    Object.keys(errors).forEach((key) => {
        delete errors[key];
    });

    if (!form.firstName.trim()) {
        errors.firstName = 'Introduce tu nombre.';
    }

    if (!form.lastName.trim()) {
        errors.lastName = 'Introduce tus apellidos.';
    }

    if (!form.email.trim()) {
        errors.email = 'Introduce tu correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = 'Introduce un correo electrónico válido.';
    }

    if (!form.password) {
        errors.password = 'Introduce una contraseña.';
    } else if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña.';
    } else if (form.confirmPassword !== form.password) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!form.acceptTerms) {
        errors.acceptTerms = 'Debes aceptar los términos y la privacidad.';
    }

    return Object.keys(errors).length === 0;
}

async function handleSubmit() {
    if (isSubmitting.value || isAccountCreated.value) return;

    submitError.value = '';
    submitSuccess.value = '';
    if (!validateForm()) return;

    isSubmitting.value = true;
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    try {
        await registerUser({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email,
            password,
        });
        isAccountCreated.value = true;
        submitSuccess.value = 'Cuenta creada correctamente.';

        const user = await loginUser({
            email,
            password,
            rememberMe: false,
        });
        authStore.setUser(user);
        await router.replace('/mi-cuenta');
    } catch (error) {
        if (isAccountCreated.value) {
            submitError.value =
                'Tu cuenta está creada, pero no se pudo iniciar sesión. Usa el enlace «Iniciar sesión».';
        } else if (error instanceof TypeError) {
            submitError.value = 'No se pudo conectar con el servidor.';
        } else {
            submitError.value = error.message || 'No se pudo crear la cuenta.';
        }
    } finally {
        if (isAccountCreated.value) {
            form.password = '';
            form.confirmPassword = '';
        }
        isSubmitting.value = false;
    }
}
</script>

<template>
    <AuthLayout>
        <form
            class="register-form"
            novalidate
            @submit.prevent="handleSubmit"
        >
            <div class="register-form__header">
                <h2>Crea tu cuenta</h2>
                <p>Registrate para empezar a disfrutar de lo mejor de Asturias.</p>
            </div>

            <label class="register-form__field">
                <span>Nombre</span>
                <input
                    v-model="form.firstName"
                    type="text"
                    autocomplete="given-name"
                    placeholder="Juan"
                    required
                    :aria-invalid="Boolean(errors.firstName)"
                    :aria-describedby="errors.firstName ? 'first-name-error' : undefined"
                >
                <small
                    v-if="errors.firstName"
                    id="first-name-error"
                    class="register-form__error"
                    aria-live="polite"
                >
                    {{ errors.firstName }}
                </small>
            </label>

            <label class="register-form__field">
                <span>Apellidos</span>
                <input
                    v-model="form.lastName"
                    type="text"
                    autocomplete="family-name"
                    placeholder="Perez"
                    required
                    :aria-invalid="Boolean(errors.lastName)"
                    :aria-describedby="errors.lastName ? 'last-name-error' : undefined"
                >
                <small
                    v-if="errors.lastName"
                    id="last-name-error"
                    class="register-form__error"
                    aria-live="polite"
                >
                    {{ errors.lastName }}
                </small>
            </label>

            <label class="register-form__field">
                <span>Correo electronico</span>
                <input
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="nombre@ejemplo.com"
                    required
                    :aria-invalid="Boolean(errors.email)"
                    :aria-describedby="errors.email ? 'email-error' : undefined"
                >
                <small
                    v-if="errors.email"
                    id="email-error"
                    class="register-form__error"
                    aria-live="polite"
                >
                    {{ errors.email }}
                </small>
            </label>

            <label class="register-form__field">
                <span>Contrasena</span>
                <input
                    v-model="form.password"
                    type="password"
                    autocomplete="new-password"
                    placeholder="********"
                    required
                    minlength="8"
                    :aria-invalid="Boolean(errors.password)"
                    :aria-describedby="errors.password ? 'password-error' : undefined"
                >
                <small
                    v-if="errors.password"
                    id="password-error"
                    class="register-form__error"
                    aria-live="polite"
                >
                    {{ errors.password }}
                </small>
            </label>

            <label class="register-form__field">
                <span>Confirmar</span>
                <input
                    v-model="form.confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    placeholder="********"
                    required
                    :aria-invalid="Boolean(errors.confirmPassword)"
                    :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
                >
                <small
                    v-if="errors.confirmPassword"
                    id="confirm-password-error"
                    class="register-form__error"
                    aria-live="polite"
                >
                    {{ errors.confirmPassword }}
                </small>
            </label>

            <label class="register-form__terms">
                <input
                    v-model="form.acceptTerms"
                    type="checkbox"
                    required
                    :aria-invalid="Boolean(errors.acceptTerms)"
                    :aria-describedby="errors.acceptTerms ? 'terms-error' : undefined"
                >
                <span>
                    Acepto los terminos y condiciones y la politica de privacidad.

                    <small
                    v-if="errors.acceptTerms"
                    id="terms-error"
                    class="register-form__error"
                    aria-live="polite"
                    >
                    {{ errors.acceptTerms }}
                    </small>
                </span>
            </label>

            <p
                v-if="submitError"
                class="register-form__error"
                role="alert"
            >
                {{ submitError }}
            </p>

            <p
                v-if="submitSuccess"
                class="register-form__success"
                role="status"
                >
                {{ submitSuccess }}
            </p>

            <button
                class="register-form__submit"
                type="submit"
                :disabled="isSubmitting || isAccountCreated"
                :aria-busy="isSubmitting"
                >
                {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>

            <p class="register-form__login">
                ¿Ya tienes cuenta?
                <RouterLink to="/login">Iniciar sesion</RouterLink>
            </p>
        </form>
    </AuthLayout>
</template>

<style scoped lang="scss">
.register-form {
    &__header {
        margin-bottom: 28px;

        h2 {
            margin: 0 0 8px;
            color: #172033;
            font-size: 30px;
            font-weight: 800;
            line-height: 38px;
        }

        p {
            margin: 0;
            color: #4f5a4f;
            font-size: 14px;
            font-weight: 500;
            line-height: 21px;
        }
    }

    &__field {
        display: grid;
        gap: 7px;
        margin-bottom: 17px;

        span {
            color: #273141;
            font-size: 12px;
            font-weight: 700;
            line-height: 16px;
        }

        input {
            width: 100%;
            min-height: 43px;
            padding: 0 14px;
            border: 1px solid #cbd5c6;
            border-radius: 6px;
            color: #172033;
            font-size: 14px;
            outline: none;

            &:focus {
                border-color: #006727;
                box-shadow: 0 0 0 3px rgba(0, 103, 39, 0.12);
            }
        }
    }

    &__terms {
        display: flex;
        gap: 10px;
        margin: 8px 0 26px;
        color: #3f4a3e;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;

        input {
            width: 16px;
            height: 16px;
            margin-top: 1px;
            accent-color: #006727;
            flex: 0 0 auto;
        }
    }

    &__submit {
        width: 100%;
        min-height: 50px;
        border: none;
        border-radius: 6px;
        background: #006727;
        color: #ffffff;
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;

        &:hover {
            background: #00531f;
        }

        &:disabled {
            opacity: 0.65;
            cursor: wait;
        }
    }

    &__login {
        margin: 28px 0 0;
        padding-top: 24px;
        border-top: 1px solid #e1e7dd;
        color: #4f5a4f;
        text-align: center;
        font-size: 13px;
        font-weight: 500;

        a {
            color: #006727;
            font-weight: 800;
            text-decoration: none;
        }
    }

    &__error {
        display: block;
        color: #d60000;
        font-size: 12px;
        line-height: 18px;
    }

    &__success {
        color: #006727;
        font-size: 14px;
        line-height: 21px;
    }
}

@media (max-width: 576px) {
  .register-form {
        &__header h2 {
            font-size: 25px;
            line-height: 32px;
        }
    }
}
</style>