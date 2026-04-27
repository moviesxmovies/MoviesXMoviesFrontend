<script lang="ts" setup>
import { fetchGenres } from "@/repositories/genreRepository";
import { useLangStore } from "@/stores/langStore";
import type { Genre } from "@/types";
import { MultiSelect, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const langStore = useLangStore();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const selectedGenres = ref<Genre[]>();
const genres = ref<Genre[]>();
const emit = defineEmits(["filterGenres"]);

const getGenres = async () => {
  isLoading.value = true;
  try {
    genres.value = await fetchGenres();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message || t("components.searchGenres.getGenresError"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  [() => route.query.genres, () => langStore.language],
  async () => {
    await getGenres();
    if (route.query.genres) {
      selectedGenres.value = genres.value?.filter((g: Genre) =>
        [route.query.genres].flat().includes(g.slug),
      );
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="genre">
    <MultiSelect v-model="selectedGenres" :loading="isLoading" :disabled="isLoading" display="chip" :appendTo="'self'"
      :options="genres" optionLabel="name" filter :placeholder="t(
        isLoading
          ? 'loading'
          : 'components.searchGenres.genres',
      )
        " :maxSelectedLabels="99" class="w-full multiselect-expandable" @change="
          emit(
            'filterGenres',
            selectedGenres?.map((g) => g.slug),
          )
          " />
  </div>
</template>

<style scoped>
:deep(.p-multiselect-overlay) {
  background: var(--background) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 1.25rem !important;
}

:deep(.p-multiselect-overlay .p-checkbox .p-checkbox-box) {
  background: var(--background) !important;
  border-color: color-mix(in srgb,
      var(--secondary) 40%,
      transparent) !important;
  border-radius: 6px !important;
}
:deep(.p-multiselect-overlay .p-checkbox .p-checkbox-box[data-p="checked"]) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  color: white !important;
}
:deep(.p-multiselect-filter) {
  background: color-mix(in srgb, var(--background) 95%, var(--text)) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 0.75rem !important;
  color: var(--text) !important;
}

:deep(.p-multiselect-filter:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-multiselect-option) {
  color: var(--text) !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease;
}

:deep(.p-multiselect-option:hover) {
  background: color-mix(in srgb, var(--primary) 10%, transparent) !important;
}

:deep(.p-multiselect-option.p-selected) {
  background: color-mix(in srgb, var(--primary) 15%, transparent) !important;
  color: var(--primary) !important;
}
</style>
