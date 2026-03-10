<script setup lang="ts">
import { Button } from "primevue";
import { router } from "@/router";
import { useThemeStore } from '@/stores/themeStore';
import { onMounted } from 'vue';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadTheme();
});
</script>

<template>
  <div>
    <h1>{{ $t("notFound.title") }}</h1>
    <p>{{ $t("notFound.description") }}</p>
    <Button label="Go Home" @click="router.push('/home')">{{
      $t("notFound.linkText")
    }}</Button>
  </div>
</template>
