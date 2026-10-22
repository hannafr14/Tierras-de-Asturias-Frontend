import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { getMyOrders } from '@/services/ordersApi';

vi.mock('@/services/ordersApi', () => ({
    getMyOrders: vi.fn(),
    getMyOrder: vi.fn(),
}));
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, createWebHistory: actual.createMemoryHistory };
});

const order = {
    id: 22, orderNumber: 'ORD-22', status: 'PENDING',
    total: 52.2, orderDate: '2026-10-20T14:34:21', productCount: 4,
};

describe('Order confirmation navigation', () => {
    let wrapper;

    afterEach(() => {
        wrapper?.unmount();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('opens the account and displays the recently created order', async () => {
        localStorage.clear();
        const pinia = createPinia();
        setActivePinia(pinia);
        useAuthStore(pinia).setUser({
            id: 1, firstName: 'Ana', email: 'ana@example.com',
        });
        sessionStorage.setItem('tierras-last-order', JSON.stringify({
            orderNumber: order.orderNumber,
            date: order.orderDate,
            total: order.total,
        }));
        getMyOrders.mockResolvedValueOnce({
            content: [order],
            page: { size: 3, number: 0, totalElements: 1, totalPages: 1 },
        });

        await router.replace('/checkout/success');
        await router.isReady();
        wrapper = mount(
            { template: '<RouterView />' },
            { global: { plugins: [pinia, router] } }
        );
        await flushPromises();

        expect(wrapper.text()).toContain('ORD-22');
        await wrapper.get('.order-success-page_primary').trigger('click');
        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/mi-cuenta');
        expect(getMyOrders).toHaveBeenCalledExactlyOnceWith(0);
        expect(wrapper.get('.order-history-card__details strong').text())
            .toBe('#ORD-22');
        expect(wrapper.get('.order-history-card__link').attributes('href'))
            .toBe('/mi-cuenta/pedidos/22');
    });
});