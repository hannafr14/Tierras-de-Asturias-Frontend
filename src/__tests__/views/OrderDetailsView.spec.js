import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import OrderDetailsView from '@/views/OrderDetailsView.vue';
import { getMyOrder } from '@/services/ordersApi';

vi.mock('@/services/ordersApi', () => ({
    getMyOrder: vi.fn(),
}));

const order = {
    id: 19,
    orderNumber: 'ORD-19',
    status: 'PENDING',
    orderDate: '2026-10-19T15:00:00',
    subtotal: 25,
    shipping: 0,
    taxes: 4.34,
    total: 25,
    items: [{
        productId: 1,
        name: 'Queso',
        image: '/images/queso.jpg',
        quantity: 2,
        unitPrice: 12.5,
    }],
    delivery: {
        firstName: 'Ana',
        lastName: 'Garcia',
        city: 'Oviedo',
        postalCode: '33001',
        streetAddress: 'Calle Mayor 12',
        apartment: 'Piso 2',
        phone: '+34 600 000 000',
    },
};

describe('OrderDetailsView', () => {
    let wrapper;

    beforeEach(() => {
        getMyOrder.mockReset();
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    async function mountPage(id = '19') {
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                {
                    path: '/mi-cuenta',
                    component: { template: '<div />' },
                },
                {
                    path: '/mi-cuenta/pedidos/:id',
                    name: 'order-details',
                    component: OrderDetailsView,
                },
            ],
        });

        await router.push(`/mi-cuenta/pedidos/${id}`);
        await router.isReady();
        wrapper = mount(
            { template: '<RouterView />' },
            { global: { plugins: [router] } }
        );
        await flushPromises();
        return router;
    }

    it('shows an error when the order is unavailable', async () => {
        const message = 'Pedido no encontrado o no disponible.';
        getMyOrder.mockRejectedValueOnce(new Error(message));

        await mountPage();

        expect(getMyOrder).toHaveBeenCalledExactlyOnceWith('19');
        expect(wrapper.get('[role="alert"]').text()).toBe(message);
        expect(wrapper.find('.order-details__items').exists()).toBe(false);
        expect(wrapper.get('a').attributes('href')).toBe('/mi-cuenta');
    });

    it('displays the order, products, delivery and total', async () => {
        getMyOrder.mockResolvedValueOnce(order);
        await mountPage();

        expect(wrapper.text()).toContain('ORD-19');
        expect(wrapper.text()).toContain('Pedido recibido');
        expect(wrapper.findAll('.order-details__item')).toHaveLength(1);
        expect(wrapper.get('.order-details__item-info h3').text())
            .toBe('Queso');
        expect(wrapper.get('.order-details__item-info p').text()
            .replace(/\s+/g, ' ')).toBe('2 \u00d7 12,50 \u20ac');
        expect(wrapper.get('.order-details__item-total').text()
            .replace(/\s/g, ' ')).toBe('25,00 \u20ac');
        expect(wrapper.get('address').text()).toContain('Calle Mayor 12');
        expect(wrapper.get('.order-details__grand-total dd').text()
            .replace(/\s/g, ' ')).toBe('25,00 \u20ac');
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('returns to the account when the back link is clicked', async () => {
        getMyOrder.mockResolvedValueOnce(order);
        const router = await mountPage();

        await wrapper.get('a').trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/mi-cuenta');
        expect(wrapper.find('.order-details').exists()).toBe(false);
    });

    it('shows loading while the order request is pending', async () => {
        let resolveRequest;
        getMyOrder.mockReturnValueOnce(new Promise((resolve) => {
            resolveRequest = resolve;
        }));

        await mountPage();

        expect(wrapper.get('[role="status"]').text())
            .toBe('Cargando pedido...');
        expect(wrapper.find('.order-details__items').exists()).toBe(false);
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);

        resolveRequest(order);
        await flushPromises();

        expect(wrapper.find('[role="status"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('ORD-19');
        expect(wrapper.findAll('.order-details__item')).toHaveLength(1);
    });

    it('loads the order after retrying a failed request', async () => {
        getMyOrder
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(order);

        await mountPage();

        expect(wrapper.get('[role="alert"]').text()).toBe('Network error');

        await wrapper.get('button').trigger('click');
        await flushPromises();

        expect(getMyOrder).toHaveBeenCalledTimes(2);
        expect(getMyOrder).toHaveBeenNthCalledWith(1, '19');
        expect(getMyOrder).toHaveBeenNthCalledWith(2, '19');
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);
        expect(wrapper.find('[role="status"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('ORD-19');
    });
});