<script lang="ts" setup>
import Card from "@/components/appCardComponent.vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import {
  Button,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  Password,
  useToast,
} from "primevue";
import { defineComponent, h, onMounted } from "vue";
import { useThemeStore } from "@/stores/themeStore";
import { useRouter } from "vue-router";
import type { LoginPayload, RegisterPayload } from "@/types";
import {
  handleLogin,
  handleRegister,
} from "@/repositories/auth/authRepository";
import { schema } from "@/schemas/signUpSchema";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const themeStore = useThemeStore();
const router = useRouter();
const toast = useToast();

onMounted(() => {
  themeStore.loadTheme();
});

const FieldMsg = defineComponent({
  props: { field: Object },
  setup(props) {
    return () => {
      const f = props.field as any;
      if (!f?.dirty) return null;

      if (f.invalid) {
        return h("div", { class: "field-msg error" }, [
          h("i", { class: "pi pi-times-circle msg-icon" }),
          f.error?.message,
        ]);
      }
    };
  },
});

const resolver = zodResolver(schema);

const onFormSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;

  try {
    await handleRegister(values as RegisterPayload);
    const loginValues = {
      username: values.username,
      password: values.password,
    } as LoginPayload;
    await handleLogin(loginValues);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("signup.toast.success"),
      life: 3000,
    });

    router.push("/home");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.detail || t("signup.toast.failed"),
      life: 5000,
    });
  }
};
defineExpose({ onFormSubmit });
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <Card class="text-center p-8 max-w-xl">
      <img src="/favicon.svg" alt="Logo" class="m-auto mb-6 w-16 h-16" />
      <Form
        :resolver="resolver"
        @submit="onFormSubmit"
        class="flex flex-col gap-6 w-full sm:w-80"
      >
        <div class="flex gap-3">
          <FormField
            v-slot="$field"
            name="first_name"
            initialValue=""
            class="flex flex-col gap-1 flex-1"
          >
            <FloatLabel variant="over">
              <IconField>
                <InputText
                  v-bind="$field"
                  id="first_name"
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
              <label for="first_name">{{ $t("signup.firstName") }}</label>
            </FloatLabel>
            <FieldMsg :field="$field" />
          </FormField>

          <FormField
            v-slot="$field"
            name="last_name"
            initialValue=""
            class="flex flex-col gap-1 flex-1"
          >
            <FloatLabel variant="over">
              <IconField>
                <InputText
                  v-bind="$field"
                  id="last_name"
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
              <label for="last_name">{{ $t("signup.lastName") }}</label>
            </FloatLabel>
            <FieldMsg :field="$field" />
          </FormField>
        </div>

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

        <Button type="submit" label="Sign up" fluid />
      </Form>
      <Button
        variant="link"
        label="Link"
        @click="router.push('/login')"
        class="mt-4 sm:mt-6 text-s underline"
      >
        {{ $t("signup.login") }}
      </Button>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-invalid.p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}
:deep(.p-valid.p-inputtext) {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px #22c55e !important;
}
:deep(.p-invalid .p-password-input) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}
:deep(.p-valid .p-password-input) {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 1px #22c55e !important;
}

/* Card bg and text */
:deep(.p-card) {
  background-color: var(--background);
  color: var(--text);
  border: 1px solid var(--secondary);
}

/* Labels */
:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.7;
}

:deep(.p-float-label:has(input:focus) label),
:deep(.p-float-label:has(input:not(:placeholder-shown)) label) {
  color: var(--primary);
  opacity: 1;
}

/* Inputs */
:deep(.p-inputtext) {
  background-color: var(--background);
  color: var(--text);
  border-color: var(--secondary);
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

/* Password input */
:deep(.p-password-input) {
  background-color: var(--background);
  color: var(--text);
  border-color: var(--secondary);
}

:deep(.p-password-input:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
