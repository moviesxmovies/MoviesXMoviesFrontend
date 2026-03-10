<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore';
import { onMounted } from 'vue';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadTheme();
});
</script>

<template>
    <h1 class="text-3xl font-bold">{{ $t('home.welcome') }}</h1>
</template>