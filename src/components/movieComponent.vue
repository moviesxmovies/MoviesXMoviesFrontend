<script lang="ts" setup>
import type { Movie } from "@/types";
import { Skeleton } from "primevue";
import { computed } from "vue";

const props = defineProps<{
  movie: Movie;
  loading: boolean;
}>();
const coverStyle = computed(() => ({
  '--cover-url': `url('${props.movie.cover}')`,
}));
</script>

<template>
  <div class="movie-card flex items-center justify-center" :style="coverStyle">

    <div class="card-wrapper">
      <div class="poster-frame relative w-full max-w-sm aspect-[2/3] rounded-t-xl overflow-hidden flex flex-col group">
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

          <div class="poster-info">
            <div v-if="movie.platforms?.length" class="poster-platforms">
              <img v-for="platform in movie.platforms" :key="platform.id" :src="platform.image" :alt="platform.name"
                :title="platform.name" class="poster-platform" draggable="false" />
            </div>
            <h2 class="poster-title">{{ movie.title }}</h2>
            <p class="poster-meta">
              <span v-if="movie.release_date">{{ movie.release_date?.slice(0, 4) }}</span>
              <template v-for="genre in movie.genres" :key="genre.id">
                <span class="poster-dot" aria-hidden="true">·</span>
                <span>{{ genre.name }}</span>
              </template>
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  font-family: var(--font-sans);
  position: relative;
}

.card-wrapper {
  position: relative;
  width: 100%;
  max-width: 24rem;
}

.poster-frame {
  background: #121211;
}

/* Gradiente inferior fijo (siempre oscuro) para garantizar contraste del texto blanco */
.poster-info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 6rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: linear-gradient(to top, rgba(12, 12, 11, 0.97) 0%, rgba(12, 12, 11, 0.9) 50%, rgba(12, 12, 11, 0) 100%);
  color: #ffffff;
}

.poster-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1.15;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  text-wrap: balance;
}

.poster-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.86);
}

.poster-dot {
  color: rgba(255, 255, 255, 0.6);
}

.poster-platforms {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.poster-platform {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-md);
  object-fit: cover;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.card-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--cover-url);
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  opacity: 0.32;
  contain: paint;
  pointer-events: none;
  z-index: -1;
  border-radius: var(--radius-xl);
  transition: opacity 0.4s var(--ease);
}

.z-50 .card-wrapper::before {
  opacity: 0;
}
</style>
