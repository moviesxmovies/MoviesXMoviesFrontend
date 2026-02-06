import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../stores/authStore';

vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn()
}));
import { jwtDecode } from 'jwt-decode';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with null values if localStorage is empty', () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null);

        const store = useAuthStore();
        expect(store.token).toBeNull();
        expect(store.isAuthenticated).toBe(false);
    });

    it('should save tokens in the state and in localStorage', () => {
        const store = useAuthStore();
        const accessToken = 'fake-access';
        const refreshToken = 'fake-refresh';

        store.setTokens(accessToken, refreshToken);

        expect(store.token).toBe(accessToken);
        expect(localStorage.setItem).toHaveBeenCalledWith('access_token', accessToken);
        expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', refreshToken);
    });

    it('should return the decoded user via the getter', () => {
        const store = useAuthStore();
        const mockPayload = { user_id: 1, exp: 12345, username: 'testuser' };
        vi.mocked(jwtDecode).mockReturnValue(mockPayload);

        store.token = 'algun-token';

        expect(store.user).toEqual(mockPayload);
        expect(jwtDecode).toHaveBeenCalledWith('algun-token');
    });

    it('should return null if there is no token when accessing the user getter', () => {
        const store = useAuthStore();
        store.token = null;

        expect(store.user).toBeNull();
    });



    it('should detect if the token has expired', () => {
        const store = useAuthStore();
        const currentTime = Date.now() / 1000;

        vi.mocked(jwtDecode).mockReturnValue({ exp: currentTime - 100 });
        store.token = 'expired-token';
        expect(store.isTokenExpired()).toBe(true);

        vi.mocked(jwtDecode).mockReturnValue({ exp: currentTime + 1000 });
        expect(store.isTokenExpired()).toBe(false);
    });

    it('should return true if token doesnt exists', () => {
        const store = useAuthStore();
        store.token = null;
        expect(store.isTokenExpired()).toBe(true);
    });

    it('should return true if token error decoding', async () => {
        const store = useAuthStore();
        store.setTokens('expired-access', 'invalid-refresh');
        vi.mocked(jwtDecode).mockImplementation(() => {throw new Error('Invalid token'); }
        );
        expect(store.isTokenExpired()).toBe(true);
    });
    it('should clear all tokens and localStorage on logout', () => {
        const store = useAuthStore();
        store.setTokens('access', 'refresh');

        store.logout();

        expect(store.token).toBeNull();
        expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
});