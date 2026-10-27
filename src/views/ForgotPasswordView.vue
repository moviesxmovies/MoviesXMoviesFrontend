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
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon" aria-hidden="true"><i class="pi pi-key"></i></div>
        <h1 class="auth-title">{{ $t("forgotPassword.title") }}</h1>
        <p class="auth-subtitle">{{ $t("forgotPassword.description") }}</p>
      </div>

      <Form @submit="handleSubmit" :resolver="resolver" class="flex flex-col gap-5 w-full">
        <FormField v-slot="$field" name="email" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <IconField>
              <InputText v-bind="$field" id="email" type="email" fluid autocomplete="email"
                :class="{ 'p-invalid': $field?.invalid, 'p-valid': $field?.dirty && !$field?.invalid }" />
              <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-envelope'"
                :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--text-subtle)' }" />
            </IconField>
            <label for="email">{{ $t("signup.email") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <Button type="submit" :label="$t('forgotPassword.resetPassword')" fluid />
      </Form>

      <p class="auth-footer">
        <button @click="router.push('/login')" type="button" class="link-btn inline-flex items-center gap-2">
          <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
          {{ $t("forgotPassword.backToLogin") }}
        </button>
      </p>
    </div>
  </div>
</template>
