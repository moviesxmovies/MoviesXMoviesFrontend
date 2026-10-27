<script setup lang="ts">
import Button from "primevue/button";
import { loginWithGoogle } from "@/composables/useOAUTH";

defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <Button @click="loginWithGoogle" :loading="loading" :aria-label="$t('components.oauthButton', ['Google'])"
    class="oauth-btn" unstyled>
    <div class="flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.22l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    </div>

    <span class="oauth-label">
      {{ $t("components.oauthButton", ["Google"]) }}
    </span>
  </Button>
</template>

<style scoped>
.oauth-btn {
  width: 100%;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.oauth-btn:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
}

.oauth-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.oauth-label {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text);
}
</style>
