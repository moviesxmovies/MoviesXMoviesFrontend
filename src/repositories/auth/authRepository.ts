import { api } from "@/composables/useAPI";
import { useAuthStore } from "@/stores/authStore";
import type { LoginPayload, RegisterPayload } from "@/types";
import { defineComponent, h } from "vue";

const authStore = useAuthStore();

export const handleLogin = async (values: LoginPayload) => {
  try {
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

export const refreshToken = async (refresh_token: string) => {
  try {
    const { data } = await api.post("/auth/refresh/", { refresh_token });
    authStore.setTokens(data.access, refresh_token);
  } catch (error: any) {
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  const lang = authStore.user?.preferred_language || "en";
  try {
    const { data } = await api.get("/auth/forgot-password/", { params: { email, lang } });
    return data.status;
  } catch (error: any) {
    throw error;
  }
};
