<script setup lang="ts">
import VerifyCodeComponent from "@/components/verifyCodeComponent.vue";
import { api } from "@/composables/useAPI";
import { refreshToken } from "@/repositories/auth/authRepository";
import { router } from "@/router";
import { useToast } from "primevue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();
const loading = ref(false);

const sendVerificationCode = async () => {
  try {
    await api.post("/auth/resend-verification-email/");
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: t("verify.toast.resendSuccess"),
      life: 3000,
    });
  } catch (error: any) {
    toast.add({
      severity: "warn",
      summary: t("toast.warn"),
      detail: error.response?.data?.error || t("verify.toast.resendError"),
      life: 3000,
    });
  }
};

const handleVerification = async (code: string) => {
  try {
    const { data } = await api.post("/auth/verify/", {
      verification_code: code,
    });
    if (data.status) {
      toast.add({
        severity: "success",
        summary: t("toast.success"),
        detail: t("verify.toast.success"),
        life: 3000,
      });
      await refreshToken(data.refresh_token);
      router.push("/home");
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("verify.toast.invalidCode"),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <VerifyCodeComponent
    v-model:loading="loading"
    @sendCode="sendVerificationCode"
    @handle-verification="handleVerification"
  />
</template>
