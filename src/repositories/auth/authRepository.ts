import { api } from "@/composables/useAPI";
import { config } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import type { LoginPayload, RegisterPayload } from "@/types";

const authStore = useAuthStore();

export const handleLogin = async (values: LoginPayload) => {
  try {
    const { data } = await api.post(config.apiUrl + "/auth/login/", values);
    authStore.setTokens(data.access, data.refresh);
  } catch (error: any) {
    throw error;
  }
};

export const handleRegister = async (values: RegisterPayload) => {
  const { data } = await api.post(config.apiUrl + "/auth/signup/", values);
  return data;
};

export const oauthLogin = async (code: string) => {
  try {
    const { data } = await api.post(config.apiUrl + "/oauth/google/", {
      code: code,
    });
    authStore.setTokens(data.access, data.refresh);
  } catch (error: any) {
    throw error;
  }
};

