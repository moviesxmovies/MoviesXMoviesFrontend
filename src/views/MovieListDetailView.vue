<script lang="ts" setup>
import CreateListDialog from "@/components/createListDialog.vue";
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
import { useLangStore } from "@/stores/langStore";
import {
  type Pagination,
  type Movie,
  type MovieList,
  type User,
} from "@/types";
import { goToMovieList, goToUser } from "@/utils/goTo";
import { computed } from "@vue/reactivity";
import { Dialog, Skeleton } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const langStore = useLangStore();
const { t } = useI18n();
const search = ref("");
const movieList = ref<MovieList>({} as MovieList);
const user = ref<User>({} as User);
const movies = ref<Pagination<Movie>>({} as Pagination<Movie>);
const loading = ref(false);
const loadingMovies = ref(false);
const loadingComputed = computed(() => loading.value || loadingMovies.value);

const confirmDeleteListVisible = ref(false);
const confirmDeleteMovieVisible = ref(false);
const createListDialogVisible = ref(false);
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
    router.push({ name: "NotFound" });
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
  loadingMovies.value = true;
  try {
    movies.value = await movieSearchingInList(
      route.params.user as string,
      route.params.slug as string,
      search.value || undefined,
      page,
    );
  } catch (error: any) {
    console.error(error);
  } finally {
    loadingMovies.value = false;
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

const handleReloadMovieList = async (slug: string) => {
  if (slug === movieList.value.slug) await fetchMovieList();
  else goToMovieList(user.value.username, slug);
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
    await reloadData();
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
    goToUser(user.value.username);
  } catch (error: any) {
    console.error(error);
  }
};

const reloadData = async () => {
  loading.value = true;
  await Promise.all([
    await fetchMovieList(),
    fetchUser(),
    fetchMovies(Number(route.query.page)),
  ]);
  loading.value = false;
};

