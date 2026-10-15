import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import LoginView from '@/views/LoginView.vue';

const mountLogin = () => mount(LoginView, {
    global: {
        stubs: {
            RouterLink: RouterLinkStub,
        },
    },
});

describe('LoginView', () => {
    it('renders the login form', () => {
        const wrapper = mountLogin();

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
        const wrapper = mountLogin();

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
        const wrapper = mountLogin();
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

        expect(wrapper.findAll('.login-form__error')).toHaveLength(0);
        expect(emailInput.attributes('aria-invalid')).toBe('false');
        expect(passwordInput.attributes('aria-invalid')).toBe('false');
        expect(emailInput.attributes('aria-describedby')).toBeUndefined();
        expect(passwordInput.attributes('aria-describedby')).toBeUndefined();

        wrapper.unmount();
    });
});