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
        error.response?.data?.message || t("components.searchGenres.getGenres"),
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
            ? 'components.searchGenres.loading'
            : 'components.searchGenres.genres',
        )
      "
      :maxSelectedLabels="99"
      class="w-full multiselect-expandable"
      @change="
        emit(
          'filterGenres',
          selectedGenres?.map((g) => g.slug),
        )
      "
    />
  </div>
</template>