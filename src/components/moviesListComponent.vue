<script lang="ts" setup>
import { api } from "@/composables/useAPI";
import { useDate } from "@/composables/useDate";
import type { MovieList } from "@/types";
import { goToMovieList } from "@/utils/goTo";
import { Skeleton, useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{
  movieList: MovieList;
}>();
const toast = useToast();
const { formatRelativeTime } = useDate();
const privacyConfig: Record<string, { icon: string; class: string }> = {
  P: { icon: "pi pi-globe", class: "badge-public" },
  R: { icon: "pi pi-lock", class: "badge-private" },
  F: { icon: "pi pi-users", class: "badge-friends" },
};
const movieCovers = ref<{ src: string; alt: string; loading: boolean }[]>([]);

const privacy = privacyConfig[props.movieList.privacity] ?? privacyConfig["R"];

const navigateMovieList = async () => {
  try {
    const { data } = await api.get(props.movieList.user);
    goToMovieList(data.username, props.movieList.slug);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("error"),
      detail:
        error.response?.data?.message || t("components.movieList.errorDetail"),
    });
  }
};

const loadMovieCovers = async () => {
  const covers = await Promise.all(
    props.movieList.movies.slice(0, 4).map(async (movie) => {
      try {
        const { data } = await api.get(movie);
        return { src: data.cover, alt: data.title, loading: true };
      } catch {
        return null;
      }
    })
  );
  movieCovers.value = covers.filter((cover): cover is { src: string; alt: string; loading: boolean } => cover !== null);
};

onMounted(() => {
  loadMovieCovers();
});
</script>
<template>
  <div class="movie-list" role="link" tabindex="0" @click="navigateMovieList" @keydown.enter="navigateMovieList">
    <div class="movie-list-preview" :class="'grid-' + movieCovers.length">
      <span class="privacy-badge" :class="privacy.class" v-if="privacy">
        <i :class="privacy.icon" aria-hidden="true" />
      </span>
      <div v-for="(movieCover, index) in movieCovers" :key="index" class="preview-item">
        <Skeleton v-if="movieCover.loading" class="preview-skeleton" />

        <img v-show="!movieCover.loading" :src="movieCover.src" :alt="movieCover.alt"
          @load="movieCover.loading = false" />
      </div>
      <div v-if="!movieCovers.length" class="preview-empty"><i class="pi pi-images" aria-hidden="true" /></div>
    </div>

    <div class="movie-list-content">
      <div class="movie-list-body">
        <span class="movie-list-name">{{ movieList.name }}</span>
        <p v-if="movieList.description" class="movie-list-description">
          {{ movieList.description }}
        </p>
      </div>

      <div class="movie-list-footer">
        <span class="movie-list-count">
          <i class="pi pi-images" aria-hidden="true" />
          {{ t("components.movieList.moviesCount", { count: movieList.movies.length }) }}
        </span>
        <span class="movie-list-date">{{ formatRelativeTime(movieList.updated_at) }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.movie-list {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s var(--ease), transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.movie-list:hover,
.movie-list:focus-visible {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lg);
}

.preview-skeleton {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}

.movie-list-preview {
  position: relative;
  aspect-ratio: 16 / 10;
  display: grid;
  gap: 2px;
  background: var(--surface-2);
}

.preview-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-subtle);
  font-size: 1.75rem;
}

.grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-3 .preview-item:nth-child(4) {
  grid-column: span 2;
}

.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.preview-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.privacy-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
}

.movie-list-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem 1rem;
  flex: 1;
}

.movie-list-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.movie-list-name {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  line-height: 1.25;
}

.movie-list-description {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-list-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.movie-list-count {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.movie-list-count i {
  font-size: 0.75rem;
  color: var(--text-subtle);
}

.movie-list-date {
  font-size: 0.8125rem;
  color: var(--text-subtle);
}
</style>
