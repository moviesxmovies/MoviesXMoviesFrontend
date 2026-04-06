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
  <Form
    @submit="handleSubmit"
    :resolver="resolver"
    class="flex flex-col gap-4 w-full"
  >
    <h2 class="text-2xl font-bold mb-4">{{ $t("resetPassword.title") }}</h2>
    <p class="mb-6">{{ $t("resetPassword.description") }}</p>
    <FormField
      name="email"
      :initialValue="(route.query.email as string) ?? ''"
      v-slot="{}"
    >
    </FormField>
    <FormField
      name="forgot_password_code"
      :initialValue="(route.query.code as string) ?? ''"
      v-slot="{}"
    >
    </FormField>
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
        <label for="confirm_password">{{ $t("signup.confirmPassword") }}</label>
      </FloatLabel>
      <FieldMsg :field="$field" />
    </FormField>

    <Button type="submit" :label="$t('signup.next')" fluid class="mt-2" />
  </Form>
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
