<script setup lang="ts">
import { Button, Card } from "primevue";
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <Card class="card">
    <template #title>{{ $t("checkEmail.title") }}</template>
    <template #content>
      <p>{{ $t("checkEmail.description") }}</p>
    </template>
    <template #footer>
      <Button @click="router.push('/login')">
        {{ $t("checkEmail.button") }}
      </Button>
    </template>
  </Card>
</template>
