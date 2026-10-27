<script setup lang="ts">
import { ref } from "vue";
import {
  Button,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  Password,
  useToast,
} from "primevue";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import { FieldMsg, handleLogin } from "@/repositories/auth/authRepository";
import type { LoginPayload } from "@/types";
import { useI18n } from "vue-i18n";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { loginSchema } from "@/schemas/loginSchema";
import { useRouter } from "vue-router";
import { useLangStore } from "@/stores/langStore";

const { t } = useI18n();
const resolver = zodResolver(loginSchema);
const loading = ref(false);
const toast = useToast();
const router = useRouter();
const langStore = useLangStore();

const login = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;

  loading.value = true;
  try {
    await handleLogin(values as LoginPayload, langStore.language);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("login.toast.success"),
      life: 3000,
    });
    router.push("/home");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.translatedMessage,
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo"><img src="/favicon.svg" alt="" /></div>
        <h1 class="auth-title">{{ $t("login.title") }}</h1>
        <p class="auth-subtitle">{{ $t("login.subtitle") }}</p>
      </div>

      <Form :resolver="resolver" @submit="login" class="flex flex-col gap-5 w-full">
        <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <IconField>
              <InputText v-bind="$field" id="username" type="text" fluid autocomplete="username"
                :class="{ 'p-invalid': $field?.invalid, 'p-valid': $field?.dirty && !$field?.invalid }" />
              <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--success)' }" />
            </IconField>
            <label for="username">{{ $t("signup.username") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid
              :inputProps="{ autocomplete: 'current-password' }"
              :class="{ 'p-invalid': $field?.invalid }" :aria-label="$t('signup.password')" />
            <label for="password">{{ $t("signup.password") }}</label>
          </FloatLabel>
          <div class="flex justify-end mt-1">
            <button type="button" class="link-btn link-btn--sm" @click="router.push('/forgot-password')">
              {{ $t("login.forgotPassword") }}
            </button>
          </div>
          <FieldMsg :field="$field" />
        </FormField>

        <Button type="submit" :label="$t('login.title')" :loading="loading" fluid class="mt-1" />
      </Form>

      <div class="auth-divider"><span>{{ $t("signup.or") }}</span></div>

      <OauthButtonComponent />

      <p class="auth-footer">
        {{ $t("login.noAccount") }}
        <button type="button" class="link-btn" @click="router.push('/signup')">
          {{ $t("login.signup") }}
        </button>
      </p>
    </div>
  </div>
</template>
