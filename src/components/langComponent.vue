<script setup lang="ts">
import { ref } from "vue";
import Select from "primevue/select";
import { useLangStore } from "@/stores/langStore";
import { availableCountries } from "@/types";

const langStore = useLangStore();
const selectedCountry = ref<{ label: string; value: string } | null>(
  langStore.language
    ? {
        label: langStore.language.toUpperCase(),
        value: langStore.language,
      }
    : null,
);
const countries = ref(availableCountries);

const getFlagUrl = (label: string) =>
  `https://flagcdn.com/w20/${label.toLowerCase()}.png`;
</script>

<template>
  <div class="card flex justify-center p-4 max-w-40">
    <Select
      v-model="selectedCountry"
      :options="countries"
      optionLabel="label"
      :placeholder="$t('components.selectLanguage')"
      class="w-full md:w-64 custom-select"
      @change="langStore.changeLanguage(selectedCountry?.value || 'en')"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center gap-3">
          <img
            :alt="slotProps.value.label"
            :src="getFlagUrl(slotProps.value.label)"
            class="rounded-sm shadow-sm"
            style="width: 20px"
          />
        </div>
        <span v-else class="text-[#bcbbdd]">
          {{ slotProps.placeholder }}
        </span>
      </template>

      <template #option="{ option }">
        <div class="flex items-center gap-3 py-1">
          <img
            :alt="option.label"
            :src="getFlagUrl(option.label)"
            class="rounded-sm"
            style="width: 20px"
          />
          <span>{{ option.label }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>
