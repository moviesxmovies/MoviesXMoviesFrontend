<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="auth-page">
    <main class="flex flex-col items-center text-center">
      <h1 class="nf-title" aria-label="404">
        4<span class="nf-x">×</span>4
      </h1>

      <div class="auth-card nf-card">
        <p class="nf-heading">
          {{ $t("notFound.title") || "Page not found" }}
        </p>

        <p class="auth-subtitle mb-6">
          {{ $t("notFound.description")
            ||
            "Looks like this reel got lost in the archive. The page you're looking for doesn't exist." }}
        </p>

        <button class="primary-btn" @click="router.push('/')">
          <i class="pi pi-home" aria-hidden="true"></i>
          {{ $t("notFound.linkText") || "Back to home" }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nf-title {
  font-family: var(--font-display);
  font-size: clamp(6rem, 22vw, 11rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--text);
  margin: 0 0 1rem;
}

.nf-x {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-card {
  max-width: 24rem;
}

.nf-heading {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
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
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
}

.primary-btn:hover {
  background: var(--primary-hover);
}
</style>

<script lang="ts">
export default {
  data() {
    return {
      hints: ["10,000+ films catalogued", "Free forever plan", "No credit card required"]
    };
  }
};
</script>
