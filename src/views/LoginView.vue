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
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6"
    style="background-color: var(--background)">
    <div class="w-full max-w-md my-4">
      <div class="rounded-2xl border shadow-sm overflow-hidden"
        style="background-color: var(--background); border-color: var(--secondary)">

        <div class="p-6 sm:p-8">
          <div class="text-center mb-6 sm:mb-8">
            <img src="/favicon.svg" alt="Logo" class="w-16 h-16 m-auto mb-4" />
            <h2 class="text-xl sm:text-2xl font-bold" style="color: var(--text)">
              {{ $t("login.title") }}
            </h2>
            <p class="text-xs sm:text-sm mt-2 px-2" style="color: var(--text); opacity: 0.6">
              {{ $t("login.subtitle") }}
            </p>
          </div>

          <Form :resolver="resolver" @submit="login" class="flex flex-col gap-5 w-full">
            <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
              <FloatLabel variant="over">
                <IconField>
                  <InputText v-bind="$field" id="username" type="text" fluid
                    :class="{ 'p-invalid': $field?.invalid, 'p-valid': $field?.dirty && !$field?.invalid }" />
                  <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                    :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }" />
                </IconField>
                <label for="username">{{ $t("signup.username") }}</label>
              </FloatLabel>
              <FieldMsg :field="$field" />
            </FormField>

            <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
              <FloatLabel variant="over">
                <Password v-bind="$field" id="password" :feedback="false" toggleMask fluid
                  :class="{ 'p-invalid': $field?.invalid }" />
                <label for="password">{{ $t("signup.password") }}</label>
              </FloatLabel>
              <div class="flex justify-end mt-1">
                <button type="button" class="text-xs font-bold hover:underline" style="color: var(--primary)"
                  @click="router.push('/forgot-password')">
                  {{ $t("login.forgotPassword") }}
                </button>
              </div>
              <FieldMsg :field="$field" />
            </FormField>

            <Button type="submit" :label="$t('login.title')" :loading="loading" fluid class="py-3 mt-2" />
          </Form>

          <div class="relative flex items-center gap-3 my-4 sm:my-8">
            <div class="flex-1 h-px" style="background-color: var(--secondary); opacity: 0.5" />
            <span class="text-[10px] uppercase tracking-widest font-bold" style="color: var(--text); opacity: 0.4">
              {{ $t("signup.or") }}
            </span>
            <div class="flex-1 h-px" style="background-color: var(--secondary); opacity: 0.5" />
          </div>

          <OauthButtonComponent @click="loginWithGoogle" />

          <p class="text-center text-sm mt-4 sm:mt-8" style="color: var(--text); opacity: 0.7">
            {{ $t("login.noAccount") }}
            <button type="button" class="font-bold hover:underline" style="color: var(--primary)"
              @click="router.push('/signup')">
              {{ $t("login.signup") }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
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

:deep(.p-inputtext) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important;
  padding: 0.75rem !important;
}

:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-password-input) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important;
  padding: 0.75rem !important;
}


:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.6;
}

:deep(.p-invalid .p-inputtext),
:deep(.p-invalid.p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

:deep(.p-valid .p-inputtext),
:deep(.p-valid.p-inputtext) {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px #22c55e !important;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  padding: 0.85rem !important;
  font-weight: 700;
}

:deep(.p-button:hover) {
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
