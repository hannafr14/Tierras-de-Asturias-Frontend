import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser } from '@/services/authApi';

vi.mock('@/services/authApi', () => ({
    getCurrentUser: vi.fn(),
}));

describe('authStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        getCurrentUser.mockReset();
    });

    it('restores the profile from an active session', async () => {
        const profile = {
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        };

        getCurrentUser.mockResolvedValue(profile);

        const authStore = useAuthStore();

        expect(authStore.user).toBeNull();
        expect(authStore.isAuthenticated).toBe(false);

        await authStore.restoreSession();

        expect(getCurrentUser).toHaveBeenCalledTimes(1);
        expect(authStore.user).toEqual(profile);
        expect(authStore.isAuthenticated).toBe(true);
    });

    it('clears the profile when the session is no longer active', async () => {
        const authStore = useAuthStore();

        authStore.setUser({
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        });

        expect(authStore.isAuthenticated).toBe(true);

        getCurrentUser.mockResolvedValue(null);

        await authStore.restoreSession();

        expect(getCurrentUser).toHaveBeenCalledTimes(1);
        expect(authStore.user).toBeNull();
        expect(authStore.isAuthenticated).toBe(false);
    });

    it('preserves the profile when the session check fails', async () => {
        const profile = {
            id: 1,
            firstName: 'Ana',
            lastName: 'Garcia',
            email: 'ana@example.com',
        };

        const authStore = useAuthStore();
        authStore.setUser(profile);

        getCurrentUser.mockRejectedValue(
            new TypeError('Failed to fetch')
        );

        await expect(authStore.restoreSession())
            .rejects.toThrow('Failed to fetch');

        expect(authStore.user).toEqual(profile);
        expect(authStore.isAuthenticated).toBe(true);
    });

    it.each([
        { id: 1, firstName: 'Ana', email: 'ana@example.com' },
        null,
    ])('clears the error after a successful retry returning %j', async (profile) => {
        const authStore = useAuthStore();

        getCurrentUser
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(profile);

        await expect(authStore.restoreSession())
            .rejects.toThrow('Network error');

        expect(authStore.sessionError)
            .toBe('No se pudo comprobar tu sesión. Inténtalo de nuevo.');
        expect(authStore.isRestoringSession).toBe(false);

        await authStore.restoreSession();

        expect(getCurrentUser).toHaveBeenCalledTimes(2);
        expect(authStore.sessionError).toBe('');
        expect(authStore.user).toEqual(profile);
        expect(authStore.isAuthenticated).toBe(profile !== null);
        expect(authStore.isRestoringSession).toBe(false);
    });

    it('tracks loading while the session request is pending', async () => {
        let resolveRequest;
        getCurrentUser.mockReturnValueOnce(new Promise((resolve) => {
            resolveRequest = resolve;
        }));

        const authStore = useAuthStore();
        expect(authStore.isRestoringSession).toBe(false);

        const request = authStore.restoreSession();
        expect(authStore.isRestoringSession).toBe(true);

        resolveRequest(null);
        await request;

        expect(authStore.isRestoringSession).toBe(false);
        expect(authStore.sessionError).toBe('');
    });
});