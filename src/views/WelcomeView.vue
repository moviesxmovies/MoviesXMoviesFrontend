<script setup lang="ts">
import LangComponent from "@/components/layout/langComponent.vue";
</script>

<template>
  <div class="bg-primary">
    <h1 class="text-5xl">{{ $t("home.welcome") }}</h1>
    <LangComponent />
  </div>
</template>
