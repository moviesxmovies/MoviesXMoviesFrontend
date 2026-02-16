<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code;
  if (!code) return router.push("/login");

  try {
    const { data } = await axios.post(import.meta.env.VITE_URL_PROTOCOL + "/api/oauth/google/", { code: code });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Session started', life: 3000 });
    authStore.handleLogin(data.access, data.refresh);
  } catch (error) {
    const status = error.response?.status;
    let detail = "Failed to authenticate with Google";
    if (status === 400) {
      detail = "Invalid Google OAuth code";
    }
    router.push("/login", { query: { error: "failed_google_auth" } });
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold mb-4">OAuth Callback</h1>
    <p class="mb-4">Processing your authentication...</p>
  </div>
</template>
