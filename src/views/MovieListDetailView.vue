<script lang="ts" setup>
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import { api } from "@/composables/useAPI";
import { useDate } from "@/composables/useDate";
import {
  getMovieList,
  movieSearchingInList,
  removeMovieFromList,
} from "@/repositories/listRepository";
import {
  type Pagination,
  type Movie,
  type MovieList,
  type User,
} from "@/types";
import { ConfirmDialog, Skeleton, useConfirm, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const search = ref("");
const movieList = ref<MovieList>({} as MovieList);
const user = ref<User>({} as User);
const movies = ref<Pagination<Movie>>({} as Pagination<Movie>);
const loading = ref(false);

const { formatRelativeTime } = useDate();
const privacyConfig: Record<string, { icon: string; class: string }> = {
  P: { icon: "pi pi-globe", class: "badge-public" },
  R: { icon: "pi pi-lock", class: "badge-private" },
  F: { icon: "pi pi-users", class: "badge-friends" },
};

const privacy = ref<{ icon: string; class: string } | undefined>(
  privacyConfig["R"],
);

const fetchMovieList = async () => {
  try {
    movieList.value = await getMovieList(
      route.params.user as string,
      route.params.slug as string,
    );
    privacy.value = privacyConfig[movieList.value.privacity];
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("list.getListError"),
    });
  }
};

const fetchUser = async () => {
  try {
    const { data } = await api.get(movieList.value.user);
    user.value = data;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("user.no_user"),
    });
  }
};

const fetchMovies = async (page?: number) => {
  try {
    movies.value = await movieSearchingInList(
      route.params.user as string,
      route.params.slug as string,
      search.value,
      page,
    );
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("list.getMoviesError"),
    });
  }
};

const updateRoute = (page: number) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      page,
    },
  });
};

const removeMovieModal = async (slug: string) => {
  confirm.require({
    message: t("list.confirmRemoveMovie", [slug]),
    header: t("list.confirmation"),
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: t("cancel"),
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: t("remove"),
    },
    accept: () => {
      removeMovie(slug);
    },
  });
};

const removeMovie = async (slug: string) => {
  try {
    await removeMovieFromList(
      route.params.user as string,
      route.params.slug as string,
      slug,
    );
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: t("list.movieRemoved"),
    });
    fetchMovies(movies.value.current_page);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("list.removeMovieError"),
    });
  }
};

watch(
  () => [route.params.user, route.params.slug],
  async () => {
    loading.value = true;
    await Promise.all([
      await fetchMovieList(),
      fetchUser(),
      fetchMovies(Number(route.query.page)),
    ]);
    loading.value = false;
  },
  { immediate: true },
);

watch(
  () => route.query.page,
  (newPage) => {
    if (newPage) {
      updateRoute(Number(newPage));
    }
  },
);
</script>

<template>
  <div class="page">
    <template v-if="loading">
      <div class="header-skeleton">
        <Skeleton shape="circle" size="10rem" class="mr-4" />
        <div class="flex-1">
          <Skeleton width="40%" height="2.5rem" class="mb-2" />
          <Skeleton width="60%" height="1.5rem" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="movie-list-info">
        <div class="info-card">
          <!-- User -->
          <div class="author-section">
            <div class="avatar-wrapper">
              <img
                :src="user.picture"
                :alt="user.username"
                class="author-img"
              />
            </div>
            <div class="author-meta">
              <span class="label">{{ t("list.createdBy") }}</span>
              <p class="username">@{{ user.username }}</p>
            </div>
          </div>

          <!-- Only in desktop -->
          <div class="divider"></div>

          <!-- List info -->
          <div class="list-content">
            <div class="list-header">
              <h1 class="list-name">{{ movieList.name }}</h1>
              <span
                v-if="privacy"
                class="privacy-badge"
                :class="privacy.class"
                v-tooltip="movieList.privacity"
              >
                <i :class="privacy.icon" />
              </span>
            </div>

            <p class="list-description">
              {{ movieList.description || t("list.noDescription") }}
            </p>

            <div class="list-footer-stats">
              <div class="stat">
                <i class="pi pi-video" />
                <span>
                  {{ t("list.moviesCount", movieList.movies.length) }}</span
                >
              </div>
              <div class="stat">
                <i class="pi pi-calendar" />
                <span>{{
                  t("list.updated", [formatRelativeTime(movieList.updated_at)])
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="movies-grid">
        <ConfirmDialog appendTo="self" />
        <MovieCardComponent
          v-for="movie in movies.results"
          :key="movie.id"
          :movie="movie"
          :loading="loading"
          :delete="true"
          data-testid="movie-card"
          @remove-movie="removeMovieModal"
        />
      </div>

      <div v-if="!loading && movies.total_pages > 1">
        <PaginationComponent
          data-testid="PaginationComponent"
          :data-total="movies.total_pages"
          :data-current="movies.current_page"
          :total_pages="movies.total_pages"
          :current_page="movies.current_page"
          @change-page="updateRoute"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
}

.movie-list-info {
  margin-bottom: 3rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  background: var(--secondary);
  border-radius: 1.25rem;
  padding: 2rem;
  gap: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
}

@media (min-width: 768px) {
  .info-card {
    flex-direction: row;
    align-items: stretch;
  }
}

.author-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  padding: 5px;
  background: var(--primary);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.author-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--secondary);
}

.author-meta .label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-bottom: 0.25rem;
}

.username {
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.4);
  margin: 0 1rem;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.list-name {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
  color: var(--text);
  line-height: 1.2;
}

.list-description {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 1.5rem;
  max-width: 800px;
}

.list-footer-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.stat i {
  color: var(--primary);
}

.privacy-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
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

.header-skeleton {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--secondary);
  border-radius: 1.25rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  min-height: 200px;
}

@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .movies-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

:deep(.p-confirmdialog) {
  background: color-mix(in srgb, var(--secondary) 80%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  max-width: 300px;
}

@media (min-width: 640px) {
  :deep(.p-confirmdialog) {
    max-width: 450px;
  }
}

@media (min-width: 1024px) {
  :deep(.p-confirmdialog) {
    max-width: 600px;
  }
}

/* Dialog Header */
:deep(.p-dialog-header) {
  background: transparent;
  padding: 1.5rem 1.5rem 0.5rem;
  color: var(--text);
}

:deep(.p-dialog-title) {
  font-weight: 800;
  font-size: 1.25rem;
}

/* Dialog message and icon */
:deep(.p-dialog-content) {
  background: transparent;
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

:deep(.p-confirmdialog-icon) {
  font-size: 2rem;
  color: #b73b3b; 
}

:deep(.p-confirmdialog-message) {
  color: var(--text);
  line-height: 1.5;
  font-size: 1rem;
}

:deep(.p-dialog-footer) {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.p-dialog-footer button) {
  border-radius: 0.75rem;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

/* Cancel button */
:deep(.p-button-secondary.p-button-outlined) {
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: var(--text) !important;
}

:deep(.p-button-secondary.p-button-outlined:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Close button (x) */
:deep(.p-dialog-header-icons .p-dialog-header-close) {
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transition: all 0.2s;
}
</style>
