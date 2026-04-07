<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { getRecommendedMovies } from "@/repositories/movieRepository";
import type { Movie } from "@/types";
import MovieComponent from "@/components/movieComponent.vue";

const loading = ref(false);
const movies = ref<Movie[]>([] as Movie[]);

const firstMovie = computed(() => {
  return movies.value.length > 0 ? movies.value[0] : null;
});

onMounted(async () => {
  loading.value = true;
  movies.value = await getRecommendedMovies();
  console.log(movies.value);
  loading.value = false;
});
</script>

<template>
  <div class="p-4">
    <div v-if="loading">Loading...</div>
    <div v-else-if="movies.length > 0">
      <MovieComponent v-if="firstMovie" :movie="firstMovie" />
    </div>
    <div v-else>No movies found.</div>
  </div>
</template>
