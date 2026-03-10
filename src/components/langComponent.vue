<script setup lang="ts">
import { ref } from "vue";
import Select from "primevue/select";
import { useLangStore } from "@/stores/langStore";

const langStore = useLangStore();
const selectedCountry = ref<string | null>(null);
const countries = ref<string[]>(["ES", "US", "FR", "DE"]);

const getFlagUrl = (lang: string) => `https://flagcdn.com/w20/${lang.toLowerCase()}.png`;
</script>

<template>
  <div class="card flex justify-center p-4 max-w-40">
    <Select
      v-model="selectedCountry"
      :options="countries"
      optionLabel="name"
      :placeholder="$t('components.selectLanguage')"
      class="w-full md:w-64 custom-select"
      @change="langStore.setLanguage(selectedCountry || 'US')"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center gap-3">
          <img
            :alt="slotProps.value"
            :src="getFlagUrl(slotProps.value)"
            class="rounded-sm shadow-sm"
            style="width: 20px"
          />
          <span class="text-white">{{ slotProps.value }}</span>
        </div>
        <span v-else class="text-[#bcbbdd]">
          {{ slotProps.placeholder }}
        </span>
      </template>

      <template #option="slotProps">
        <div class="flex items-center gap-3 py-1">
          <img
            :alt="slotProps.option"
            :src="getFlagUrl(slotProps.option)"
            class="rounded-sm"
            style="width: 20px"
          />
          <span>{{ slotProps.option }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>
