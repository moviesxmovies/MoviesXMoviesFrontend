<script setup lang="ts">
import { Button } from "primevue";
import { useRouter } from "vue-router";
import Card from "@/components/appCardComponent.vue";
import LangComponent from "@/components/langComponent.vue";
import ThemeComponent from "@/components/themeComponent.vue";
import { useThemeStore } from "@/stores/themeStore";
import { onMounted } from "vue";

const router = useRouter();
const themeStore = useThemeStore();

onMounted(() => {
  themeStore.loadTheme();
});
</script>

<template>
  <div class="bg-primary mb-16">
    <h1 class="text-5xl">{{ $t("home.welcome") }}</h1>
  </div>
  <LangComponent />
  <ThemeComponent />
  <div class="flex m-auto justify-center max-w-md">
    <Card class="flex m-auto justify-center">
      <Button @click="router.push('/login')">{{ $t("home.linkText") }}</Button>
    </Card>
  </div>
</template>
