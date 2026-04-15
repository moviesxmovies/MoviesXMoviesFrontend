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
    :placeholder="$t('components.selectLanguage')" class="lang-select" appendTo="self"
    @change="langStore.changeLanguage(selectedCountry?.value || 'en')">
    <template #value="slotProps">
      <div v-if="slotProps.value" class="lang-value">
        <img :alt="slotProps.value.label" :src="getFlagUrl(slotProps.value.label)" class="lang-flag" />
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
  background: color-mix(in srgb, var(--text) 8%, transparent) !important;
  border: 0.5px solid rgba(47, 39, 206, 0.15) !important;
  border-radius: 8px !important;
  height: 2.5rem !important;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.lang-select:hover {
  border-color: var(--primary) !important;
  background: color-mix(in srgb, var(--text) 12%, transparent) !important;
}

.lang-select :deep(.p-select-dropdown) {
  width: 2rem;
  color: var(--text);
  opacity: 0.5;
}

.lang-select :deep(.p-select-label) {
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.lang-select :deep(.p-select-overlay) {
  background: var(--background) !important;
  border: 0.5px solid rgba(47, 39, 206, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  margin-top: 8px;
  overflow: hidden;
}

.lang-select :deep(.p-select-option) {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  color: var(--text);
  transition: all 0.1s;
}

.lang-select :deep(.p-select-option.p-focus) {
  background: var(--secondary) !important;
  color: var(--primary) !important;
}

.lang-select :deep(.p-select-option-selected) {
  background: color-mix(in srgb, var(--text) 8%, transparent) !important;
  color: var(--text) !important;
}

.lang-flag {
  width: 18px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  margin-right: 8px;
  filter: saturate(0.8);
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