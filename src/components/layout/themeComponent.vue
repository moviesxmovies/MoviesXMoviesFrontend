
<script setup lang="ts">
import { useThemeStore } from "@/stores/themeStore";
import { computed, onMounted } from "vue";

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadTheme();
});

const isDark = computed(() => themeStore.theme === "dark");
</script>

<template>
  <button
    @click="themeStore.toggleTheme()"
    class="max-w-16 relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all active:scale-95"
    :style="{
      borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)',
      background: 'color-mix(in srgb, var(--text) 5%, transparent)',
    }"
    aria-label="Change theme"
  >
    <svg
      class="absolute h-5 w-5 transition-all duration-500"
      :style="{
        opacity: isDark ? 0 : 1,
        scale: isDark ? 0.5 : 1,
        rotate: isDark ? '90deg' : '0deg',
        color: 'var(--primary)',
      }"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
      />
    </svg>

    <svg
      class="absolute h-5 w-5 transition-all duration-500"
      :style="{
        opacity: isDark ? 1 : 0,
        scale: isDark ? 1 : 0.5,
        rotate: isDark ? '0deg' : '-90deg',
        color: 'var(--accent)',
      }"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z"
      />
    </svg>
  </button>
</template>
