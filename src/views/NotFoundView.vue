<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="page min-h-dvh flex flex-col"
    style="background: var(--background); color: var(--text); font-family: 'DM Sans', sans-serif;">

    <div class="nav-spacer h-13"></div>

    <!-- Film strip top -->
    <div class="film-strip film-strip--top flex w-full overflow-hidden py-1.5" aria-hidden="true">
      <span v-for="n in 18" :key="n" class="film-hole flex-1 rounded-sm mx-1.5 opacity-85"
        style="height:14px; max-width:22px;" />
    </div>

    <!-- Main content -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">


      <!-- Big 404 -->
      <h1 class="hero-title leading-none tracking-wide mb-3"
        style="font-family: 'Bebas Neue', sans-serif; font-size: clamp(6rem, 22vw, 14rem); font-weight: 400; color: var(--text);">
        4<span style="color: var(--accent);">×</span>4
      </h1>

      <!-- Card -->
      <div class="signup-card w-full max-w-sm rounded-2xl px-8 py-7"
        style="background: var(--background); border: 0.5px solid rgba(47,39,206,0.2); box-shadow: 0 2px 24px rgba(47,39,206,0.07);">

        <p class="text-sm font-semibold uppercase tracking-widest mb-2" style="color: var(--primary);">
          {{ $t("notFound.title") || "Page not found" }}
        </p>

        <p class="text-sm leading-relaxed mb-6" style="color: var(--text); opacity: 0.55;">
          {{ $t("notFound.description")
            ||
            "Looks like this reel got lost in the archive. The page you're looking for doesn't exist." }}
        </p>

        <button
          class="w-full rounded-lg py-2.5 text-sm font-semibold cursor-pointer transition-all duration-150 hover:-translate-y-px hover:opacity-85 active:scale-95 transition-all"
          style="background: var(--primary); border: none; color: #f2f2f2; font-family: 'DM Sans', sans-serif;"
          @click="router.push('/')">
          {{ $t("notFound.linkText") || "Back to home" }}
        </button>
      </div>

    </main>

    <!-- Film strip bottom -->
    <div class="film-strip film-strip--bottom flex w-full overflow-hidden py-1.5" aria-hidden="true">
      <span v-for="n in 18" :key="n" class="film-hole flex-1 rounded-sm mx-1.5 opacity-85"
        style="height:14px; max-width:22px;" />
    </div>

  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      hints: ["10,000+ films catalogued", "Free forever plan", "No credit card required"]
    };
  }
};
</script>

<style scoped>

.film-strip {
  background: var(--primary);
}

.film-strip--top {
  border-bottom: 2px solid var(--accent);
}

.film-strip--bottom {
  border-top: 2px solid var(--accent);
}

.film-hole {
  background: var(--background);
}

.badge-dot {
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
</style>