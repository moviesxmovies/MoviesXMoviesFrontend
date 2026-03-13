<script lang="ts" setup>
import Card from "@/components/appCardComponent.vue";
import { api } from "@/composables/useAPI";
import { config } from "@/config";
import { useLangStore } from "@/stores/langStore";
import Step1 from "@/views/signup/step1.vue";
import Step2 from "@/views/signup/step2.vue";
import { reactive, ref, type Component } from "vue";

const useLang = useLangStore();

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

  await api.post(
    config.apiUrl + "/auth/signup/?lang=" + useLang.language,
    form,
  );
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <Card class="text-center p-8 max-w-xl">
      <keep-alive>
        <component
          :is="steps[currentStep]"
          v-model="formData"
          @update="formData = $event"
          @next="next"
          @back="currentStep--"
        />
      </keep-alive>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-invalid) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}
:deep(.p-valid) {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px #22c55e !important;
}

:deep(.p-card) {
  background-color: var(--background);
  color: var(--text);
  border: 1px solid var(--secondary);
}
</style>
