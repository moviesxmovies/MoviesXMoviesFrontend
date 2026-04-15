<script setup lang="ts">
import { FieldMsg, resetPassword } from "@/repositories/auth/authRepository";
import { resetPasswordSchema } from "@/schemas/resetPasswordSchema";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { Button, FloatLabel, Password, useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const resolver = zodResolver(resetPasswordSchema);
const toast = useToast();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const handleSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;

  try {
    const status = await resetPassword(
      values.forgot_password_code,
      values.password,
      values.email,
    );
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: status,
      life: 3000,
    });
    router.push("/login");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("resetPassword.toast.error"),
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6" style="background-color: var(--background)">
    <div class="w-full max-w-md my-4">
      <div class="rounded-2xl border shadow-sm overflow-hidden"
        style="background-color: var(--background); border-color: var(--secondary)">

        <div class="p-6 sm:p-8">
          <div class="text-center mb-8">
            <img src="/favicon.svg" alt="Logo" class="w-16 h-16 m-auto mb-4" />
            <h2 class="text-xl sm:text-2xl font-bold" style="color: var(--text)">
              {{ $t("resetPassword.title") }}
            </h2>
            <p class="text-xs sm:text-sm mt-2 px-2" style="color: var(--text); opacity: 0.6">
              {{ $t("resetPassword.description") }}
            </p>
          </div>

          <Form @submit="handleSubmit" :resolver="resolver" class="flex flex-col gap-5 w-full">
            <FormField name="email" :initialValue="(route.query.email as string) ?? ''" v-slot="{ }" />
            <FormField name="forgot_password_code" :initialValue="(route.query.code as string) ?? ''" v-slot="{ }" />

            <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
              <FloatLabel variant="over">
                <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }" />
                <label for="password">{{ $t("signup.password") }}</label>
              </FloatLabel>

              <div v-if="$field?.dirty && $field?.invalid" class="flex flex-col gap-1 mt-1">
                <div v-for="(error, i) of $field?.errors" :key="i" class="flex items-center gap-1.5 text-xs"
                  style="color: #ef4444">
                  <i class="pi pi-times-circle" />
                  {{ error.message }}
                </div>
              </div>
            </FormField>

            <FormField v-slot="$field" name="confirm_password" initialValue="" class="flex flex-col gap-1">
              <FloatLabel variant="over">
                <Password v-bind="$field" id="confirm_password" :feedback="false" toggleMask fluid :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }" />
                <label for="confirm_password">{{ $t("signup.confirmPassword") }}</label>
              </FloatLabel>
              <FieldMsg :field="$field" />
            </FormField>

            <Button type="submit" :label="$t('next')" icon="pi pi-check" fluid class="py-3.5 mt-2" />
          </Form>

          <p class="text-center text-sm mt-8" style="color: var(--text); opacity: 0.7">
            {{ $t("forgotPassword.rememberPassword") }}
            <button type="button" class="font-bold hover:underline" style="color: var(--primary)"
              @click="router.push('/login')">
              {{ $t("forgotPassword.backToLogin") }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password-input) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important; 
  padding: 0.75rem !important;
}

:deep(.p-password-input:focus) {
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
  padding: 0.85rem !important;
  font-weight: 700;
}

.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>