import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
vi.stubGlobal('localStorage', localStorageMock);

vi.mock('axios', () => {
    const mockInstance = {
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        },
        post: vi.fn(),
        get: vi.fn(),
        defaults: { headers: { common: {} } }
    };
    return {
        default: {
            create: vi.fn(() => mockInstance),
            post: mockInstance.post,
            get: mockInstance.get,
        }
    };
});

const locationMock = { href: '' };
vi.stubGlobal('location', locationMock);

describe('API Interceptor', () => {
    let authStore: any;
    let mockInstance: any;

    beforeEach(async () => {
        vi.resetModules();
        setActivePinia(createPinia());
        vi.clearAllMocks();
        locationMock.href = '';
        localStorage.clear();

        await import('../../composables/useAPI');
        const authModule = await import('../../stores/authStore');

        authStore = authModule.useAuthStore();
        mockInstance = vi.mocked(axios.create).mock.results[0].value;
    });

    it('should add the Bearer token if the token has not expired', async () => {
        authStore.token = 'valid-token';
        authStore.refreshToken = 'refresh-token';

        vi.spyOn(authStore, 'isTokenExpired').mockReturnValue(false);

        const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];

        const config = {
            headers: {
                Authorization: ''
            }
        } as any;

        const result = await interceptor(config);

        expect(result).toBeDefined();
        expect(result.headers.Authorization).toBe('Bearer valid-token');
    });

    it('should refresh the token if it has expired and continue the request', async () => {
        authStore.token = 'expired-token';
        authStore.refreshToken = 'valid-refresh';
        vi.spyOn(authStore, 'isTokenExpired').mockReturnValue(true);
        const setTokensSpy = vi.spyOn(authStore, 'setTokens');

        mockInstance.post.mockResolvedValueOnce({
            data: { access: 'new-access', refresh: 'new-refresh' }
        });

        const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
        const config = { headers: {} } as any;

        const result = await interceptor(config);

        expect(setTokensSpy).toHaveBeenCalledWith('new-access', 'new-refresh');
        expect(result.headers.Authorization).toBe('Bearer new-access');
    });

    it('should logout and redirect if the refresh fails', async () => {
        authStore.token = 'expired-token';
        authStore.refreshToken = 'bad-refresh';
        vi.spyOn(authStore, 'isTokenExpired').mockReturnValue(true);
        const logoutSpy = vi.spyOn(authStore, 'logout');

        mockInstance.post.mockRejectedValueOnce(new Error('Refresh failed'));

        const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];

        await expect(interceptor({ headers: {} })).rejects.toThrow('Refresh failed');

        expect(logoutSpy).toHaveBeenCalled();
        expect(locationMock.href).toBe('/auth/login');
    });

    it('should return the config if there is no token', async () => {
        authStore.token = null;

        const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
        const config = { headers: {} } as any;

        const result = await interceptor(config);

        expect(result).toBe(config);
    });

    it('axios throws an error that is not an instance of Error', async () => {
        authStore.token = 'expired-token';
        authStore.refreshToken = 'bad-refresh';
        vi.spyOn(authStore, 'isTokenExpired').mockReturnValue(true);
        const logoutSpy = vi.spyOn(authStore, 'logout');

        mockInstance.post.mockRejectedValueOnce('Some error string');

        const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];

        await expect(interceptor({ headers: {} })).rejects.toThrow('Some error string');

        expect(logoutSpy).toHaveBeenCalled();
        expect(locationMock.href).toBe('/auth/login');
    });
});