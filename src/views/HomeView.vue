<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { getRecommendedMovies } from "@/repositories/movieRepository";
import type { Movie } from "@/types";
import MovieComponent from "@/components/movieComponent.vue";
import { Button, useToast } from "primevue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const movies = ref<Movie[]>([] as Movie[]);

const firstMovie = computed(() => {
  return movies.value.length > 0 ? movies.value[0] : null;
});

onMounted(async () => {
  await fetchMovies();
});

const fetchMovies = async () => {
  if (movies.value.length === 0) loading.value = true;
  try {
    const recommendedMovies = await getRecommendedMovies();
    movies.value.push(...recommendedMovies);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("toast.home.fetchMoviesError"),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const nextRecommendedMovie = async () => {
  if (movies.value.length > 0) {
    movies.value.shift();
  }
  if (movies.value.length === 1 && !loading.value) {
    await fetchMovies();
  }
};
</script>

<template>
  <div class="p-4">
    <div v-if="loading || firstMovie">
      <MovieComponent :movie="firstMovie || ({} as Movie)" :loading="loading" />
      <Button @click="nextRecommendedMovie">Next Movie</Button>
    </div>
    <div v-else>No movies found.</div>
  </div>
</template>
