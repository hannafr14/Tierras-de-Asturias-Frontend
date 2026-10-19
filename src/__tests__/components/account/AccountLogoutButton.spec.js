import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AccountLogoutButton from '@/components/account/AccountLogoutButton.vue';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/authApi';
import router from '@/router';

vi.mock('@/services/authApi', () => ({
    logoutUser: vi.fn(),
    getCurrentUser: vi.fn(),
    loginUser: vi.fn(),
    registerUser: vi.fn(),
}));
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, createWebHistory: actual.createMemoryHistory };
});

const profile = { id: 1, firstName: 'Ana', email: 'ana@example.com' };
let wrapper;

async function mountLogout() {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.setUser({ ...profile });
    await router.replace('/mi-cuenta');
    await router.isReady();
    wrapper = mount(AccountLogoutButton, {
        global: { plugins: [pinia, router] },
    });
    return authStore;
}

describe('AccountLogoutButton', () => {
    beforeEach(() => {
        logoutUser.mockReset();
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it('logs out and blocks access to the protected account', async () => {
        logoutUser.mockResolvedValue(undefined);
        const authStore = await mountLogout();
        await wrapper.get('button').trigger('click');
        await flushPromises();
        expect(logoutUser).toHaveBeenCalledTimes(1);
        expect(authStore.user).toBeNull();
        expect(authStore.isAuthenticated).toBe(false);
        expect(router.currentRoute.value.path).toBe('/login');
        await router.push('/mi-cuenta');
        expect(router.currentRoute.value.path).toBe('/login');
    });

    it('preserves authentication and shows an error when logout fails', async () => {
        logoutUser.mockRejectedValue(new Error('Network error'));
        const authStore = await mountLogout();
        await wrapper.get('button').trigger('click');
        await flushPromises();
        expect(wrapper.get('[role="alert"]').text())
            .toBe('No se pudo cerrar sesión. Inténtalo de nuevo.');
        expect(authStore.user).toEqual(profile);
        expect(authStore.isAuthenticated).toBe(true);
        expect(router.currentRoute.value.path).toBe('/mi-cuenta');
        expect(wrapper.get('button').element.disabled).toBe(false);
    });
});