<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { getRecommendedMovies } from "@/repositories/movieRepository";
import type { Movie } from "@/types";
import MovieComponent from "@/components/movieComponent.vue";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import StarsComponent from "@/components/starsComponent.vue";
import { useLangStore } from "@/stores/langStore";
import ActionsComponent from "@/components/actionsComponent.vue";

const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const movies = ref<Movie[]>([] as Movie[]);
const movieIndex = ref(0);
const langStore = useLangStore();

const actualMovie = computed(() => {
  return movies.value.length > 0 ? movies.value[movieIndex.value] : null;
});

onMounted(async () => {
  await fetchMovies();
  prefetchImage(movieIndex.value);
});

const fetchMovies = async () => {
  if (loading.value) return;
  if (movies.value.length === 0) loading.value = true;
  try {
    movies.value = await getRecommendedMovies();
    movieIndex.value = 0;
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

const showNextRecommendedMovie = async () => {
  if (movies.value.length > movieIndex.value && !loading.value) {
    movieIndex.value++;
  }
  if (movies.value.length <= movieIndex.value + 1 && !loading.value) {
    await fetchMovies();
  }
};

const prefetchImage = (newIndex: number) => {
  const nextMovie = movies.value[newIndex + 1];
  if (nextMovie) {
    const img = new Image();
    img.src = nextMovie.cover;
  }
};

watch(movieIndex, (newIndex) => {
  prefetchImage(newIndex);
});

watch(
  () => langStore.language,
  async (newLang, oldLang) => {
    if (newLang !== oldLang) {
      movies.value = [];
      await fetchMovies();
    }
  },
);
</script>

<template>
  <div class="min-h-screen">
    <div v-if="loading || actualMovie" class="mt-30 relative overflow-visible">
      <div class="w-full max-w-sm m-auto rounded-2xl relative" id="mainSwipe">
        <MovieComponent
          :movie="actualMovie || ({} as Movie)"
          :loading="loading"
        />
        <ActionsComponent
          :loading="loading"
          :movieSlug="actualMovie?.slug || ''"
          @showNextMovie="showNextRecommendedMovie"
        />
      </div>
      <div class="flex justify-center mt-4">
        <StarsComponent
          id="stars"
          :loading="loading"
          :movieSlug="actualMovie?.slug || ''"
          @showNextMovie="showNextRecommendedMovie"
        />
      </div>
    </div>
    <div v-else>No movies found.</div>
  </div>
</template>

<style scoped>
#mainSwipe .animate-boarding {
  z-index: 1001;
}
</style>
