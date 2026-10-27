<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";

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
    <div class="bg-glow" aria-hidden="true" />

    <main class="hero">
      <section class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot" aria-hidden="true" />
          {{ $t("home.badge") || "Now in public beta" }}
        </div>

        <h1 class="hero-title">
          Movies<span class="logo-x">×</span>Movies
        </h1>

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
            <span class="feature-icon" aria-hidden="true"><i class="pi pi-heart" /></span>
            {{ $t("home.feature1") || "Free forever plan" }}
          </li>
          <li class="feature-item">
            <span class="feature-icon" aria-hidden="true"><i class="pi pi-sparkles" /></span>
            {{ $t("home.feature2") || "No credit card required" }}
          </li>
          <li class="feature-item">
            <span class="feature-icon" aria-hidden="true"><i class="pi pi-list" /></span>
            {{ $t("home.feature3") || "10,000+ films catalogued" }}
          </li>
        </ul>
      </section>

      <!-- Ilustración decorativa: pila de pósters -->
      <div class="hero-visual" aria-hidden="true">
        <div class="poster poster--back" />
        <div class="poster poster--mid" />
        <div class="poster poster--front">
          <div class="poster-shine" />
          <div class="poster-meta">
            <span class="poster-line poster-line--lg" />
            <span class="poster-line" />
          </div>
        </div>
        <div class="rating-chip">
          <i v-for="n in 5" :key="n" class="pi" :class="n <= 4 ? 'pi-star-fill' : 'pi-star'" />
        </div>
        <div class="swipe-chip swipe-chip--like"><i class="pi pi-thumbs-up-fill" /></div>
        <div class="swipe-chip swipe-chip--nope"><i class="pi pi-times" /></div>
      </div>
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

.bg-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(60rem 30rem at 15% 10%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 70%),
    radial-gradient(40rem 30rem at 90% 80%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%);
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

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-soft);
  border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 25%, transparent);
  animation: pulse 2.2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 8vw, 5rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text);
  margin: 0;
}

.logo-x {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0.02em;
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
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.signup-label {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
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
  font-weight: 700;
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
  font-size: 0.85rem;
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
  font-weight: 600;
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
  gap: 0.6rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-muted);
}

.feature-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

/* ── VISUAL ── */
.hero-visual {
  position: relative;
  display: none;
  height: 30rem;
}

@media (min-width: 960px) {
  .hero-visual {
    display: block;
  }
}

.poster {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 15rem;
  aspect-ratio: 2 / 3;
  border-radius: 1.25rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.poster--back {
  transform: translate(-50%, -50%) translateX(-5.5rem) rotate(-12deg);
  background: linear-gradient(160deg, #1d3557 0%, #0b0a12 80%);
  opacity: 0.85;
}

.poster--mid {
  transform: translate(-50%, -50%) translateX(5.5rem) rotate(10deg);
  background: linear-gradient(160deg, #6b2d5c 0%, #0b0a12 85%);
  opacity: 0.9;
}

.poster--front {
  transform: translate(-50%, -50%) rotate(-2deg);
  background:
    radial-gradient(circle at 35% 32%, #ff7a5c 0 22%, transparent 23%),
    linear-gradient(170deg, #3d34d6 0%, #1a1745 55%, #0b0a12 100%);
  animation: float 6s ease-in-out infinite;
}

.poster-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.12) 45%, transparent 60%);
}

.poster-meta {
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.poster-line {
  display: block;
  height: 0.5rem;
  width: 55%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
}

.poster-line--lg {
  height: 0.9rem;
  width: 80%;
  background: rgba(255, 255, 255, 0.9);
}

@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(-2deg);
  }

  50% {
    transform: translate(-50%, -52%) rotate(-1deg);
  }
}

.rating-chip {
  position: absolute;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  display: flex;
  gap: 0.3rem;
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  color: var(--star);
  font-size: 1.1rem;
}

.swipe-chip {
  position: absolute;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  background: var(--surface);
}

.swipe-chip--like {
  right: 8%;
  top: 22%;
  color: var(--success);
}

.swipe-chip--nope {
  left: 8%;
  top: 30%;
  color: var(--danger);
}
</style>
