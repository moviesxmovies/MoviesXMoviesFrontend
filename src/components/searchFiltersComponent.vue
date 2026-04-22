<script lang="ts" setup>
import { fetchGenres } from "@/repositories/genreRepository";
import { useLangStore } from "@/stores/langStore";
import type { Genre } from "@/types";
import { MultiSelect, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const langStore = useLangStore();
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
        error.response?.data?.message ||
        t("components.searchFilters.getGenres"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => langStore.language,
  async () => {
    await getGenres();
  },
  { immediate: true },
);
</script>

<template>
  <div class="genre">
    <MultiSelect
      v-model="selectedGenres"
      :loading="isLoading"
      display="chip"
      :options="genres"
      optionLabel="name"
      filter
      :placeholder="
        t(
          isLoading
            ? 'components.searchFilters.loading'
            : 'components.searchFilters.genres',
        )
      "
      :maxSelectedLabels="3"
      class="w-full md:w-80"
      @change="
        emit(
          'filterGenres',
          selectedGenres?.map((g) => g.slug),
        )
      "
    />
  </div>
</template>
