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
  <div class="movie-list" @click="navigateMovieList">
    <div class="movie-list-preview" :class="'grid-' + movieCovers.length">
      <div v-for="(movieCover, index) in movieCovers" :key="index" class="preview-item">
        <Skeleton v-if="movieCover.loading" class="preview-skeleton" />

        <img v-show="!movieCover.loading" :src="movieCover.src" :alt="movieCover.alt"
          @load="movieCover.loading = false" />
      </div>
      <div class="preview-overlay"></div>
    </div>

    <div class="movie-list-content">
      <div class="movie-list-header">
        <span class="privacy-badge" :class="privacy.class" v-if="privacy">
          <i :class="privacy.icon" />
        </span>
        <span class="movie-list-count">
          <i class="pi pi-images" style="font-size: 0.7rem" />
          {{ t("components.movieList.moviesCount", { count: movieList.movies.length }) }}
        </span>
      </div>

      <div class="movie-list-body">
        <span class="movie-list-name">{{ movieList.name }}</span>
        <p v-if="movieList.description" class="movie-list-description">
          {{ movieList.description }}
        </p>
      </div>

      <div class="movie-list-footer">
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
  border-radius: 1rem;
  border: 1px solid var(--secondary);
  background: var(--background);
  cursor: pointer;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-skeleton {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}

.movie-list:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.movie-list-preview {
  position: absolute;
  inset: 0;
  display: grid;
  gap: 1px;
  opacity: 0.3;
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

.grid-3 .preview-item:nth-child(3) {
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

.preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom,
      color-mix(in srgb, black 50%, transparent),
      var(--secondary));
}

.movie-list-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  height: 100%;
}

.movie-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.movie-list-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.movie-list-count {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text);
  background: var(--secondary);
  padding: 0.25rem 0.6rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.privacy-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
}

.badge-public {
  background: rgba(34, 197, 94, 0.2);
  color: #309153;
}

.badge-private {
  background: rgba(239, 68, 68, 0.2);
  color: #b73b3b;
}

.badge-friends {
  background: rgba(99, 102, 241, 0.2);
  color: #4d57bd;
}

.movie-list-description {
  font-size: 0.75rem;
  color: var(--gray);
  margin-top: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-list-date {
  font-size: 0.65rem;
  color: var(--gray);
  text-transform: capitalize;
}
</style>