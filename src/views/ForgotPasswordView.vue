<script setup lang="ts">
import { FieldMsg, forgotPassword } from "@/repositories/auth/authRepository";
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
  <Form @submit="handleSubmit" :resolver="resolver">
    <h2 class="text-2xl font-bold mb-4">{{ $t("forgotPassword.title") }}</h2>
    <p class="mb-6">{{ $t("forgotPassword.description") }}</p>
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
      fluid
      class="mt-2"
    />
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
