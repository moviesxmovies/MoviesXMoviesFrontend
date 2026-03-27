<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const email = ref("");
const emailError = ref(false);
const authStore = useAuthStore();
if (authStore.isAuthenticated) {
  router.push("/home");
}

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

    <!-- HERO -->
    <main class="hero">
      <!-- Decorative film strip top -->
      <div class="film-strip film-strip--top" aria-hidden="true">
        <span v-for="n in 18" :key="n" class="film-hole" />
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot" />
          {{ $t("home.badge") || "Now in public beta" }}
        </div>

        <h1 class="hero-title">
          Movies<span class="logo-x">×</span>Movies
        </h1>


        <!-- SIGNUP CARD -->
        <div class="signup-card">
          <span class="signup-label">{{ $t("home.welcome") || "Get started — it's free" }}</span>

          <div class="input-row">
            <input v-model="email" class="email-input" :class="{ 'email-input--error': emailError }" type="email"
              :placeholder="$t('home.emailPlaceholder') || 'Enter your email...'" @keydown="handleKeydown" />
            <button class="btn-signup" @click="handleSignup">
              {{ $t("home.signupBtn") || "Sign up" }}
            </button>
          </div>

          <div class="divider">
            <span class="divider-line" />
            <span class="divider-text">{{ $t("home.orContinue") || "or continue with" }}</span>
            <span class="divider-line" />
          </div>

          <OauthButtonComponent @click="() => router.push('/login')" />

        </div>

        <!-- FEATURES -->
        <ul class="features">
          <li class="feature-item">
            <span class="feature-icon">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            {{ $t("home.feature1") || "Free forever plan" }}
          </li>
          <li class="feature-item">
            <span class="feature-icon">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            {{ $t("home.feature2") || "No credit card required" }}
          </li>
          <li class="feature-item">
            <span class="feature-icon">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            {{ $t("home.feature3") || "10,000+ films catalogued" }}
          </li>
        </ul>
      </div>

      <!-- Decorative film strip bottom -->
      <div class="film-strip film-strip--bottom" aria-hidden="true">
        <span v-for="n in 18" :key="n" class="film-hole" />
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── RESET ── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.logo-x {
  color: var(--accent);
  margin: 0 1px;
}

ul {
  list-style: none;
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* ── PAGE ── */
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
}


/* ── FILM STRIPS ── */
.film-strip {
  display: flex;
  width: 100%;
  background: var(--primary);
  padding: 6px 0;
  gap: 0;
  overflow: hidden;
}

.film-strip--top {
  border-bottom: 2px solid var(--accent);
}

.film-strip--bottom {
  border-top: 2px solid var(--accent);
}

.film-hole {
  flex: 1;
  height: 14px;
  background: var(--background);
  border-radius: 3px;
  margin: 0 6px;
  max-width: 22px;
  opacity: 0.85;
}

/* ── HERO ── */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem 3.5rem;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--secondary);
  border-radius: 999px;
  padding: 0.3rem 1rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--primary);
  margin-bottom: 1.8rem;
  letter-spacing: 0.01em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse 2.2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.65);
  }
}

.hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--text);
  margin-bottom: 1.1rem;
}

.hero-title--accent {
  color: var(--primary);
  -webkit-text-stroke: 0.5px var(--accent);
}

.hero-subtitle {
  font-size: 1rem;
  font-weight: 300;
  color: var(--text);
  opacity: 0.6;
  max-width: 420px;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

/* ── SIGNUP CARD ── */
.signup-card {
  background: var(--background);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 16px;
  padding: 1.8rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 2px 24px rgba(47, 39, 206, 0.07);
}

.signup-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1rem;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.email-input {
  flex: 1;
  background: var(--background);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-width: 0;
}

.email-input::placeholder {
  color: var(--text);
  opacity: 0.4;
}

.email-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(47, 39, 206, 0.1);
}

.email-input--error {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(187, 61, 255, 0.12) !important;
  animation: shake 0.35s ease;
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
  background: var(--primary);
  border: none;
  color: #f2f2f2;
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s, transform 0.1s;
}

.btn-signup:hover {
  opacity: 0.87;
  transform: translateY(-1px);
}

.btn-signup:active {
  transform: scale(0.98);
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0.9rem 0;
}

.divider-line {
  flex: 1;
  height: 0.5px;
  background: rgba(47, 39, 206, 0.15);
}

.divider-text {
  font-size: 0.78rem;
  color: var(--text);
  opacity: 0.5;
  white-space: nowrap;
}

.social-btn {
  width: 100%;
  background: var(--background);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 400;
  transition: background 0.15s, border-color 0.15s;
}

.social-btn:hover {
  background: var(--secondary);
  border-color: var(--primary);
}

.terms {
  font-size: 0.74rem;
  color: var(--text);
  opacity: 0.5;
  text-align: center;
  margin-top: 1.1rem;
  line-height: 1.6;
}

/* ── FEATURES ── */
.features {
  display: flex;
  gap: 1.8rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--text);
  opacity: 0.55;
}

.feature-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--secondary);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── RESPONSIVE ── */
@media (max-width: 480px) {
  .nav {
    padding: 0.9rem 1rem;
  }

  .hero-content {
    padding: 2rem 1rem 2.5rem;
  }

  .signup-card {
    padding: 1.4rem 1.2rem;
  }

  .input-row {
    flex-direction: column;
  }

  .btn-signup {
    width: 100%;
  }

  .features {
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }
}
</style>