<script lang="ts" setup>
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import { api } from "@/composables/useAPI";
import { useDate } from "@/composables/useDate";
import {
  deleteList,
  getMovieList,
  movieSearchingInList,
  removeMovieFromList,
} from "@/repositories/listRepository";
import { useAuthStore } from "@/stores/authStore";
import {
  type Pagination,
  type Movie,
  type MovieList,
  type User,
} from "@/types";
import { Dialog, Skeleton } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();
const search = ref("");
const movieList = ref<MovieList>({} as MovieList);
const user = ref<User>({} as User);
const movies = ref<Pagination<Movie>>({} as Pagination<Movie>);
const loading = ref(false);

const confirmDeleteListVisible = ref(false);
const confirmDeleteMovieVisible = ref(false);
const movieToDelete = ref<string | null>(null);

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
    console.error(error);
  }
};

const fetchUser = async () => {
  try {
    const { data } = await api.get(movieList.value.user);
    user.value = data;
  } catch (error: any) {
    console.error(error);
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
    console.error(error);
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

const removeMovieModal = (slug: string) => {
  movieToDelete.value = slug;
  confirmDeleteMovieVisible.value = true;
};

const removeListModal = () => {
  confirmDeleteListVisible.value = true;
};

const removeMovieConfirm = async () => {
  if (!movieToDelete.value) return;
  confirmDeleteMovieVisible.value = false;
  try {
    await removeMovieFromList(
      route.params.user as string,
      route.params.slug as string,
      movieToDelete.value,
    );
    fetchMovies(movies.value.current_page);
  } catch (error: any) {
    console.error(error);
  } finally {
    movieToDelete.value = null;
  }
};

const removeListConfirm = async () => {
  if (!movieList.value.slug) return;
  confirmDeleteListVisible.value = false;
  try {
    await deleteList(user.value.username, movieList.value.slug);
    router.back();
  } catch (error: any) {
    console.error(error);
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
  <!-- CONFIRM DELETE MOVIE DIALOG -->
  <Dialog
    v-model:visible="confirmDeleteMovieVisible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :style="{ width: '90vw', maxWidth: '380px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)] pb-0' },
      title: { class: 'text-xl font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      footer: {
        class: 'bg-[var(--background)] border-t border-[var(--secondary)]',
      },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <template #header>
      <div class="confirm-header">
        <div class="confirm-icon">
          <i class="pi pi-trash" />
        </div>
        <div>
          <p class="confirm-title">{{ t("list.confirmation") }}</p>
        </div>
      </div>
    </template>

    <p class="confirm-body">
      {{ t("list.confirmRemoveMovie", [movieToDelete]) }}
    </p>

    <template #footer>
      <div class="footer-actions">
        <button class="btn-cancel" @click="confirmDeleteMovieVisible = false">
          {{ t("common.cancel") }}
        </button>
        <button class="btn-delete" @click="removeMovieConfirm">
          <i class="pi pi-trash" />
          <span>{{ t("remove") }}</span>
        </button>
      </div>
    </template>
  </Dialog>

  <!-- CONFIRM DELETE LIST DIALOG -->
  <Dialog
    v-model:visible="confirmDeleteListVisible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :style="{ width: '90vw', maxWidth: '380px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)] pb-0' },
      title: { class: 'text-xl font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      footer: {
        class: 'bg-[var(--background)] border-t border-[var(--secondary)]',
      },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <template #header>
      <div class="confirm-header">
        <div class="confirm-icon">
          <i class="pi pi-trash" />
        </div>
        <div>
          <p class="confirm-title">{{ t("list.confirmation") }}</p>
        </div>
      </div>
    </template>

    <p class="confirm-body">
      {{ t("list.confirmRemoveList", [movieList.slug]) }}
    </p>

    <template #footer>
      <div class="footer-actions">
        <button class="btn-cancel" @click="confirmDeleteListVisible = false">
          {{ t("common.cancel") }}
        </button>
        <button class="btn-delete" @click="removeListConfirm">
          <i class="pi pi-trash" />
          <span>{{ t("remove") }}</span>
        </button>
      </div>
    </template>
  </Dialog>

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
                  {{
                    t("list.moviesCount", movieList.movies?.length || 0)
                  }}</span
                >
              </div>
              <div class="stat">
                <i class="pi pi-calendar" />
                <span>{{
                  t("list.updated", [formatRelativeTime(movieList.updated_at)])
                }}</span>
              </div>
              <div v-if="user.username === authStore.user?.username">
                <button @click="removeListModal" class="btn-delete-list" data-testid="delete-list-btn">
                  Delete list
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="movies-grid">
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

.btn-delete-list {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--red);
  background: transparent;
  color: var(--red);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.1s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-delete-list:hover {
  background: var(--red);
  color: var(--background);
}

.btn-delete-list:active {
  transform: scale(0.97);
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

/* CONFIRM DIALOG */
.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--red) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
  color: var(--red);
  font-size: 1rem;
  flex-shrink: 0;
}

.confirm-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.confirm-body {
  font-size: 0.875rem;
  color: var(--gray);
  line-height: 1.6;
  margin: 0;
  padding: 0.25rem 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  width: 100%;
}

.btn-cancel {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--secondary) 60%, transparent);
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: color-mix(in srgb, var(--secondary) 15%, transparent);
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: var(--red);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}

.btn-delete:hover {
  opacity: 0.85;
}
</style>
