<script lang="ts" setup>
import type { Movie } from "@/types";
import { Skeleton } from "primevue";

const props = defineProps<{
  movie: Movie;
  loading: boolean;
}>();
</script>

<template>
  <div class="movie-card min-h-screen flex items-center justify-center p-6">
    <div
      class="relative w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl flex flex-col group"
      style="background: #0a0a0a"
    >
      <template v-if="loading">
        <Skeleton width="100%" height="100%" class="absolute inset-0" />

        <div class="relative z-10 p-4 flex justify-center">
          <Skeleton width="70%" height="1.75rem" borderRadius="8px" />
        </div>

        <div
          class="absolute inset-x-0 bottom-0 h-1/3 flex flex-col justify-end p-6 gap-3"
        >
          <Skeleton width="50%" height="1rem" class="mx-auto" />
          <Skeleton width="80%" height="1rem" class="mx-auto" />
        </div>
      </template>

      <template v-else>
        <img
          :src="movie.cover"
          :alt="movie.title"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <div
          class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"
        ></div>

        <div class="relative z-10 p-4 text-center">
          <span
            class="text-xl font-bold tracking-tight text-white drop-shadow-md"
          >
            {{ movie.title }}
          </span>
        </div>

        <div
          class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-6 gap-3"
        >
          <p class="text-[14px] text-center font-bold text-white uppercase">
            {{ movie.platforms.map((p) => p.slug).join(" | ") }}
          </p>
          <p class="text-[14px] text-center font-bold text-white uppercase">
            {{ movie.genres.map((g) => g.slug).join(" | ") }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;700&display=swap");

.movie-card {
  font-family: "DM Sans", sans-serif;
}
</style>
