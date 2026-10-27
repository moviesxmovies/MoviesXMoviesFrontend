<script setup lang="ts">
import { ref, watch } from "vue";
import Select from "primevue/select";
import { useLangStore } from "@/stores/langStore";
import { availableCountries } from "@/types";

const langStore = useLangStore();
const getCountryObject = (lang: string) => ({
  label: lang.toUpperCase(),
  value: lang
});
const selectedCountry = ref<{ label: string; value: string } | null>(
  langStore.language ? getCountryObject(langStore.language) : null
);


const countries = ref(availableCountries);
const getFlagUrl = (label: string) => {
  return `https://flagcdn.com/w20/${label === 'EN' ? 'us' : label.toLocaleLowerCase()}.png`;
}

watch(() => langStore.language, (newLang) => {
  if (newLang) {
    selectedCountry.value = getCountryObject(newLang);
  }
});
</script>

<template>
  <Select v-model="selectedCountry" :options="countries" optionLabel="label"
    :placeholder="$t('components.selectLanguage')" class="lang-select" appendTo="self" :aria-label="$t('components.selectLanguage')"
    @change="langStore.changeLanguage(selectedCountry?.value || 'en')">
    <template #value="slotProps">
      <div v-if="slotProps.value" class="lang-value">
        <img alt="" :src="getFlagUrl(slotProps.value.label)" class="lang-flag" />
        <span class="lang-code">{{ slotProps.value.label }}</span>
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
.lang-select {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-md) !important;
  height: 2.5rem !important;
  box-shadow: none !important;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  font-family: var(--font-sans);
}

.lang-select:hover {
  border-color: var(--primary) !important;
  background: var(--surface-hover) !important;
}

.lang-select :deep(.p-select-dropdown) {
  width: 2rem;
  color: var(--text-subtle);
}

.lang-select :deep(.p-select-label) {
  padding: 0 0.25rem 0 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.lang-value {
  display: flex;
  align-items: center;
}

.lang-code {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
}

.lang-select :deep(.p-select-overlay) {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
  margin-top: 8px;
  padding: 4px;
  overflow: hidden;
}

.lang-select :deep(.p-select-option) {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  color: var(--text);
  transition: background-color 0.1s;
}

.lang-select :deep(.p-select-option.p-focus) {
  background: var(--primary-soft) !important;
  color: var(--primary) !important;
}

.lang-select :deep(.p-select-option-selected) {
  background: var(--surface-2) !important;
  color: var(--text) !important;
  font-weight: 600;
}

.lang-flag {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  margin-right: 8px;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 12%, transparent);
}

.lang-option {
  display: flex;
  align-items: center;
}

@media (max-width: 640px) {
  .lang-select {
    width: 100% !important;
    min-width: 0 !important;
    display: flex !important;
  }

  .lang-select :deep(.p-select-label) {
    padding: 0 0.5rem !important;
    justify-content: center;
  }

  .lang-select :deep(.p-select-dropdown) {
    width: auto !important;
    margin-left: 4px;
  }
}
</style>