watch(
  () => [route.params.user, route.params.slug],
  async () => {
    await reloadData();
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

watch(
  () => langStore.language,
  () => {
    fetchMovies(Number(route.query.page));
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
        <div class="confirm-icon" aria-hidden="true">
          <i class="pi pi-trash" />
        </div>
        <div>
          <p class="confirm-title">{{ t("list.confirmationMovie") }}</p>
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

  <!-- EDIT LIST DIALOG -->
  <CreateListDialog
    v-model:visible="createListDialogVisible"
    :movieList="movieList"
    @reloadMovieList="handleReloadMovieList"
  />

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
        <div class="confirm-icon" aria-hidden="true">
          <i class="pi pi-trash" />
        </div>
        <div>
          <p class="confirm-title">{{ t("list.confirmationList") }}</p>
        </div>
      </div>
    </template>

    <p class="confirm-body">
      {{ t("list.confirmDeleteList", [movieList.slug]) }}
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
      <div class="info-card skeleton-wrapper">
        <div class="author-section">
          <div class="avatar-wrapper">
            <Skeleton shape="circle" size="120px" />
          </div>
          <div
            class="author-meta"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
            "
          >
            <Skeleton width="4rem" height="0.75rem" />
            <Skeleton width="8rem" height="1.25rem" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="list-content">
          <div class="list-header">
            <Skeleton width="60%" height="2.5rem" />
            <Skeleton width="2.5rem" height="2.5rem" border-radius="0.75rem" />
          </div>

          <div class="mb-4">
            <Skeleton width="100%" height="1rem" class="mb-2" />
            <Skeleton width="80%" height="1rem" />
          </div>

          <div class="list-footer-stats">
            <Skeleton width="6rem" height="1rem" />
            <Skeleton width="8rem" height="1rem" />
            <Skeleton
              width="5rem"
              height="2rem"
              border-radius="999px"
              style="margin-left: auto"
            />
          </div>
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

          <div class="divider"></div>

          <!-- List info -->
          <div class="list-content">
            <div class="list-header">
              <h1 class="list-name">{{ movieList.name }}</h1>
              <span v-if="privacy" class="privacy-badge" :class="privacy.class">
                <i :class="privacy.icon" aria-hidden="true" />
              </span>
            </div>

            <p class="list-description">
              {{ movieList.description || t("list.noDescription") }}
            </p>

            <div class="list-footer-stats">
              <div class="stat">
                <i class="pi pi-video" />
                <span>{{
                  t("list.moviesCount", movieList.movies?.length || 0)
                }}</span>
              </div>
              <div class="stat">
                <i class="pi pi-calendar" />
                <span>{{
                  t("list.updated", [formatRelativeTime(movieList.updated_at)])
                }}</span>
              </div>
              <div
                v-if="user.username === authStore.user?.username"
                class="actions-wrapper"
              >
                <button
                  @click="createListDialogVisible = true"
                  class="btn-edit-list"
                  data-testid="edit-list-btn"
                >
                  <i class="pi pi-pencil" />
                  {{ t("common.edit") }}
                </button>
                <button
                  @click="removeListModal"
                  class="btn-delete-list"
                  data-testid="delete-list-btn"
                >
                  <i class="pi pi-trash" />
                  {{ t("common.delete") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!loadingComputed && movies.results?.length === 0"
        class="empty-list-container"
      >
        <div class="empty-card">
          <div class="icon-circle" aria-hidden="true">
            <i class="pi pi-video text-2xl" />
          </div>
          <h3 class="empty-title">
            {{ t("list.emptyTitle") }}
          </h3>
          <div
            v-if="user.username === authStore.user?.username"
            class="empty-content"
          >
            <p class="empty-description">
              {{ t("list.emptyDescription") }}
            </p>
            <button class="btn-search-redirect" @click="router.push('/search')">
              <i class="pi pi-search" />
              <span>{{ t("list.searchMovies") }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="movies-grid" v-else>
        <MovieCardComponent
          v-for="movie in movies.results"
          :key="movie.id"
          :movie="movie"
          :loading="loadingComputed"
          :delete="user.username === authStore.user?.username"
          data-testid="movie-card"
          @remove-movie="removeMovieModal"
        />
      </div>

      <div v-if="!loadingComputed && movies.total_pages > 1">
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
  padding: 5.5rem 1rem 3rem;
}

.movie-list-info {
  margin-bottom: 2rem;
}

.info-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: 1.75rem;
  gap: 1.75rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.info-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--brand-gradient);
}

@media (min-width: 768px) {
  .info-card {
    flex-direction: row;
    padding: 2rem;
  }
}

.author-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 170px;
}

.avatar-wrapper {
  padding: 3px;
  background: var(--brand-gradient);
  border-radius: 50%;
  margin-bottom: 0.875rem;
  line-height: 0;
}

.author-img {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--surface);
}

.author-meta .label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
  margin-bottom: 0.25rem;
}

.username {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.divider {
  width: 1px;
  background: var(--border);
  display: none;
}

@media (min-width: 768px) {
  .divider {
    display: block;
  }
}

.list-content {
  flex: 1;
  min-width: 0;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 0.75rem;
}

.list-name {
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 4vw, 2.25rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
}

.list-description {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
  max-width: 65ch;
}

.list-footer-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.actions-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.stat i {
  color: var(--primary);
}

.privacy-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.btn-edit-list,
.btn-delete-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.btn-edit-list {
  border: 1px solid var(--border-strong);
  color: var(--text);
}

.btn-edit-list:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}

.btn-delete-list {
  border: 1px solid transparent;
  color: var(--danger);
}

.btn-delete-list:hover {
  border-color: var(--danger);
  background: var(--danger-soft);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  min-height: 200px;
}

@media (min-width: 640px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 1rem;
  flex-shrink: 0;
}

.confirm-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.confirm-body {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  padding: 0.25rem 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  padding-top: 0.5rem;
  width: 100%;
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: var(--surface-hover);
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.3rem;
  border-radius: var(--radius-md);
  border: none;
  background: #c42020;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
  font-family: inherit;
}

.btn-delete:hover {
  background: #a51b1b;
}

.mb-4 {
  margin-bottom: 1rem;
}

.empty-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: 3.5rem 2rem;
  border: 1.5px dashed var(--border-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.icon-circle {
  width: 4.5rem;
  height: 4.5rem;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-description {
  font-size: 0.9375rem;
  color: var(--text-muted);
  max-width: 320px;
  margin: 0 auto 0.5rem;
  line-height: 1.6;
}

.btn-search-redirect {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 2.75rem;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-search-redirect:hover {
  background: var(--primary-hover);
}
</style>
