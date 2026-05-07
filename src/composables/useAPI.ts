import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { config as appConfig } from "@/config";

const refreshInstance = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
});

const doRefresh = async (authStore: any) => {
  const { data } = await refreshInstance.post("/auth/refresh/", {
    refresh: authStore.refreshToken,
  });
  authStore.setTokens(data.access, data.refresh);
  return data.access;
};

function logout(authStore: any) {
  authStore.logout();
  globalThis.location.href = "/login";
}

api.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();

  // Add a delay for debuging skeletons
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!authStore.token) return config;

  if (authStore.isTokenExpired()) {
    try {
      const newToken = await doRefresh(authStore);
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch (error) {
      logout(authStore);
      return Promise.reject(error as Error);
    }
  } else {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }

  return config;
});
