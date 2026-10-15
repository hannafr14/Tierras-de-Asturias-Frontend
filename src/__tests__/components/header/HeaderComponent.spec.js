import { describe, it, expect } from "vitest";
import { mount } from '@vue/test-utils';
import HeaderComponent from "@/components/header/HeaderComponent.vue";
import { createPinia } from 'pinia';

const mountHeader = () => {
    return mount(HeaderComponent, {
        global: {
            plugins: [createPinia()],
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
})