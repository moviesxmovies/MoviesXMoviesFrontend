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
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div
      class="relative w-full max-w-sm rounded-2xl border p-8 flex flex-col gap-6 bg-background/80 border-primary/40"
    >
      <div class="absolute -inset-4 -z-10 blur-3xl bg-accent/50" />

      <div class="text-center">
        <img src="/favicon.svg" alt="Logo" class="w-16 h-16 m-auto" />
        <h2 class="text-xl font-semibold mt-3" style="color: var(--text)">
          {{ $t("forgotPassword.title") }}
        </h2>
        <p class="text-sm mt-1" style="color: var(--text); opacity: 0.5">
          {{ $t("forgotPassword.description") }}
        </p>
      </div>

      <Form
        @submit="handleSubmit"
        :resolver="resolver"
        class="flex flex-col gap-4 w-full"
      >
        <FormField
          v-slot="$field"
          name="email"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                v-bind="$field"
                id="email"
                type="email"
                fluid
                :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }"
              />
              <InputIcon
                v-if="$field?.dirty"
                :class="
                  $field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
                "
                :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }"
              />
            </IconField>
            <label for="email">{{ $t("signup.email") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <Button
          type="submit"
          :label="$t('forgotPassword.resetPassword')"
          icon="pi pi-send"
          fluid
          class="mt-2"
        />
      </Form>

      <p class="text-center text-xs" style="color: var(--text); opacity: 0.5">
        {{ $t("forgotPassword.rememberPassword") }}
        <button
          type="button"
          class="transition-opacity hover:opacity-100"
          style="
            color: var(--primary);
            opacity: 0.8;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            text-decoration: underline;
            text-underline-offset: 3px;
          "
          @click="router.push('/login')"
        >
          {{ $t("forgotPassword.backToLogin") }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  animation: fadeIn 0.15s ease;
}
.field-msg.error {
  color: #ef4444;
}
.field-msg.success {
  color: #22c55e;
}

.msg-icon {
  font-size: 0.85rem;
  flex-shrink: 0;
}
</style>
