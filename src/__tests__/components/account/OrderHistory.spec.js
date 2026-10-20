import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import OrderHistory from '@/components/account/OrderHistory.vue';
import { getMyOrders } from '@/services/ordersApi';

vi.mock('@/services/ordersApi', () => ({
    getMyOrders: vi.fn(),
}));

const order = {
    id: 18,
    orderNumber: 'ORD-18',
    status: 'PENDING',
    total: 3.3,
    orderDate: '2026-10-19T14:08:50',
    productCount: 3,
};

describe('OrderHistory', () => {
    let wrapper;

    beforeEach(() => {
        getMyOrders.mockReset();
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it('loads and displays the customer orders', async () => {
        getMyOrders.mockResolvedValue({
            content: [order],
            page: { size: 3, number: 0, totalElements: 1, totalPages: 1 },
        });

        wrapper = mount(OrderHistory);
        await flushPromises();

        expect(getMyOrders).toHaveBeenCalledExactlyOnceWith(0);
        expect(wrapper.findAll('.order-history-card')).toHaveLength(1);
        expect(wrapper.text()).toContain('#ORD-18');
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('displays an empty history message', async () => {
        getMyOrders.mockResolvedValue({
            content: [],
            page: { size: 3, number: 0, totalElements: 0, totalPages: 0 },
        });

        wrapper = mount(OrderHistory);
        await flushPromises();

        expect(wrapper.get('[role="status"]').text())
            .toBe('Todavía no tienes pedidos.');
        expect(wrapper.findAll('.order-history-card')).toHaveLength(0);
    });

        it('shows a loading message while the request is pending', async () => {
        let resolveRequest;
        getMyOrders.mockReturnValueOnce(new Promise((resolve) => {
            resolveRequest = resolve;
        }));

        wrapper = mount(OrderHistory);
        await wrapper.vm.$nextTick();

        expect(wrapper.get('[role="status"]').text())
            .toBe('Cargando pedidos...');
        expect(wrapper.findAll('.order-history-card')).toHaveLength(0);
        for (const button of wrapper.findAll('nav button')) {
            expect(button.element.disabled).toBe(true);
        }

        resolveRequest({
            content: [order],
            page: { size: 3, number: 0, totalElements: 1, totalPages: 1 },
        });
        await flushPromises();

        expect(wrapper.find('[role="status"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('#ORD-18');
    });

    it('shows an error when loading orders fails', async () => {
        getMyOrders.mockRejectedValueOnce(
            new Error('No se pudieron cargar los pedidos.')
        );

        wrapper = mount(OrderHistory);
        await flushPromises();

        expect(wrapper.get('[role="alert"]').text())
            .toBe('No se pudieron cargar los pedidos.');
        expect(wrapper.get('.order-history__empty button').text())
            .toBe('Reintentar');
        expect(wrapper.find('nav').exists()).toBe(false);
    });

    it('loads orders after retrying a failed request', async () => {
        getMyOrders
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
                content: [order],
                page: { size: 3, number: 0, totalElements: 1, totalPages: 1 },
            });

        wrapper = mount(OrderHistory);
        await flushPromises();
        await wrapper.get('.order-history__empty button').trigger('click');
        await flushPromises();

        expect(getMyOrders).toHaveBeenCalledTimes(2);
        expect(getMyOrders).toHaveBeenNthCalledWith(2, 0);
        expect(wrapper.find('[role="alert"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('#ORD-18');
    });

        it('navigates between pages and disables boundary buttons', async () => {
        const firstPage = {
            content: [order],
            page: { size: 3, number: 0, totalElements: 4, totalPages: 2 },
        };
        const secondPage = {
            content: [{ ...order, id: 19, orderNumber: 'ORD-19' }],
            page: { size: 3, number: 1, totalElements: 4, totalPages: 2 },
        };
        getMyOrders
            .mockResolvedValueOnce(firstPage)
            .mockResolvedValueOnce(secondPage)
            .mockResolvedValueOnce(firstPage);

        const previous = '[aria-label="Página anterior"]';
        const next = '[aria-label="Página siguiente"]';

        wrapper = mount(OrderHistory);
        await flushPromises();

        expect(wrapper.get(previous).element.disabled).toBe(true);
        expect(wrapper.get(next).element.disabled).toBe(false);
        expect(wrapper.get('[aria-current="page"]').text()).toBe('1');

        await wrapper.get(next).trigger('click');
        await flushPromises();

        expect(getMyOrders).toHaveBeenNthCalledWith(2, 1);
        expect(wrapper.text()).toContain('#ORD-19');
        expect(wrapper.text()).not.toContain('#ORD-18');
        expect(wrapper.get('[aria-current="page"]').text()).toBe('2');
        expect(wrapper.get(previous).element.disabled).toBe(false);
        expect(wrapper.get(next).element.disabled).toBe(true);

        await wrapper.get(previous).trigger('click');
        await flushPromises();

        expect(getMyOrders).toHaveBeenNthCalledWith(3, 0);
        expect(getMyOrders).toHaveBeenCalledTimes(3);
        expect(wrapper.text()).toContain('#ORD-18');
        expect(wrapper.text()).not.toContain('#ORD-19');
        expect(wrapper.get('[aria-current="page"]').text()).toBe('1');
        expect(wrapper.get(previous).element.disabled).toBe(true);
    });
});