<script lang="ts" setup>
import Card from "@/components/layout/appCardComponent.vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
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
import { defineComponent, h } from "vue";
import { api } from "@/composables/useAPI";
import { config } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

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

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    password: z
      .string()
      .min(10, "At least 10 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/\d/, "Must include a number"),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }

    const pwd = data.password.toLowerCase();
    const checks = [
      { value: data.username, label: "username" },
      { value: data.first_name, label: "first name" },
      { value: data.last_name, label: "last name" },
      { value: data.email, label: "email" },
    ];
    for (const { value, label } of checks) {
      if (value && pwd === value.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password cannot be the same as your ${label}`,
          path: ["password"],
        });
      }
    }
  });

const resolver = zodResolver(schema);

interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

const onFormSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;

  try {
    await registerUser(values as RegisterPayload);
    await loginUser(values as RegisterPayload);

    toast.add({
      severity: "success",
      summary: "Welcome!",
      detail: "Your account has been created",
      life: 3000,
    });

    router.push("/home");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.detail || "Registration failed",
      life: 5000,
    });
  }
};

const registerUser = async (values: RegisterPayload) => {
  const { data } = await api.post(config.apiUrl + "/auth/signup/", values);
  return data;
};

const loginUser = async (values: RegisterPayload) => {
  const { data } = await api.post<LoginResponse>(
    config.apiUrl + "/auth/login/",
    {
      username: values.username,
      password: values.password,
    },
  );
  authStore.handleLogin(data.access, data.refresh);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <Card class="text-center p-8 max-w-xl">
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
              <label for="first_name">First Name</label>
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
              <label for="last_name">Last Name</label>
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
            <label for="username">Username</label>
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
            <label for="email">Email</label>
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
            <label for="password">Password</label>
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
            <label for="confirm_password">Confirm Password</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <Button type="submit" label="Sign up" fluid />
      </Form>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-invalid.p-inputtext) {
  border-color: #ef4444 !important;
}
:deep(.p-valid.p-inputtext) {
  border-color: #22c55e !important;
}
:deep(.p-invalid .p-password-input) {
  border-color: #ef4444 !important;
}
:deep(.p-valid .p-password-input) {
  border-color: #22c55e !important;
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
