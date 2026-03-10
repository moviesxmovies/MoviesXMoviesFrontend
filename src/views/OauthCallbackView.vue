<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from 'primevue/usetoast';

import ProgressSpinner from 'primevue/progressspinner';
import { oauthLogin } from "@/repositories/auth/authRepository";
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/themeStore';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const themeStore = useThemeStore();

onMounted(async () => {
  themeStore.loadTheme();
  const code = route.query.code;
  if (!code) return router.push("/login");

  try {
    await oauthLogin(code as string);
    toast.add({ severity: 'success', summary: 'Success', detail: t('oauth.toast.success'), life: 3000 });
    router.push("/home");
  } catch (error: any) {
    const status = error.response?.status;
    let detail = t('oauth.toast.connectionError', ['Google']);
    if (status === 400) {
      detail = t('oauth.toast.invalidCode', ['Google']);
    }
    router.push("/login");
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <ProgressSpinner />
    <p class="text-3xl">{{ t('oauth.loading') }}</p>
  </div>
</template>
