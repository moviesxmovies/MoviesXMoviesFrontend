<script lang="ts" setup>
import { fetchGenres } from "@/repositories/genreRepository";
import { useLangStore } from "@/stores/langStore";
import type { Genre } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import MultiSelectComponent from "./multiSelectComponent.vue";

const { t } = useI18n();
const langStore = useLangStore();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const selectedGenres = ref<Genre[]>();
const genres = ref<Genre[]>();
const emit = defineEmits(["filterGenres"]);
const message = t("components.searchGenres.genres");

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
        t("components.searchGenres.getGenresError"),
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
    } else {
      selectedGenres.value = [];
    }
  },
  { immediate: true },
);
</script>

<template>
  <MultiSelectComponent
    :message="message"
    :isLoading="isLoading"
    :items="genres as Genre[]"
    v-model="selectedGenres as Genre[]"
    @change="
      emit(
        'filterGenres',
        selectedGenres?.map((g) => g.slug),
      )
    "
  />
</template>
