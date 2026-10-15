import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils';
import LoginView from '@/views/LoginView.vue';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { loginUser } from '@/services/authApi';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/services/authApi', () => ({
    loginUser: vi.fn(),
    getCurrentUser: vi.fn(),
}));

const mountLogin = async () => {
    const pinia = createPinia();

    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/login', component: LoginView },
            {
                path: '/productos',
                component: { template: '<div>Productos</div>' },
            },
            {
                path: '/register',
                component: { template: '<div>Registro</div>' },
            },
        ],
    });

    await router.push('/login');
    await router.isReady();

    const wrapper = mount(LoginView, {
        global: {
            plugins: [pinia, router],
            stubs: {
                RouterLink: RouterLinkStub,
            },
        },
    });

    return { wrapper, router, pinia };
};

describe('LoginView', () => {
    beforeEach(() => {
        loginUser.mockReset();

        loginUser.mockResolvedValue({
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        });
    });

    it('renders the login form', async () => {
        const { wrapper } = await mountLogin();

        expect(wrapper.get('h2').text()).toBe('Bienvenido de nuevo');
        expect(wrapper.get('input[type="email"]').exists()).toBe(true);
        expect(wrapper.get('input[type="password"]').exists()).toBe(true);
        expect(wrapper.get('button[type="submit"]').text())
            .toBe('Iniciar sesión');

        expect(wrapper.getComponent(RouterLinkStub).props('to'))
            .toBe('/register');

        expect(wrapper.findAll('.login-form__error')).toHaveLength(0);

        wrapper.unmount();
    });

    it('shows errors when submitting an empty form', async () => {
        const { wrapper } = await mountLogin();

        await wrapper.get('form').trigger('submit');

        expect(wrapper.get('#login-email-error').text())
            .toBe('Introduce tu correo electrónico.');
        expect(wrapper.get('#login-password-error').text())
            .toBe('Introduce tu contraseña.');

        const emailInput = wrapper.get('input[type="email"]');
        const passwordInput = wrapper.get('input[type="password"]');

        expect(emailInput.attributes('aria-invalid')).toBe('true');
        expect(emailInput.attributes('aria-describedby'))
            .toBe('login-email-error');

        expect(passwordInput.attributes('aria-invalid')).toBe('true');
        expect(passwordInput.attributes('aria-describedby'))
            .toBe('login-password-error');

        wrapper.unmount();
    });

    it('clears validation errors after correcting the fields', async () => {
        const { wrapper } = await mountLogin();
        const emailInput = wrapper.get('input[type="email"]');
        const passwordInput = wrapper.get('input[type="password"]');

        await emailInput.setValue('ana');
        await wrapper.get('form').trigger('submit');

        expect(wrapper.get('#login-email-error').text())
            .toBe('Introduce un correo electrónico válido.');
        expect(wrapper.get('#login-password-error').text())
            .toBe('Introduce tu contraseña.');

        await emailInput.setValue('ana@example.com');
        await passwordInput.setValue('password123');
        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(wrapper.findAll('.login-form__error')).toHaveLength(0);
        expect(emailInput.attributes('aria-invalid')).toBe('false');
        expect(passwordInput.attributes('aria-invalid')).toBe('false');
        expect(emailInput.attributes('aria-describedby')).toBeUndefined();
        expect(passwordInput.attributes('aria-describedby')).toBeUndefined();

        wrapper.unmount();
    });

    it('logs in, stores the profile and opens products', async () => {
        const { wrapper, router, pinia } = await mountLogin();

        await wrapper.get('input[type="email"]').setValue('ANA@example.com');
        await wrapper.get('input[type="password"]').setValue('password123');

        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(loginUser).toHaveBeenCalledTimes(1);
        expect(loginUser).toHaveBeenCalledWith({
            email: 'ana@example.com',
            password: 'password123',
        });

        const authStore = useAuthStore(pinia);

        expect(authStore.user).toEqual({
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        });
        expect(authStore.isAuthenticated).toBe(true);

        expect(router.currentRoute.value.path).toBe('/productos');
        expect(wrapper.get('input[type="password"]').element.value).toBe('');
        expect(wrapper.get('button[type="submit"]').element.disabled).toBe(false);

        wrapper.unmount();
    });

    it('shows a login error and allows retrying', async () => {
        loginUser.mockRejectedValueOnce(
            new Error('El correo electrónico o la contraseña son incorrectos.')
        );

        const { wrapper, router, pinia } = await mountLogin();
        const authStore = useAuthStore(pinia);

        await wrapper.get('input[type="email"]').setValue('ana@example.com');
        await wrapper.get('input[type="password"]').setValue('wrongpassword');
        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(wrapper.get('[role="alert"]').text())
            .toBe('El correo electrónico o la contraseña son incorrectos.');
        expect(authStore.user).toBeNull();
        expect(authStore.isAuthenticated).toBe(false);
        expect(router.currentRoute.value.path).toBe('/login');
        expect(wrapper.get('button[type="submit"]').element.disabled).toBe(false);

        await wrapper.get('input[type="password"]').setValue('password123');
        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(loginUser).toHaveBeenCalledTimes(2);
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);
        expect(authStore.isAuthenticated).toBe(true);
        expect(router.currentRoute.value.path).toBe('/productos');

        wrapper.unmount();
    });

    it('blocks repeated submissions while login is pending', async () => {
        let resolveLogin;

        loginUser.mockReturnValueOnce(new Promise((resolve) => {
            resolveLogin = resolve;
        }));

        const { wrapper, router, pinia } = await mountLogin();
        const authStore = useAuthStore(pinia);

        await wrapper.get('input[type="email"]').setValue('ana@example.com');
        await wrapper.get('input[type="password"]').setValue('password123');
        await wrapper.get('form').trigger('submit');

        const button = wrapper.get('button[type="submit"]');

        expect(button.element.disabled).toBe(true);
        expect(button.text()).toBe('Iniciando sesión…');
        expect(button.attributes('aria-busy')).toBe('true');
        expect(authStore.isAuthenticated).toBe(false);
        expect(router.currentRoute.value.path).toBe('/login');

        await wrapper.get('form').trigger('submit');

        expect(loginUser).toHaveBeenCalledTimes(1);

        resolveLogin({
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        });

        await flushPromises();

        expect(button.element.disabled).toBe(false);
        expect(button.attributes('aria-busy')).toBe('false');
        expect(authStore.isAuthenticated).toBe(true);
        expect(router.currentRoute.value.path).toBe('/productos');

        wrapper.unmount();
    });
});