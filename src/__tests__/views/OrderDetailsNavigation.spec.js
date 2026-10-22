import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { getMyOrder, getMyOrders } from '@/services/ordersApi';

vi.mock('@/services/ordersApi', () => ({
    getMyOrder: vi.fn(),
    getMyOrders: vi.fn(),
}));
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, createWebHistory: actual.createMemoryHistory };
});

const order = {
    id: 19, orderNumber: 'ORD-19', status: 'PENDING',
    orderDate: '2026-10-19T15:00:00', productCount: 2,
    subtotal: 25, shipping: 0, taxes: 4.34, total: 25,
    items: [{ productId: 1, name: 'Queso', quantity: 2, unitPrice: 12.5 }],
    delivery: null,
};

describe('Order details navigation', () => {
    let wrapper;

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it('opens the selected order from the account history', async () => {
        const pinia = createPinia();
        setActivePinia(pinia);
        useAuthStore(pinia).setUser({
            id: 1, firstName: 'Ana', email: 'ana@example.com',
        });
        getMyOrders.mockResolvedValueOnce({
            content: [order],
            page: { size: 3, number: 0, totalElements: 1, totalPages: 1 },
        });
        getMyOrder.mockResolvedValueOnce(order);

        await router.replace('/mi-cuenta');
        await router.isReady();
        wrapper = mount(
            { template: '<RouterView />' },
            { global: { plugins: [pinia, router] } }
        );
        await flushPromises();

        await wrapper.get('.order-history-card__link').trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.path)
            .toBe('/mi-cuenta/pedidos/19');
        expect(getMyOrder).toHaveBeenCalledExactlyOnceWith('19');
        expect(wrapper.get('.order-details').text()).toContain('ORD-19');
        expect(wrapper.find('.account-dashboard').exists()).toBe(false);
    });
});
