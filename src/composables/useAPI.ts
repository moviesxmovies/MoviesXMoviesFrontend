import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { config as appConfig } from '@/config';
const PUBLIC_ROUTES = ['/auth/login/', '/auth/signup/', '/auth/refresh/'];
const refreshInstance = axios.create({
    baseURL: appConfig.apiUrl,
    withCredentials: true,
});

const isPublicRoute = (url: string) =>
    PUBLIC_ROUTES.some(route => url.includes(route));

export const api = axios.create({
    baseURL: appConfig.apiUrl,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token);
    });
    failedQueue = [];
};

const doRefresh = async (authStore: any) => {
    const { data } = await refreshInstance.post('/auth/refresh/', {
        refresh: authStore.refreshToken,
    });
    authStore.setTokens(data.access, data.refresh);
    return data.access;
};

function logout(authStore: any) {
    authStore.logout();
    globalThis.location.href = '/login';
}

api.interceptors.request.use(async (config) => {
    const authStore = useAuthStore();

    if (!authStore.token) return config;

    if (authStore.isTokenExpired()) {
        try {
            const newToken = await doRefresh(authStore);
            config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
            logout(authStore);
            return Promise.reject(error);
        }
    } else {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const authStore = useAuthStore();
        const originalRequest = error.config as any;

        if (error.response?.status !== 401 || originalRequest._retry || isPublicRoute(originalRequest.url ?? '')) {
            return Promise.reject(error as Error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            }).catch(Promise.reject);
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await doRefresh(authStore);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError: any) {
            processQueue(refreshError, null);
            logout(authStore);
            return Promise.reject(refreshError as Error);
        } finally {
            isRefreshing = false;
        }
    }
);