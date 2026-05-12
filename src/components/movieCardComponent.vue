<script lang="ts" setup>
import { useDate } from "@/composables/useDate";
import type { Movie } from "@/types";
import { goToMovie } from "@/utils/goTo";
import { Skeleton } from "primevue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { formatRelativeTime } = useDate();
const props = defineProps<{
  loading?: boolean;
  movie: Movie;
  delete?: boolean;
}>();

const emit = defineEmits<{
  (e: "removeMovie", slug: string): void;
}>();
</script>

<template>
  <div v-if="loading" class="movie-card skeleton">
    <Skeleton height="auto" class="poster-skeleton" border-radius="0" />
    <div class="movie-info">
      <Skeleton width="80%" height="0.7rem" border-radius="4px" class="mb-2" />
      <Skeleton width="40%" height="0.65rem" border-radius="4px" />
    </div>
  </div>

  <template v-else>
    <div class="movie-card-container">
      <button
        v-if="delete"
        class="delete-btn"
        @click.stop="emit('removeMovie', movie.slug)"
        :aria-label="$t('actions.delete')"
      >
        <i class="pi pi-trash" />
      </button>

      <div class="movie-card" @click="goToMovie(movie.slug)">
        <div class="movie-poster-wrap">
          <img :src="movie.cover" :alt="movie.title" class="movie-poster" />
        </div>
        <div class="movie-info">
          <p class="movie-title">{{ movie.title }}</p>
          <p class="movie-year">{{ formatRelativeTime(movie.release_date) }}</p>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.movie-card-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6); /* Slate muy oscuro con transparencia */
  backdrop-filter: blur(8px);
  color: #f87171; /* Rojo suave elegante */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.delete-btn i {
  font-size: 0.9rem;
}

.movie-card {
  height: 100%;
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

.movie-card:hover .movie-poster {
  transform: scale(1.08);
  filter: brightness(0.9);
}

.movie-poster-wrap {
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  flex-shrink: 0;
}

.movie-poster {
  width: 100%;
  height: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
  transition: transform 0.5s;
}

.movie-info {
  padding: 0.6rem 0.75rem;
  height: 4.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: inherit;
}

.movie-title {
  font-size: 0.7rem;
  font-weight: 700;
}

.movie-year {
  font-size: 0.65rem;
  color: var(--gray);
  font-weight: 500;
  margin: 0;
}

.movie-card.skeleton {
  height: 100%;
  cursor: default;
  pointer-events: none;
}

.poster-skeleton {
  width: 100%;
  aspect-ratio: 2 / 3;
}
</style>
