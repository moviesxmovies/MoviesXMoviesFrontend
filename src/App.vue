<template>
  <CustomToast :life="3000" />
  <Navbar />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/navbar.vue';
import CustomToast from './components/customToast.vue';
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const { locale } = useI18n()

watch(locale, (lang) => {
  document.documentElement.lang = lang
}, { immediate: true })
</script>