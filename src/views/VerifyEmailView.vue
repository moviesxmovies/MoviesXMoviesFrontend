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
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
    style="background-color: var(--background)">
    <div class="w-full max-w-md my-4">
      <div class="rounded-2xl border shadow-sm overflow-hidden text-center"
        style="background-color: var(--background); border-color: var(--secondary)">

        <div class="p-6 sm:p-8">
          <div class="mb-8">
            <div
              class="w-full max-w-[100px] h-10 sm:w-16 sm:h-16 sm:aspect-square bg-primary/10 rounded-xl sm:rounded-full flex items-center justify-center m-auto mb-6 transition-all">
              <i class="pi pi-shield text-lg sm:text-2xl" style="color: var(--primary)"></i>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold" style="color: var(--text)">
              {{ $t('verify.title') }}
            </h2>
            <p class="text-xs sm:text-sm mt-2 px-2" style="color: var(--text); opacity: 0.6">
              {{ $t('verify.description') }}
            </p>
          </div>

          <VerifyCodeComponent v-model:loading="loading" @sendCode="sendVerificationCode"
            @handle-verification="handleVerification" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-6 {
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