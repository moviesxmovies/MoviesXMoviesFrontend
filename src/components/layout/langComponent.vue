<script setup lang="ts">
import { useLangStore } from '@/stores/langStore';
import { Button } from 'primevue';
import { computed } from 'vue';

const langStore = useLangStore()
const langs = ['en', 'es'];
const currentLang = computed(() => langStore.language);
</script>

<template>
    <div class="flex gap-4">
        <Button
            v-for="lang in langs"
            :key="lang"
            :label="lang.toUpperCase()"
            :class="['p-button-text', currentLang === lang ? 'p-button-secondary' : '']"
            @click="langStore.setLanguage(lang)"
        />
    </div>
</template>