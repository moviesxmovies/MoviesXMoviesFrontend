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
import { loginWithGoogle } from "@/composables/useOAUTH";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import { FieldMsg, handleLogin } from "@/repositories/auth/authRepository";
import type { LoginPayload } from "@/types";
import { useI18n } from "vue-i18n";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { loginSchema } from "@/schemas/loginSchema";
import { useRouter } from "vue-router";

const { t } = useI18n();
const resolver = zodResolver(loginSchema);
const loading = ref(false);
const toast = useToast();
const router = useRouter();

const login = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;

  loading.value = true;
  try {
    await handleLogin(values as LoginPayload);
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
      detail: error.response?.data?.detail,
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div
      class="relative w-full max-w-sm rounded-2xl border bg-background/80 border-primary/40 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6">
      <div class="absolute -inset-4 -z-10 blur-3xl bg-accent/50" />

      <div class="text-center">
        <img src="/favicon.svg" alt="Logo" class="w-16 h-16 sm:w-16 sm:h-16 m-auto" />
        <h2 class="text-lg sm:text-xl font-semibold mt-2 sm:mt-3" style="color: var(--text)">
          {{ $t("login.title") }}
        </h2>
        <p class="text-xs sm:text-sm mt-1" style="color: var(--text); opacity: 0.5">
          {{ $t("login.subtitle") }}
        </p>
      </div>

      <Form :resolver="resolver" @submit="login" class="flex flex-col gap-3 sm:gap-4 w-full">
        <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <IconField>
              <InputText v-bind="$field" id="username" type="text" fluid :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }" />
              <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }" />
            </IconField>
            <label for="username">{{ $t("signup.username") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
          <FloatLabel variant="over">
            <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid :class="{
              'p-invalid': $field?.invalid,
              'p-valid': $field?.dirty && !$field?.invalid,
            }" />
            <label for="password">{{ $t("signup.password") }}</label>
          </FloatLabel>
          <div v-if="$field?.dirty && $field?.invalid" class="flex flex-col gap-1 mt-1">
            <div v-for="(error, i) of $field?.errors" :key="i" class="flex items-center gap-1.5 text-xs"
              style="color: #ef4444">
              <i class="pi pi-times-circle text-xs" />
              {{ error.message }}
            </div>
          </div>
        </FormField>

        <div class="flex justify-end -mt-1 sm:-mt-2">
          <button type="button" class="text-xs transition-opacity hover:opacity-100"
            style="color: var(--primary); opacity: 0.7; background: none; border: none; cursor: pointer; padding: 0;"
            @click="router.push('/forgot-password')">
            {{ $t("login.forgotPassword") }}
          </button>
        </div>

        <Button type="submit" :label="$t('login.title')" icon="pi pi-sign-in" :loading="loading" fluid
          class="mt-1 sm:mt-2" />
      </Form>

      <div class="relative flex items-center gap-3">
        <div class="flex-1 h-px" style="background-color: var(--secondary)" />
        <span class="text-xs" style="color: var(--text); opacity: 0.4">
          {{ $t("signup.or") }}
        </span>
        <div class="flex-1 h-px" style="background-color: var(--secondary)" />
      </div>

      <OauthButtonComponent @click="loginWithGoogle" />

      <p class="text-center text-xs" style="color: var(--text); opacity: 0.5">
        {{ $t("login.noAccount") }}
        <button type="button" class="transition-opacity hover:opacity-100"
          style="color: var(--primary); opacity: 0.8; background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 3px;"
          @click="router.push('/signup')">
          {{ $t("login.signup") }}
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
