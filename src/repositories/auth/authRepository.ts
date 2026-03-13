import { api } from "@/composables/useAPI";
import { config } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import type { LoginPayload, RegisterPayload } from "@/types";
import { defineComponent, h } from "vue";

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
