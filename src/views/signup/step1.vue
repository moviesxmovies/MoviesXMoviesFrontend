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
import { useRoute } from "vue-router";

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
const route = useRoute();

</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6">
    <div class="text-center">
      <img src="/favicon.svg" alt="Logo" class="w-16 h-16 m-auto" />
      <h2 class="text-xl font-semibold" style="color: var(--text)">
        {{ $t("signup.title") }}
      </h2>
      <p class="text-xs sm:text-sm mt-1" style="color: var(--text); opacity: 0.5">
        {{ $t("signup.step1.subtitle") }}
      </p>
    </div>

    <Form
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
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
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }"
              :aria-label="$t('signup.username')"
            />
            <InputIcon
              v-if="$field?.dirty"
              :class="
                $field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
              "
              :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }"
            />
          </IconField>
          <label for="username">{{ $t("signup.username") }}</label>
        </FloatLabel>
        <FieldMsg :field="$field" />
      </FormField>

      <FormField
        v-slot="$field"
        name="email"
        :initialValue="route.query.email ? String(route.query.email) : ''"
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
              :aria-label="$t('signup.email')"
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
            :aria-label="$t('signup.password')"
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
            :aria-label="$t('signup.confirmPassword')"
          />
          <label for="confirm_password">{{
            $t("signup.confirmPassword")
          }}</label>
        </FloatLabel>
        <FieldMsg :field="$field" />
      </FormField>

      <Button type="submit" :label="$t('next')" fluid class="mt-2" />
    </Form>

    <div class="relative flex items-center gap-3">
      <div class="flex-1 h-px" style="background-color: var(--secondary)" />
      <span class="text-xs" style="color: var(--text); opacity: 0.4">{{
        $t("signup.or")
      }}</span>
      <div class="flex-1 h-px" style="background-color: var(--secondary)" />
    </div>

    <OauthButtonComponent @click="loginWithGoogle" />
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
