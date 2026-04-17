import axios, { AxiosError } from 'axios';
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

const refreshToken = async (refreshToken: string, authStore: any, config: any) => {
    const { data } = await refreshInstance.post('/auth/refresh/', {
        refresh: authStore.refreshToken,
    });

    authStore.setTokens(data.access, data.refresh);
    config.headers.Authorization = `Bearer ${data.access}`;
}
function logout(authStore: any) {
    authStore.logout();
    globalThis.location.href = '/login';
}
const handleRefreshError = (error: AxiosError, authStore: any) => {
    if (error.response?.status === 401) {
        logout(authStore);
        return Promise.reject(error);

    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));

}

api.interceptors.request.use(async (config) => {
    const authStore = useAuthStore();

    if (authStore.token && authStore.refreshToken) {
        if (authStore.isTokenExpired()) {
            try {
                await refreshToken(authStore.refreshToken, authStore, config);
            } catch (error: any) {
                return handleRefreshError(error, authStore);
            }
        } else {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
    } else {
        logout(authStore);
    }

    return config;
});



