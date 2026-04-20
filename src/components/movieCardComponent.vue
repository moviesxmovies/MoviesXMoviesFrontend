<script lang="ts" setup>
import type { Movie } from "@/types";

const props = defineProps<{
  movie: Movie;
}>();
</script>

<template>
  <div class="movie-card">
    <div class="movie-poster-wrap">
      <img :src="movie.cover" :alt="movie.title" class="movie-poster" />
    </div>
    <div class="movie-info">
      <p class="movie-title">{{ movie.title }}</p>
      <p class="movie-year">{{ movie.release_date }}</p>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--secondary);
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.movie-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.movie-poster-wrap {
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
  transition: transform 0.5s;
}

.movie-card:hover .movie-poster {
  transform: scale(1.08);
}

.movie-info {
  padding: 0.6rem 0.75rem;
}

.movie-title {
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 0.2rem;
  line-height: 1.3;
}

.movie-year {
  font-size: 0.65rem;
  color: var(--gray);
  font-weight: 500;
  margin: 0;
}
</style>
