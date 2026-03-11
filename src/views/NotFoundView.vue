<script setup lang="ts">
import { Button } from "primevue";
import { useRouter } from "vue-router";
const router = useRouter();
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
