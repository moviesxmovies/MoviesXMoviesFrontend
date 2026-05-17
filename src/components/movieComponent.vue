<script lang="ts" setup>
import type { Movie } from "@/types";
import { Skeleton } from "primevue";
import { Transition } from "vue";

const props = defineProps<{
  movie: Movie;
  loading: boolean;
}>();
</script>

<template>
  <div class="movie-card flex items-center justify-center">
    <div v-show="!loading" class="absolute inset-0 -z-1 flex items-center justify-center">
      <Transition name="fade-glow">
        <img :key="movie.cover" :src="movie.cover" 80px :alt="movie.title" draggable="false"
          class="w-full max-w-sm aspect-[2/3] object-cover blur-[80px] scale-110 pointer-events-none transition-all duration-1000"
          aria-hidden="true" />
      </Transition>
    </div>

    <div class="relative w-full max-w-sm aspect-[2/3] rounded-t-2xl overflow-hidden flex flex-col group"
      style="background: #0a0a0a">
      <template v-if="loading">
        <Skeleton width="100%" height="100%" class="absolute inset-0" />

        <div class="relative p-4 flex justify-center">
          <Skeleton width="70%" height="1.75rem" borderRadius="8px" />
        </div>

        <div class="absolute inset-x-0 bottom-0 h-1/3 flex flex-col justify-end p-6 gap-3">
          <Skeleton width="50%" height="1rem" class="mx-auto" />
          <Skeleton width="80%" height="1rem" class="mx-auto" />
        </div>
      </template>

      <template v-else>
        <img decoding="async" loading="eager" draggable="false" :src="movie.cover" :alt="movie.title"
          class="absolute inset-0 w-full h-full object-cover" />

        <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"></div>

        <div class="relative p-4 text-center">
          <span class="text-xl font-bold tracking-tight text-white drop-shadow-md">
            {{ movie.title }}
          </span>
        </div>

        <div
          class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-6 gap-3">
          <div v-for="platform in movie.platforms" :key="platform.id">
            <image class="text-[14px] text-center font-bold text-white uppercase" :src="platform.image"
              :alt="platform.name" :title="platform.name" />
          </div>
          <p class="text-[14px] text-center font-bold text-white uppercase">
            {{movie.genres.map((g) => g.name).join(" | ")}}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

.movie-card {
  font-family: "DM Sans", sans-serif;
}

.fade-glow-enter-active,
.fade-glow-leave-active {
  transition: opacity 1.5s ease;
  position: absolute;
  contain: paint;
}

.fade-glow-enter-from,
.fade-glow-leave-to {
  opacity: 0;
}
</style>
