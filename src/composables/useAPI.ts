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
