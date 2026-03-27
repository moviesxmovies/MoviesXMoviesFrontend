<template>
  
  <Toast />
  <Navbar />

  <RouterView />
</template>

<script setup lang="ts">

import { RouterView } from 'vue-router'
import Toast from 'primevue/toast';
import Navbar from './components/navbar.vue';
</script>
