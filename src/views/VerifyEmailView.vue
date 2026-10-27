<script setup lang="ts">
import VerifyCodeComponent from "@/components/verifyCodeComponent.vue";
import { api } from "@/composables/useAPI";
import { refreshToken } from "@/repositories/auth/authRepository";
import { useToast } from "primevue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const router = useRouter();

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
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.error || t("verify.toast.resendError"),
      life: 3000,
    });
  }
};

const handleVerification = async (code: string) => {
  loading.value = true;
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
      await refreshToken();
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
  <div class="auth-page">
    <div class="auth-card text-center verify-card">
      <div class="auth-header">
        <div class="auth-icon" aria-hidden="true"><i class="pi pi-shield"></i></div>
        <h1 class="auth-title">{{ $t('verify.title') }}</h1>
        <p class="auth-subtitle">{{ $t('verify.description') }}</p>
      </div>

      <VerifyCodeComponent v-model:loading="loading" @sendCode="sendVerificationCode"
        @handle-verification="handleVerification" />
    </div>
  </div>
</template>

<style scoped>
.verify-card {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
