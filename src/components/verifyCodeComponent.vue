<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import InputOtp from "primevue/inputotp";
import Button from "primevue/button";
import Message from "primevue/message";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const verificationCode = ref(route.query.code ? String(route.query.code) : "");
const error = ref("");
const loading = defineModel<boolean>("loading", { default: false });
let authTimer: ReturnType<typeof setTimeout>;
const emit = defineEmits<{
  (e: "sendCode"): void;
  (e: "handleVerification", code: string): void;
}>();

const handleSubmit = async () => {
  if (verificationCode.value.length !== 6) {
    error.value = t("verify.toast.incorrectLength");
    return;
  }
  loading.value = true;
  error.value = "";
  emit("handleVerification", verificationCode.value);
};

onMounted(() => {
  if (route.query.code) {
    loading.value = true;
    authTimer = setTimeout(() => {
      handleSubmit();
    }, 500);
    loading.value = false;
  }
});

onUnmounted(() => {
  clearTimeout(authTimer);
});
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
        @submit.prevent="handleSubmit"
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
          :disabled="loading"
          class="w-full py-3 sm:py-4 rounded-xl font-bold text-white transition-transform active:scale-95 overflow-hidden border-none text-sm sm:text-base"
          style="background: linear-gradient(135deg, #2f27ce 0%, #bb3dff 100%)"
        >
          <span class="tracking-wide">{{
            loading ? "VERIFYING..." : "VERIFY CODE"
          }}</span>
        </Button>
        <Button
          variant="link"
          label="Link"
          type="button"
          data-testid="resend-btn"
          @click="emit('sendCode')"
          class="mt-4 sm:mt-6 text-[#bcbbdd] text-xs hover:text-[#f2f2f2] transition-colors underline decoration-[#3a31d8]"
        >
          {{ $t("verify.resend") }}
        </Button>
      </form>
    </div>
  </div>
</template>
