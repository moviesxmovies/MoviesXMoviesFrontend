<script lang="ts" setup>
import { ToggleSwitch } from 'primevue';
import { ref } from 'vue';

const checked = ref(false);
</script>

<template>
  <ToggleSwitch v-model="checked">
    <template #handle="{ checked }">
        <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]" />
    </template>
</ToggleSwitch>
</template>