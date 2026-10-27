<script lang="ts" setup>
import { handleRegister } from "@/repositories/auth/authRepository";
import { useLangStore } from "@/stores/langStore";
import type { RegisterPayload } from "@/types";
import Step1 from "@/views/signup/step1.vue";
import Step2 from "@/views/signup/step2.vue";
import { ProgressBar } from "primevue";
import { reactive, ref, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const useLang = useLangStore();
const router = useRouter();

const STEP1_FIELDS = ["username", "email", "password", "confirm_password"];

const steps: Record<number, Component> = {
  1: Step1,
  2: Step2,
};
const currentStep = ref<number>(1);

const fieldErrors = reactive<Record<string, string[]>>({});

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
    form.append("picture", formData.image as Blob, (formData.image as File).name);
  }
  await signup(form);
};

const handleError = (error: any) => {
  const data = error.response?.data;

  if (data && typeof data === "object") {
    if (data.detail) {
      fieldErrors["__general__"] = [data.detail];
    } else {
      Object.assign(fieldErrors, data);

      if (data.error?.length) {
        fieldErrors["__general__"] = data.error;
      }

      const hasStep1Error = STEP1_FIELDS.some((f) => data[f]?.length);
      if (hasStep1Error || data.error?.length) currentStep.value = 1;
    }
  }
};

const signup = async (form: FormData) => {
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k]);

  try {
    await handleRegister(useLang.language, form as unknown as RegisterPayload);
    router.push("/home");
  } catch (error: any) {
    handleError(error);
  }
};


defineExpose({ currentStep, formData, next, handleForm });
</script>

<template>
  <div class="auth-page">
    <div class="auth-card signup-card">
      <ProgressBar :aria-label="$t('signup.progress')" :value="(currentStep * 100) / Object.keys(steps).length"
        :showValue="false" class="custom-progress" />
      <p class="signup-step">{{ currentStep }} / {{ Object.keys(steps).length }}</p>

      <keep-alive>
        <component :is="steps[currentStep]" v-model="formData" :field-errors="fieldErrors" @next="next"
          @back="currentStep--" />
      </keep-alive>
    </div>
  </div>
</template>
<style scoped>
.signup-card {
  position: relative;
  overflow: hidden;
  padding-top: 2.75rem !important;
}

.custom-progress {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  height: 5px !important;
  border-radius: 0 !important;
  background-color: var(--surface-2) !important;
  border: none !important;
}

:deep(.p-progressbar-value) {
  background: var(--brand-gradient) !important;
  transition: width 0.4s ease-in-out;
}

.signup-step {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-subtle);
}

:deep(.form-alert) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
}
</style>
