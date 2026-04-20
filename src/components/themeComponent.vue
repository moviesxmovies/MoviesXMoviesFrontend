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
  <button @click="themeStore.toggleTheme()" class="theme-btn" :aria-label="$t('components.changeTheme')">
    <div class="icon-theme-container">
      <svg class="icon sun-icon" :class="{ 'hidden-icon': isDark }" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      </svg>

      <svg class="icon moon-icon" :class="{ 'hidden-icon': !isDark }" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
      </svg>
    </div>
  </button>
</template>
<style scoped>
.theme-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border: 0.5px solid rgba(47, 39, 206, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text);
  overflow: hidden;
}

.icon-theme-container {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s ease;
  color: var(--primary);
}

.moon-icon {
  color: var(--accent);
}

.hidden-icon {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.theme-btn:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.theme-btn:active {
  transform: scale(0.92);
}
</style>