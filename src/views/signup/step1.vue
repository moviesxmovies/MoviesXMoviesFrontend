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
  fieldErrors?: Record<string, string[]>;
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
    <div class="auth-header !mb-0">
      <div class="auth-logo"><img src="/favicon.svg" alt="" /></div>
      <h1 class="auth-title">{{ $t("signup.title") }}</h1>
      <p class="auth-subtitle">{{ $t("signup.step1.subtitle") }}</p>
    </div>

    <Form :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-4 w-full">
      <div v-if="fieldErrors?.__general__?.length" class="form-alert" role="alert">
        <div v-for="msg in fieldErrors.__general__" :key="msg" class="field-msg error">
          <i class="pi pi-exclamation-circle msg-icon" />
          {{ msg }}
        </div>
      </div>
      <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
        <FloatLabel variant="over">
          <IconField>
            <InputText v-bind="$field" id="username" type="text" fluid :class="{
              'p-invalid': $field?.invalid,
              'p-valid': $field?.dirty && !$field?.invalid,
            }" :aria-label="$t('signup.username')" />
            <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
              " :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--success)' }" />
          </IconField>
          <label for="username">{{ $t("signup.username") }}</label>
        </FloatLabel>
        <FieldMsg :field="$field" />
        <div v-for="msg in (fieldErrors?.username ?? [])" :key="msg" class="field-msg error">
          <i class="pi pi-times-circle msg-icon" />
          {{ msg }}
        </div>
      </FormField>

      <FormField v-slot="$field" name="email" :initialValue="route.query.email ? String(route.query.email) : ''"
        class="flex flex-col gap-1">
        <FloatLabel variant="over">
          <IconField>
            <InputText v-bind="$field" id="email" type="email" fluid :class="{
              'p-invalid': $field?.invalid,
              'p-valid': $field?.dirty && !$field?.invalid,
            }" :aria-label="$t('signup.email')" />
            <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
              " :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--success)' }" />
          </IconField>
          <label for="email">{{ $t("signup.email") }}</label>
        </FloatLabel>
        <FieldMsg :field="$field" />
        <div v-for="msg in (fieldErrors?.email ?? [])" :key="msg" class="field-msg error">
          <i class="pi pi-times-circle msg-icon" />
          {{ msg }}
        </div>
      </FormField>

      <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
        <FloatLabel variant="over">
          <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid :class="{
            'p-invalid': $field?.invalid,
            'p-valid': $field?.dirty && !$field?.invalid,
          }" :aria-label="$t('signup.password')" />
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
          <Password v-bind="$field" id="confirm_password" :feedback="false" toggleMask fluid :class="{
            'p-invalid': $field?.invalid,
            'p-valid': $field?.dirty && !$field?.invalid,
          }" :aria-label="$t('signup.confirmPassword')" />
          <label for="confirm_password">{{
            $t("signup.confirmPassword")
          }}</label>
        </FloatLabel>
        <FieldMsg :field="$field" />
        <div v-for="msg in (fieldErrors?.confirm_password ?? [])" :key="msg" class="field-msg error">
          <i class="pi pi-times-circle msg-icon" />
          {{ msg }}
        </div>
      </FormField>

      <Button type="submit" :label="$t('next')" fluid class="mt-2" />
    </Form>

    <div class="auth-divider !my-0"><span>{{ $t("signup.or") }}</span></div>

    <OauthButtonComponent @click="loginWithGoogle" />
  </div>
</template>
