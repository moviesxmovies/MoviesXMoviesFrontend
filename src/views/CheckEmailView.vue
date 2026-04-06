<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="card">
    <h2>{{ $t("checkEmail.title") }}</h2>
    <p>{{ $t("checkEmail.description") }}</p>
    <button @click="router.push('/login')">
      {{ $t("checkEmail.button") }}
    </button>
  </div>
</template>
