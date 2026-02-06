import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

const refreshInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});


api.interceptors.request.use(async (config) => {
    const authStore = useAuthStore();

    if (authStore.token && authStore.refreshToken) {
        if (authStore.isTokenExpired()) {
            try {
                const { data } = await refreshInstance.post('/api/auth/refresh/', {
                    refresh: authStore.refreshToken,
                });

                authStore.setTokens(data.access, data.refresh);
                config.headers.Authorization = `Bearer ${data.access}`;
            } catch (error) {
                authStore.logout();
                window.location.href = '/auth/login';
                return Promise.reject(error instanceof Error ? error : new Error(String(error)));
            }
        } else {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
    }
    return config;
});
