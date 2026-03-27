<script setup lang="ts">
import { ref } from "vue";
import Select from "primevue/select";
import { useLangStore } from "@/stores/langStore";
import { availableCountries } from "@/types";

const langStore = useLangStore();
const selectedCountry = ref<{ label: string; value: string } | null>(
  langStore.language
    ? { label: langStore.language.toUpperCase(), value: langStore.language }
    : null,
);


const countries = ref(availableCountries);
const getFlagUrl = (label: string) => {
  return `https://flagcdn.com/w20/${label === 'EN' ? 'us' : label.toLocaleLowerCase()}.png`;
}

</script>

<template>
  <Select v-model="selectedCountry" :options="countries" optionLabel="label"
    :placeholder="$t('components.selectLanguage')" class="lang-select"
    @change="langStore.changeLanguage(selectedCountry?.value || 'en')">
    <template #value="slotProps">
      <div v-if="slotProps.value" class="lang-value">
        <img :alt="slotProps.value.label" :src="getFlagUrl(slotProps.value.label)" class="lang-flag" />
        <span class="lang-label">{{ slotProps.value.label }}</span>
      </div>
      <span v-else class="lang-placeholder">
        {{ slotProps.placeholder }}
      </span>
    </template>

    <template #option="{ option }">
      <div class="lang-option">
        <img :alt="option.label" :src="getFlagUrl(option.label)" class="lang-flag" />
        <span>{{ option.label }}</span>
      </div>
    </template>
  </Select>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

.lang-select {
  width: auto !important;
  min-width: 0 !important;
  flex-shrink: 0;
  height: 2.5rem;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  padding: 10px;
  background-color: color-mix(in srgb, var(--text) 15%, transparent);
  border: 0.5px solid color-mix(in srgb, var(--text) 15%, transparent)
}

.lang-select :hover {
  border-color: var(--primary);
}


/* Override PrimeVue Select to match nav button style */

.lang-select :deep(.p-select:hover) {
  background: var(--secondary);
  border-color: var(--primary);
}

.lang-select :deep(.p-select-label) {
  padding: 0;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.lang-select :deep(.p-select-dropdown) {
  display: none;
}

.lang-select :deep(.p-select-overlay) {
  background: var(--background);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(47, 39, 206, 0.1);
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  margin-top: 4px;
}

.lang-select :deep(.p-select-option) {
  color: var(--text);
  font-size: 0.875rem;
  padding: 0.5rem 0.9rem;
  transition: background 0.12s;
}

.lang-select :deep(.p-select-option:hover),
.lang-select :deep(.p-select-option.p-focus) {
  background: var(--secondary);
  color: var(--primary);
}

.lang-select :deep(.p-select-option.p-selected) {
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
  font-weight: 500;
}

.lang-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text);
  line-height: 1;
}

.lang-placeholder {
  font-size: 0.8rem;
  color: var(--secondary);
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
}

.lang-flag {
  width: 20px;
  height: auto;
  border-radius: 2px;
  display: block;
  flex-shrink: 0;
}
</style>