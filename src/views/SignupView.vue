<script lang="ts" setup>
import { api } from "@/composables/useAPI";
import { useLangStore } from "@/stores/langStore";
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
    await api.post("/auth/signup/?lang=" + useLang.language, form);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("signup.toast.success"),
      life: 3000,
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
  <div class="min-h-screen flex flex-col items-center justify-center px-4"
       style="background-color: var(--background)">

    <div class="w-full max-w-md">
      <div class="mb-4">
        <ProgressBar :value="currentStep*100/Object.keys(steps).length">{{  }}</ProgressBar>
      </div>
      <div class="rounded-2xl border p-8 shadow-sm"
           style="background-color: var(--background); border-color: var(--secondary)">
        <keep-alive>
          <component
            :is="steps[currentStep]"
            v-model="formData"
            @next="next"
            @back="currentStep--"
          />
        </keep-alive>
      </div>

    </div>
  </div>
</template>

<style scoped>
:deep(.p-inputtext) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
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
}
:deep(.p-button:hover) {
  opacity: 0.9;
}
</style>
