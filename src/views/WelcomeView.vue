<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import WelcomeDeck from "@/components/welcomeDeck.vue";

const router = useRouter();
const email = ref("");
const emailError = ref(false);

function handleSignup() {
  if (!email.value.trim() || !email.value.includes("@")) {
    emailError.value = true;
    setTimeout(() => (emailError.value = false), 1400);
    return;
  }
  router.push({ path: "/signup", query: { email: email.value } });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") handleSignup();
}

</script>

<template>
  <div class="page">
    <main class="hero">
      <section class="hero-content">
        <h1 class="hero-title">{{ $t("home.headline") }}</h1>

        <p class="hero-tagline">{{ $t("home.tagline") }}</p>

        <!-- SIGNUP CARD -->
        <div class="signup-card">
          <span class="signup-label">{{ $t("home.welcome") || "Get started — it's free" }}</span>

          <form class="input-row" @submit.prevent="handleSignup" novalidate>
            <label for="welcome-email" class="sr-only">{{ $t("home.emailLabel") }}</label>
            <input id="welcome-email" v-model="email" class="email-input" :class="{ 'email-input--error': emailError }"
              type="email" autocomplete="email" :aria-invalid="emailError"
              :placeholder="$t('home.emailPlaceholder') || 'Enter your email...'" @keydown="handleKeydown" />
            <button type="button" class="btn-signup" @click="handleSignup">
              {{ $t("home.signupBtn") || "Sign up" }}
              <i class="pi pi-arrow-right" aria-hidden="true" />
            </button>
          </form>

          <div class="divider">
            <span class="divider-line" />
            <span class="divider-text">{{ $t("home.orContinue") || "or continue with" }}</span>
            <span class="divider-line" />
          </div>

          <OauthButtonComponent />

          <p class="login-hint">
            <RouterLink to="/login">{{ $t("home.login") }}</RouterLink>
          </p>
        </div>

        <!-- FEATURES -->
        <ul class="features">
          <li class="feature-item">
            <i class="pi pi-heart feature-icon" aria-hidden="true" />
            {{ $t("home.feature1") || "Free forever plan" }}
          </li>
          <li class="feature-item">
            <i class="pi pi-compass feature-icon" aria-hidden="true" />
            {{ $t("home.feature2") || "No credit card required" }}
          </li>
          <li class="feature-item">
            <i class="pi pi-list feature-icon" aria-hidden="true" />
            {{ $t("home.feature3") || "10,000+ films catalogued" }}
          </li>
        </ul>
      </section>

      <WelcomeDeck class="hero-visual" />
    </main>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.page {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--text);
  overflow: hidden;
}

/* ── HERO ── */
.hero {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 3rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 6rem 1.5rem 3rem;
}

@media (min-width: 960px) {
  .hero {
    grid-template-columns: 1.1fr 0.9fr;
    padding-top: 5rem;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

@media (min-width: 960px) {
  .hero-content {
    align-items: flex-start;
    text-align: left;
  }
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.08;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
  text-wrap: balance;
}

.hero-tagline {
  margin: 1.25rem 0 0;
  max-width: 34rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-muted);
}

/* ── SIGNUP CARD ── */
.signup-card {
  width: 100%;
  max-width: 30rem;
  margin-top: 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
    padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.signup-label {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .input-row {
    flex-direction: column;
  }

  .input-row .email-input {
    flex: none;
  }
}

.email-input {
  flex: 1;
  min-width: 0;
  height: 3rem;
  padding: 0 1rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--text);
  background: var(--background);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.email-input:focus {
  border-color: var(--primary);
  box-shadow: var(--focus-ring);
}

.email-input--error {
  border-color: var(--danger);
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

.btn-signup {
  height: 3rem;
  padding: 0 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: var(--on-primary);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, transform 0.1s;
}

.btn-signup:hover {
  background: var(--primary-hover);
}

.btn-signup:active {
  transform: scale(0.98);
}

.btn-signup i {
  font-size: 0.875rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-text {
  font-size: 0.8125rem;
  color: var(--text-subtle);
  white-space: nowrap;
}

.login-hint {
  margin: 0;
  text-align: center;
  font-size: 0.9375rem;
}

.login-hint a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}

.login-hint a:hover {
  text-decoration: underline;
}

/* ── FEATURES ── */
.features {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1.5rem;
}

@media (min-width: 960px) {
  .features {
    justify-content: flex-start;
  }
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-muted);
}

.feature-icon {
  font-size: 1rem;
  color: var(--text-subtle);
}

/* ── VISUAL ── */
.hero-visual {
  display: none;
}

@media (min-width: 960px) {
  .hero-visual {
    display: block;
  }
}
</style>
