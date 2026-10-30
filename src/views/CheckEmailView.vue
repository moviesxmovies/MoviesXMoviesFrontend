<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="auth-page">
    <div class="auth-card text-center">
      <div class="mail-icon" aria-hidden="true">
        <i class="pi pi-envelope"></i>
      </div>

      <h1 class="auth-title">{{ $t("checkEmail.title") }}</h1>

      <p class="auth-subtitle mb-8">{{ $t("checkEmail.description") }}</p>

      <button class="primary-btn" @click="router.push('/login')">
        <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
        {{ $t("checkEmail.button") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mail-icon {
  width: 5.5rem;
  height: 5.5rem;
  margin: 0 auto 1.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  color: var(--text-subtle);
  font-size: 2.5rem;
}

.primary-btn {
  width: 100%;
  min-height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: var(--on-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.primary-btn:hover {
  background: var(--primary-hover);
}
</style>
