<script setup lang="ts">
import { ref } from "vue";
import InputOtp from "primevue/inputotp";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/composables/useAPI";
import { config } from "@/config";

const verificationCode = ref("");
const authStore = useAuthStore();
const loading = ref(false);
const error = ref("");
const toast = useToast();
const router = useRouter();

const sendVerificationCode = async () => {
  try {
    await api.post(config.apiUrl + "/auth/resend-verification-email/");
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Verification code sent to your email",
      life: 3000,
    });
  } catch (error: any) {
    toast.add({
      severity: "warn",
      summary: "Warn",
      detail: error.response?.data?.error || "Failed to send verification code",
      life: 3000,
    });
  }
};

const handleVerification = async () => {
  if (verificationCode.value.length !== 6) {
    error.value = "Please enter the full 6-digit code.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.post(config.apiUrl + "/auth/verify/", {
      verification_code: verificationCode.value,
    });
    if (data.status && authStore.user) {
      const refreshResponse = await api.post(config.apiUrl + "/auth/refresh/", {
        refresh: authStore.refreshToken,
      });
      authStore.setTokens(refreshResponse.data.access);
      authStore.user.verified = true;
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "User verified",
        life: 3000,
      });
      router.push("/home");
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error.response?.data?.message || "Failed to send verification code",
      life: 3000,
    });
  }
  loading.value = false;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div
      class="w-full max-w-md bg-[#1f1f1f] rounded-2xl p-6 sm:p-8 border border-[#232244] shadow-2xl"
    >
      <div class="text-center mb-6 sm:mb-8">
        <h1
          class="text-accent text-xl sm:text-2xl font-black tracking-widest mb-2"
        >
          {{ $t("verify.title") }}
        </h1>
        <div
          class="h-1 w-12 bg-gradient-to-r from-[#2f27ce] to-[#bb3dff] mx-auto rounded-full"
        ></div>
      </div>
      <div class="text-center mb-6 sm:mb-8">
        <p class="text-[#bcbbdd] text-sm sm:text-base">
          {{ $t("verify.description") }}
        </p>
      </div>
      <form
        @submit.prevent="handleVerification"
        class="flex flex-col items-center"
      >
        <InputOtp
          v-model="verificationCode"
          :length="6"
          integer-only
          class="gap-1 sm:gap-2 mb-6 sm:mb-8"
        >
          <template #default="{ attrs, events }">
            <input
              v-bind="attrs"
              v-on="events"
              class="w-9 h-14 sm:w-10 sm:h-16 text-lg sm:text-xl font-bold text-center bg-[#0d0d0d] text-[#bb3dff] border-2 border-[#3a31d8] rounded-xl focus:border-[#7e00c2] focus:ring-2 focus:ring-[#7e00c2]/30 transition-all outline-none"
            />
          </template>
        </InputOtp>
        <Message
          size="small"
          variant="simple"
          :life="2000"
          v-if="error"
          severity="error"
          class="mb-4 w-full text-center text-sm"
          >{{ error }}</Message
        >
        <Button
          type="submit"
          :loading="loading"
          class="w-full py-3 sm:py-4 rounded-xl font-bold text-white transition-transform active:scale-95 overflow-hidden border-none text-sm sm:text-base"
          style="background: linear-gradient(135deg, #2f27ce 0%, #bb3dff 100%)"
        >
          <span class="tracking-wide">VERIFY CODE</span>
        </Button>
        <Button
          variant="link"
          label="Link"
          @click="sendVerificationCode"
          class="mt-4 sm:mt-6 text-[#bcbbdd] text-xs hover:text-[#f2f2f2] transition-colors underline decoration-[#3a31d8]"
        >
          {{ $t("verify.resend") }}
        </Button>
      </form>
    </div>
  </div>
</template>
