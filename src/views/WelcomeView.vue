<script setup lang="ts">
import { Button } from "primevue";
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="bg-primary mb-16">
    <h1 class="text-5xl">{{ $t("home.welcome") }}</h1>
  </div>
  <div class="flex m-auto justify-center">
    <Button @click="router.push('/login')">{{ $t("home.linkText") }}</Button>
  </div>
</template>
