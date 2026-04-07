<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div
    class="page min-h-dvh flex flex-col"
    style="
      background: var(--background);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
    "
  >
    <div class="nav-spacer h-13"></div>

    <div
      class="film-strip film-strip--top flex w-full overflow-hidden py-1.5"
      aria-hidden="true"
    >
      <span
        v-for="n in 18"
        :key="n"
        class="film-hole flex-1 rounded-sm mx-1.5 opacity-85"
        style="height: 14px; max-width: 22px"
      />
    </div>

    <main
      class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center relative"
    >
      <div class="absolute inset-0 -z-10 blur-3xl bg-accent/10" />
      <div
        class="check-email-card w-full max-w-sm rounded-2xl px-8 py-8 bg-background/80"
        style="
          border: 0.5px solid rgba(47, 39, 206, 0.2);
          box-shadow: 0 2px 24px rgba(47, 39, 206, 0.07);
          backdrop-filter: blur(8px);
        "
      >
        <div class="hero-icon mb-6">
          <i
            class="pi pi-envelope"
            style="
              font-size: clamp(4rem, 15vw, 8rem);
              color: var(--primary);
              opacity: 0.9;
            "
          ></i>
        </div>

        <h2
          class="text-sm font-semibold uppercase tracking-widest mb-2"
          style="color: var(--primary)"
        >
          {{ $t("checkEmail.title") }}
        </h2>

        <p
          class="text-sm leading-relaxed mb-8"
          style="color: var(--text); opacity: 0.6"
        >
          {{ $t("checkEmail.description") }}
        </p>

        <button
          class="w-full rounded-lg py-3 text-sm font-semibold cursor-pointer transition-all duration-150 hover:-translate-y-px hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
          style="
            background: var(--primary);
            border: none;
            color: #f2f2f2;
            font-family: 'DM Sans', sans-serif;
          "
          @click="router.push('/login')"
        >
          <i class="pi pi-arrow-left mr-2 text-xs"></i>
          {{ $t("checkEmail.button") }}
        </button>
      </div>
    </main>

    <div
      class="film-strip film-strip--bottom flex w-full overflow-hidden py-1.5"
      aria-hidden="true"
    >
      <span
        v-for="n in 18"
        :key="n"
        class="film-hole flex-1 rounded-sm mx-1.5 opacity-85"
        style="height: 14px; max-width: 22px"
      />
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap");

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
</style>
