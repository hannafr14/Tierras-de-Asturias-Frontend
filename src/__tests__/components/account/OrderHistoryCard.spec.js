import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import OrderHistoryCard from '@/components/account/OrderHistoryCard.vue';

const order = {
    id: 18,
    orderNumber: 'ORD-18',
    status: 'PENDING',
    total: 3.3,
    orderDate: '2026-10-19T14:08:50',
    productCount: 3,
};

describe('OrderHistoryCard', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(OrderHistoryCard, {
            props: { order: { ...order } },
            global: {
                stubs: { RouterLink: RouterLinkStub },
            },
        });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('displays the order reference', () => {
        expect(wrapper.get('.order-history-card__details strong').text())
            .toBe('#ORD-18');
    });

    it('displays the date in Spanish with a datetime attribute', () => {
        const time = wrapper.get('time');
        expect(time.text()).toBe('19 de octubre de 2026');
        expect(time.attributes('datetime')).toBe(order.orderDate);
    });

    it('formats the total in euros', () => {
        const total = wrapper.get('.order-history-card__total strong');
        expect(total.text().replace(/\s/g, ' ')).toBe('3,30 \u20ac');
    });

    it('labels a pending order as received', () => {
        expect(wrapper.get('.order-history-card__status').text())
            .toBe('Pedido recibido');
    });

    it.each([
        [0, '0 productos'],
        [1, '1 producto'],
        [3, '3 productos'],
    ])('displays the correct label for %i items', async (count, label) => {
        await wrapper.setProps({
            order: { ...order, productCount: count },
        });
        expect(wrapper.get('.order-history-card__details p span').text())
            .toContain(label);
    });

    it('links to the details of this order', () => {
        expect(wrapper.getComponent(RouterLinkStub).props('to')).toEqual({
            name: 'order-details',
            params: { id: order.id },
        });
    });
});