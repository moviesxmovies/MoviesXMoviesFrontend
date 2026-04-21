<template>

  <CustomToast :life="3000" />
  <Navbar />

  <RouterView />
</template>

<script setup lang="ts">

import { RouterView } from 'vue-router'
import Navbar from './components/navbar.vue';
import CustomToast from './components/customToast.vue';
</script>