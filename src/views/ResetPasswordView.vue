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
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo"><img src="/favicon.svg" alt="" /></div>
        <h1 class="auth-title">{{ $t("resetPassword.title") }}</h1>
        <p class="auth-subtitle">{{ $t("resetPassword.description") }}</p>
      </div>

      <Form @submit="handleSubmit" :resolver="resolver" class="flex flex-col gap-5 w-full">
        <FormField name="email" :initialValue="(route.query.email as string) ?? ''" v-slot="{ }" />
        <FormField name="forgot_password_code" :initialValue="(route.query.code as string) ?? ''" v-slot="{ }" />

        <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid
              :inputProps="{ autocomplete: 'new-password' }" :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }" />
            <label for="password">{{ $t("signup.password") }}</label>
          </FloatLabel>

          <div v-if="$field?.dirty && $field?.invalid" class="flex flex-col gap-1 mt-1">
            <div v-for="(error, i) of $field?.errors" :key="i" class="field-msg error">
              <i class="pi pi-times-circle msg-icon" />
              {{ error.message }}
            </div>
          </div>
        </FormField>

        <FormField v-slot="$field" name="confirm_password" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <Password v-bind="$field" id="confirm_password" :feedback="false" toggleMask fluid
              :inputProps="{ autocomplete: 'new-password' }" :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }" />
            <label for="confirm_password">{{ $t("signup.confirmPassword") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <Button type="submit" :label="$t('next')" icon="pi pi-check" fluid class="mt-1" />
      </Form>

      <p class="auth-footer">
        {{ $t("forgotPassword.rememberPassword") }}
        <button type="button" class="link-btn" @click="router.push('/login')">
          {{ $t("forgotPassword.backToLogin") }}
        </button>
      </p>
    </div>
  </div>
</template>
