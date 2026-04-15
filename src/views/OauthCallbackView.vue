<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
import { oauthLogin } from "@/repositories/auth/authRepository";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

onMounted(async () => {
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
  <div class="min-h-screen flex flex-col items-center justify-center px-4" style="background-color: var(--background)">
    <div class="flex flex-col items-center gap-6 animate-fade-in">

      <div class="relative flex items-center justify-center">
        <ProgressSpinner style="width: 80px; height: 80px" strokeWidth="3" fill="transparent" animationDuration=".5s" />
        <img src="/favicon.svg" alt="Logo" class="w-6 h-6 absolute opacity-50" />
      </div>

      <div class="text-center">
        <h2 class="text-xl font-bold tracking-tight" style="color: var(--text)">
          {{ t('oauth.loading') }}
        </h2>
        <p class="text-sm mt-2" style="color: var(--text); opacity: 0.5">
          {{ $t("login.subtitle") }} </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-progress-spinner-circle) {
  stroke: var(--primary) !important;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>