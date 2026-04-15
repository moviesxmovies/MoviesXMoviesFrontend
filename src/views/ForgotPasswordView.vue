<script setup lang="ts">
import { FieldMsg, forgotPassword } from "@/repositories/auth/authRepository";
import { router } from "@/router";
import { forgotPasswordSchema } from "@/schemas/resetPasswordSchema";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import {
  Button,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  useToast,
} from "primevue";
import { useI18n } from "vue-i18n";
import { id } from "zod/locales";

const resolver = zodResolver(forgotPasswordSchema);
const toast = useToast();
const { t } = useI18n();

const handleSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;
  try {
    const status = await forgotPassword(values.email);
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: status,
      life: 3000,
    });
    router.push("/check-email");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("forgotPassword.toast.error"),
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
    style="background-color: var(--background)">
    <div class="w-full max-w-md my-4">
      <div class="rounded-2xl border shadow-sm overflow-hidden"
        style="background-color: var(--background); border-color: var(--secondary)">

        <div class="p-6 sm:p-8">
          <div class="text-center mb-8">
            <div
              class="w-full h-10 sm:h-16 sm:aspect-square bg-primary/10 rounded-xl sm:rounded-full flex items-center justify-center m-auto mb-4 transition-all">
              <i class="pi pi-key text-lg sm:text-2xl" style="color: var(--primary)"></i>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold" style="color: var(--text)">
              {{ $t("forgotPassword.title") }}
            </h2>
            <p class="text-xs sm:text-sm mt-2 px-2" style="color: var(--text); opacity: 0.6">
              {{ $t("forgotPassword.description") }}
            </p>
          </div>

          <Form @submit="handleSubmit" :resolver="resolver" class="flex flex-col gap-6 w-full">
            <FormField v-slot="$field" name="email" initialValue="" class="flex flex-col gap-1">
              <FloatLabel variant="over">
                <IconField>
                  <InputText v-bind="$field" id="email" type="email" fluid
                    :class="{ 'p-invalid': $field?.invalid, 'p-valid': $field?.dirty && !$field?.invalid }" />
                  <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-envelope'"
                    :style="{ color: $field?.invalid ? '#ef4444' : 'var(--primary)', opacity: $field?.invalid ? '1' : '0.5' }" />
                </IconField>
                <label for="email">{{ $t("signup.email") }}</label>
              </FloatLabel>
              <FieldMsg :field="$field" />
            </FormField>

            <Button type="submit" :label="$t('forgotPassword.resetPassword')" fluid class="py-3.5" />
          </Form>

          <button @click="router.push('/login')" type="button"
            class="w-full text-center mt-8 text-sm font-bold flex items-center justify-center gap-2 hover:underline transition-all"
            style="color: var(--primary)">
            <i class="pi pi-arrow-left text-[10px]"></i>
            {{ $t("forgotPassword.backToLogin") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.6;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  padding: 0.85rem !important;
  font-weight: 700;
}

:deep(.p-invalid .p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  animation: fadeIn 0.15s ease;
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