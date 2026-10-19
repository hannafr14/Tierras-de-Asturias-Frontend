import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logoutUser } from '@/services/authApi';
import { getCsrfHeaders } from '@/services/csrfApi';

vi.mock('@/services/csrfApi', () => ({
    getCsrfHeaders: vi.fn(),
}));

describe('logoutUser', () => {
    let fetchMock;

    beforeEach(() => {
        getCsrfHeaders.mockReset();
        getCsrfHeaders.mockResolvedValue({ 'X-CSRF-TOKEN': 'fresh-token' });
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sends POST with cookies and CSRF without reading JSON for 204', async () => {
        const json = vi.fn();
        fetchMock.mockResolvedValue({ ok: true, status: 204, json });

        await expect(logoutUser()).resolves.toBeUndefined();

        expect(getCsrfHeaders).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'X-CSRF-TOKEN': 'fresh-token' },
        });
        expect(json).not.toHaveBeenCalled();
    });

    it.each([401, 403, 500])('rejects HTTP %s errors', async (status) => {
        fetchMock.mockResolvedValue({ ok: false, status });

        await expect(logoutUser()).rejects.toThrow(
            'No se pudo cerrar sesión. Inténtalo de nuevo.'
        );
    });

    it('does not submit logout when fetching CSRF fails', async () => {
        getCsrfHeaders.mockRejectedValue(new Error('CSRF unavailable'));

        await expect(logoutUser()).rejects.toThrow('CSRF unavailable');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('propagates network errors', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(logoutUser()).rejects.toThrow('Failed to fetch');
    });
});