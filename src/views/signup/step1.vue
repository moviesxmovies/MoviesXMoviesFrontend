<script lang="ts" setup>
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import { loginWithGoogle } from "@/composables/useOAUTH";
import { FieldMsg } from "@/repositories/auth/authRepository";
import { step1Schema } from "@/schemas/signUpSchema";
import type { RegisterPayload } from "@/types";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import {
  Button,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  Password,
} from "primevue";

const props = defineProps<{
  modelValue: RegisterPayload;
}>();

const resolver = zodResolver(step1Schema);

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "next"): void;
  (e: "back"): void;
}>();

const onFormSubmit = ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (valid) {
    emit("update:modelValue", values);
    emit("next");
  }
};
</script>

<template>
  <Form
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-4 w-full sm:w-80"
  >
    <FormField
      v-slot="$field"
      name="username"
      initialValue=""
      class="flex flex-col gap-1"
    >
      <FloatLabel variant="over">
        <IconField>
          <InputText
            v-bind="$field"
            id="username"
            type="text"
            fluid
            :class="{
              'p-invalid': $field.invalid,
              'p-valid': $field.dirty && !$field.invalid,
            }"
          />
          <InputIcon
            v-if="$field.dirty"
            :class="
              $field.invalid
                ? 'pi pi-times-circle text-red-500'
                : 'pi pi-check-circle text-green-500'
            "
          />
        </IconField>
        <label for="username">{{ $t("signup.username") }}</label>
      </FloatLabel>
      <FieldMsg :field="$field" />
    </FormField>

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
              'p-invalid': $field.invalid,
              'p-valid': $field.dirty && !$field.invalid,
            }"
          />
          <InputIcon
            v-if="$field.dirty"
            :class="
              $field.invalid
                ? 'pi pi-times-circle text-red-500'
                : 'pi pi-check-circle text-green-500'
            "
          />
        </IconField>
        <label for="email">{{ $t("signup.email") }}</label>
      </FloatLabel>
      <FieldMsg :field="$field" />
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
            'p-invalid': $field.invalid,
            'p-valid': $field.dirty && !$field.invalid,
          }"
        />
        <label for="password">{{ $t("signup.password") }}</label>
      </FloatLabel>

      <div v-if="$field.dirty" class="flex flex-col gap-1 mt-1">
        <template v-if="$field.invalid">
          <div
            v-for="(error, i) of $field.errors"
            :key="i"
            class="field-msg error"
          >
            <i class="pi pi-times-circle msg-icon" />
            {{ error.message }}
          </div>
        </template>
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
            'p-invalid': $field.invalid,
            'p-valid': $field.dirty && !$field.invalid,
          }"
        />
        <label for="confirm_password">{{ $t("signup.confirmPassword") }}</label>
      </FloatLabel>
      <FieldMsg :field="$field" />
    </FormField>

    <Button type="submit" label="Next" fluid />
  </Form>
  <OauthButtonComponent @click="loginWithGoogle" class="mt-2" />
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
