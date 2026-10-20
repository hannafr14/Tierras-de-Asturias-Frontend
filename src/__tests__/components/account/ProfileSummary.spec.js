import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfileSummary from '@/components/account/ProfileSummary.vue';
import userDefaultIcon from '@/assets/user-default.svg';

const user = {
    id: 1,
    firstName: 'Ana',
    lastName: 'Garcia',
    email: 'ana@example.com',
};

describe('ProfileSummary', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ProfileSummary, {
            props: { user: { ...user } },
        });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('displays the customer name and email', () => {
        expect(wrapper.get('h2').text()).toBe('Hola de nuevo, Ana');
        expect(wrapper.get('.profile-summary__details p').text())
            .toBe('ana@example.com');
    });

    it('uses the default avatar when no photo is provided', () => {
        const avatar = wrapper.get('.profile-summary__avatar');

        expect(avatar.attributes('src')).toBe(userDefaultIcon);
        expect(avatar.attributes('alt')).toBe('');
    });

    it('provides an accessible name for the profile section', () => {
        expect(wrapper.get('section').attributes('aria-label'))
            .toBe('Mi perfil');
    });

    it('updates the displayed data when the user prop changes', async () => {
        await wrapper.setProps({
            user: {
                id: 2,
                firstName: 'Maria',
                lastName: 'Lopez',
                email: 'maria@example.com',
            },
        });

        expect(wrapper.get('h2').text()).toBe('Hola de nuevo, Maria');
        expect(wrapper.get('.profile-summary__details p').text())
            .toBe('maria@example.com');
        expect(wrapper.text()).not.toContain('ana@example.com');
    });
});