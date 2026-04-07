import { api } from "@/composables/useAPI";
import { useAuthStore } from "@/stores/authStore";
import type { LoginPayload, RegisterPayload } from "@/types";
import { defineComponent, h } from "vue";


export const handleLogin = async (values: LoginPayload) => {
  try {
    const authStore = useAuthStore();

    const { data } = await api.post("/auth/login/", values);
    authStore.setTokens(data.access, data.refresh);
  } catch (error: any) {
    throw error;
  }
};

export const handleRegister = async (values: RegisterPayload) => {
  const { data } = await api.post("/auth/signup/", values);
  return data;
};

export const oauthLogin = async (code: string) => {
  try {
    const authStore = useAuthStore();

    const { data } = await api.post("/oauth/google/", {
      code: code,
    });
    authStore.setTokens(data.access, data.refresh);
  } catch (error: any) {
    throw error;
  }
};

export const FieldMsg = defineComponent({
  props: { field: Object },
  setup(props) {
    return () => {
      const f = props.field as any;
      if (!f?.dirty) return null;

      if (f.invalid) {
        return h("div", { class: "field-msg error" }, [
          h("i", { class: "pi pi-times-circle msg-icon" }),
          f.error?.message,
        ]);
      }
    };
  },
});

export const refreshToken = async () => {
  try {
    const authStore = useAuthStore();

    const { data } = await api.post("/auth/refresh/", { 'refresh': authStore.refreshToken });
    authStore.setTokens(data.access);
  } catch (error: any) {
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  const lang = authStore.user?.preferred_language || "en";
  try {
    const { data } = await api.get("/auth/forgot-password/", {
      params: { email, lang, _t: Date.now() },
    });
    return data.status;
  } catch (error: any) {
    throw error;
  }
};

export const resetPassword = async (
  forgot_password_code: string,
  new_password: string,
  email: string,
) => {
  try {
    const { data } = await api.post("/auth/forgot-password/", {
      forgot_password_code,
      new_password,
      email,
    });
    return data.status;
  } catch (error: any) {
    throw error;
  }
};
