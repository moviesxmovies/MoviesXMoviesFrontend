<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useToast } from "primevue/usetoast";
import { Button, Card, InputText, Password } from "primevue";
import { loginWithGoogle } from "@/composables/useOAUTH";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import { handleLogin } from "@/repositories/auth/authRepository";
import { router } from "@/router";
import type { LoginPayload } from "@/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loginSchema = z.object({
  username: z.string().min(1, t("components.form.requiredUsername")),
  password: z.string().min(1, t("components.form.requiredPassword")),
});

const form = ref({
  username: "",
  password: "",
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);

const toast = useToast();

const validate = () => {
  const result = loginSchema.safeParse(form.value);
  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors as any;
    for (const key in errors.value) {
      if (Array.isArray(errors.value[key])) {
        errors.value[key] = (errors.value[key] as any)[0];
      }
    }
    return false;
  }
  errors.value = {};
  return true;
};

const login = async () => {
  if (!validate()) return;

  loading.value = true;
  try {
    await handleLogin(form.value as LoginPayload);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("login.toast.success"),
      life: 3000,
    });
    router.push("/home");
  } catch (error: any) {
    const status = error.response?.status;
    let detail = t("login.toast.connectionError", ["Google"]);

    if (status === 401) detail = t("login.toast.invalidCredentials");
    if (status === 403) detail = t("login.toast.accessDenied");

    toast.add({ severity: "error", summary: "Error", detail, life: 5000 });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex justify-content-center align-items-center min-h-screen">
    <Card style="width: 24rem">
      <template #title> {{ $t("login.title") }} </template>
      <template #content>
        <div class="flex flex-column gap-4">
          <div class="flex flex-column gap-1">
            <label for="username" class="font-semibold">{{
              $t("login.username")
            }}</label>
            <InputText
              id="username"
              v-model="form.username"
              :class="{ 'p-invalid': errors.username }"
              @input="errors.username = ''"
            />
            <small v-if="errors.username" class="p-error">{{
              errors.username
            }}</small>
          </div>

          <div class="flex flex-column gap-1">
            <label for="password" class="font-semibold">{{
              $t("login.password")
            }}</label>
            <Password
              id="password"
              v-model="form.password"
              :class="{ 'p-invalid': errors.password }"
              :feedback="false"
              toggleMask
              @input="errors.password = ''"
            />
            <small v-if="errors.password" class="p-error">{{
              errors.password
            }}</small>
          </div>

          <Button
            label="Login"
            icon="pi pi-sign-in"
            :loading="loading"
            @click="login"
            >{{ $t("login.title") }}</Button
          >
          <OauthButtonComponent @click="loginWithGoogle" />
        </div>
      </template>
    </Card>
    <Button
      variant="link"
      label="Link"
      @click="router.push('/signup')"
      class="mt-4 sm:mt-6 text-[#bcbbdd] text-xs hover:text-[#f2f2f2] transition-colors underline decoration-[#3a31d8]"
    >
      {{ $t("login.signup") }}
    </Button>
  </div>
</template>
