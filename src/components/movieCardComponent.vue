<script lang="ts" setup>
import { useDate } from "@/composables/useDate";
import type { Movie } from "@/types";
import { goToMovie } from "@/utils/goTo";
import { Skeleton } from "primevue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { formatRelativeTime } = useDate();
const props = defineProps<{
  loading?: boolean;
  movie: Movie;
  delete?: boolean;
}>();
const loadingImage = ref(true);

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
      <button v-if="delete" class="delete-btn" @click.stop="emit('removeMovie', movie.slug)"
        :aria-label="$t('actions.delete')">
        <i class="pi pi-trash" />
      </button>

      <div class="movie-card" role="link" tabindex="0" @click="goToMovie(movie.slug)"
        @keydown.enter="goToMovie(movie.slug)">
        <div class="movie-poster-wrap">
          <Skeleton v-if="loadingImage" class="movie-poster-skeleton" border-radius="0" />

          <img v-show="!loadingImage" :src="movie.cover" :alt="movie.title" class="movie-poster"
            @load="loadingImage = false" />
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
  z-index: 1;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(12, 12, 11, 0.72);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s var(--ease), transform 0.15s var(--ease);
  box-shadow: var(--shadow-md);
}

.delete-btn:hover {
  background: var(--danger);
}

.delete-btn i {
  font-size: 0.875rem;
}

.movie-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.movie-card:hover,
.movie-card:focus-visible {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg);
}

.movie-card:hover .movie-poster {
}

.movie-poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
}

.movie-poster-skeleton {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s;
}

.movie-info {
  padding: 0.75rem 0.75rem 0.75rem;
  min-height: 4.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
}

.movie-title {
  font-size: 0.9375rem;
  line-height: 1.3;
  font-weight: 500;
  color: var(--text);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-year {
  font-size: 0.8125rem;
  color: var(--text-subtle);
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
