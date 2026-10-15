import { describe, it, expect } from "vitest";
import { mount } from '@vue/test-utils';
import HeaderComponent from "@/components/header/HeaderComponent.vue";
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const mountHeader = (pinia = createPinia()) => {
    return mount(HeaderComponent, {
        global: {
            plugins: [pinia],
            stubs: {
                RouterLink: {
                    props: ['to'],
                    template: '<a :href="to"><slot /></a>',
                },
            },
        },
    })
}

describe('HeaderComponent', () => {
    it('renders logo and navigation links', () => {
        const wrapper = mountHeader();

        expect(wrapper.text()).toContain('Tierras de Asturias');
        expect(wrapper.text()).toContain('Productos');
        expect(wrapper.text()).toContain('Granjas');
    })

    it('renders cart button', () => {
        const wrapper = mountHeader();
        const cartButton = wrapper.find('a[aria-label="Carrito"]');

        expect(cartButton.exists()).toBe(true);
    })

    it('renders the sign-in link to the login page', () => {
        const wrapper = mountHeader();
        const loginLink = wrapper.get('a.header_login');

        expect(loginLink.text()).toBe('Iniciar sesión');
        expect(loginLink.attributes('href')).toBe('/login');

        wrapper.unmount();
    });

    it('renders navigation links with correct routes', () => {
        const wrapper = mountHeader();

        expect(wrapper.find('a[href="/productos"]').exists()).toBe(true);
        expect(wrapper.find('a[href="/granjas"]').exists()).toBe(true);
    })

    it('shows the user name after authentication', async () => {
        const pinia = createPinia();
        const wrapper = mountHeader(pinia);
        const authStore = useAuthStore(pinia);

        expect(wrapper.find('.header_login').exists()).toBe(true);

        authStore.setUser({
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        });

        await nextTick();

        expect(wrapper.get('.header_account').text()).toBe('Ana');
        expect(wrapper.find('.header_login').exists()).toBe(false);

        wrapper.unmount();
    });
})