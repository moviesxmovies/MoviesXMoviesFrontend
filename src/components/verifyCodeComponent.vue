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
  <form @submit.prevent="handleSubmit" class="flex flex-col items-center w-full">
    <InputOtp v-model="verificationCode" :length="6" integer-only class="gap-2 mb-8">
      <template #default="{ attrs, events }">
        <input v-bind="attrs" v-on="events" class="custom-otp-input" />
      </template>
    </InputOtp>

    <Message v-if="error" severity="error" variant="simple" class="mb-4 text-sm">{{ error }}</Message>

    <Button type="submit" :label="loading ? $t('verifying') : $t('verify.button')" :loading="loading" fluid
      class="py-3" />

    <div class="mt-8 flex flex-col gap-2">
      <p class="text-xs" style="color: var(--text); opacity: 0.5">
        {{ $t("verify.didntReceive") }}
      </p>
      <button type="button" @click="emit('sendCode')" class="text-sm font-bold hover:underline"
        style="color: var(--primary)">
        {{ $t("verify.resend") }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.custom-otp-input {
  width: 42px;
  height: 52px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  background-color: transparent;
  color: var(--text);
  border: 2px solid var(--secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
  outline: none;
}

.custom-otp-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: white !important;
}

.p-message {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>