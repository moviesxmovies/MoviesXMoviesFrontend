<script lang="ts" setup>
import { handleRegister } from "@/repositories/auth/authRepository";
import { useLangStore } from "@/stores/langStore";
import type { RegisterPayload } from "@/types";
import Step1 from "@/views/signup/step1.vue";
import Step2 from "@/views/signup/step2.vue";
import { ProgressBar, useToast } from "primevue";
import { reactive, ref, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const useLang = useLangStore();
const router = useRouter();
const toast = useToast();

const steps: Record<number, Component> = {
  1: Step1,
  2: Step2,
};
const currentStep = ref<number>(1);
const formData = reactive({
  username: "",
  email: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  image: null as File | null,
});

const next = () => {
  return currentStep.value < Object.keys(steps).length
    ? currentStep.value++
    : handleForm();
};

const handleForm = async () => {
  const form = new FormData();
  form.append("username", formData.username);
  form.append("email", formData.email);
  form.append("password", formData.password);
  form.append("confirm_password", formData.confirm_password);
  form.append("first_name", formData.first_name);
  form.append("last_name", formData.last_name);
  if (formData.image) {
    form.append(
      "picture",
      formData.image as Blob,
      (formData.image as File).name,
    );
  }

  await signup(form);
};

const signup = async (form: FormData) => {
  try {
    await handleRegister(useLang.language , form as unknown as RegisterPayload);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("signup.toast.success"),
      life: 5000,
    });
    router.push("/home");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.detail || t("signup.toast.failed"),
      life: 5000,
    });
  }
};

defineExpose({ currentStep, formData, next, handleForm });
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
    style="background-color: var(--background)">
    <div class="w-full max-w-md my-4">
      <div class="rounded-2xl border shadow-sm overflow-hidden"
        style="background-color: var(--background); border-color: var(--secondary)">

        <ProgressBar :aria-label="$t('signup.progress')" :value="currentStep * 100 / Object.keys(steps).length" class="custom-progress">
          {{ }}
        </ProgressBar>

        <div class="p-6 sm:p-8">
          <keep-alive>
            <component :is="steps[currentStep]" v-model="formData" @next="next" @back="currentStep--" />
          </keep-alive>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-progress {
  height: 4px !important;
  border-radius: 0 !important;
  background-color: rgba(var(--secondary-rgb), 0.1) !important;
  border: none !important;
}

:deep(.p-progressbar-value) {
  background-color: var(--primary) !important;
  transition: width 0.4s ease-in-out;
}

:deep(.p-inputtext) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important;
  padding: 0.75rem !important;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-password-input) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
}

:deep(.p-password-input:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.6;
}

:deep(.p-invalid .p-inputtext),
:deep(.p-invalid.p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

:deep(.p-valid .p-inputtext),
:deep(.p-valid.p-inputtext) {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px #22c55e !important;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  padding: 0.85rem !important;
  font-weight: 600;
}

:deep(.p-button:hover) {
  opacity: 0.9;
}
</style>