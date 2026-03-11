import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { config } from '@/config'

const refreshInstance = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
});
export const api = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
});

api.interceptors.request.use(async (config) => {
    const authStore = useAuthStore();

    if (authStore.token && authStore.refreshToken) {
        if (authStore.isTokenExpired()) {
            try {
                const { data } = await refreshInstance.post('/auth/refresh/', {
                    refresh: authStore.refreshToken,
                });

                authStore.setTokens(data.access, data.refresh);
                config.headers.Authorization = `Bearer ${data.access}`;
            } catch (error) {
                authStore.logout();
                globalThis.location.href = '/login';
                return Promise.reject(error instanceof Error ? error : new Error(String(error)));
            }
        } else {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
    }
    return config;
});
