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
  if (!valid) {
    return;
  }
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
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div
      class="relative w-full max-w-sm rounded-2xl border p-8 flex flex-col gap-6 bg-background/80 border-primary/40"
    >
      <div class="absolute -inset-4 -z-10 blur-3xl bg-accent/50" />

      <div class="text-center">
        <img src="/favicon.svg" alt="Logo" class="w-16 h-16 m-auto" />
        <h2 class="text-xl font-semibold mt-3" style="color: var(--text)">
          {{ $t("resetPassword.title") }}
        </h2>
        <p class="text-sm mt-1" style="color: var(--text); opacity: 0.5">
          {{ $t("resetPassword.description") }}
        </p>
      </div>

      <Form
        @submit="handleSubmit"
        :resolver="resolver"
        class="flex flex-col gap-4 w-full"
      >
        <FormField
          name="email"
          :initialValue="(route.query.email as string) ?? ''"
          v-slot="{}"
        />
        <FormField
          name="forgot_password_code"
          :initialValue="(route.query.code as string) ?? ''"
          v-slot="{}"
        />

        <FormField
          v-slot="$field"
          name="password"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <Password
              v-bind="$field"
              id="password"
              :feedback="false"
              toggleMask
              fluid
              :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }"
            />
            <label for="password">{{ $t("signup.password") }}</label>
          </FloatLabel>

          <div
            v-if="$field?.dirty && $field?.invalid"
            class="flex flex-col gap-1 mt-1"
          >
            <div
              v-for="(error, i) of $field?.errors"
              :key="i"
              class="flex items-center gap-1.5 text-xs"
              style="color: #ef4444"
            >
              <i class="pi pi-times-circle text-xs" />
              {{ error.message }}
            </div>
          </div>
        </FormField>

        <FormField
          v-slot="$field"
          name="confirm_password"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <Password
              v-bind="$field"
              id="confirm_password"
              :feedback="false"
              toggleMask
              fluid
              :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }"
            />
            <label for="confirm_password">{{
              $t("signup.confirmPassword")
            }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <Button
          type="submit"
          :label="$t('next')"
          icon="pi pi-check"
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
