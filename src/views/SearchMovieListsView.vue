<script lang="ts" setup>
import MoviesListComponent from "@/components/moviesListComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import { listSearching } from "@/repositories/listRepository";
import type { MovieList, Pagination } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const movieLists = ref<Pagination<MovieList>>({} as Pagination<MovieList>);
const { t } = useI18n();
const loading = ref<boolean>(false);

const searchMovieLists = async (query: string, page?: number) => {
  try {
    loading.value = true;
    movieLists.value = await listSearching(query, page);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("search.searchUsersError"),
    });
  } finally {
    loading.value = false;
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

watch(
  () => route.query,
  async () => {
    await searchMovieLists(route.query.name?.toString() || "", Number(route.query.page));
  },
  { immediate: true },
);
</script>

<template>
  <div class="movie-list">
    <div v-if="loading" class="state-box">
      <i class="pi pi-spin pi-spinner" style="font-size: 1.25rem" />
      <span>{{ t("loading") }}</span>
    </div>

    <div v-else-if="!movieLists.results?.length" class="state-box">
      <div class="empty-icon">
        <i class="pi pi-search" style="font-size: 1rem" />
      </div>
      <p class="empty-title">{{ t("search.empty") }}</p>
      <span class="empty-sub">{{ t("search.help") }}</span>
    </div>

    <div v-else class="movielist-grid">
      <MoviesListComponent
        v-for="movieList in movieLists.results"
        :key="movieList.id"
        :movieList="movieList"
      />
    </div>

    <div v-if="!loading && movieLists.total_pages > 1">
      <PaginationComponent
        data-testid="PaginationComponent"
        :data-total="movieLists.total_pages"
        :data-current="movieLists.current_page"
        :total_pages="movieLists.total_pages"
        :current_page="movieLists.current_page"
        @change-page="updateRoute"
      />
    </div>
  </div>
</template>

<style scoped>
.movie-list {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.movielist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  min-height: 200px;
}

@media (min-width: 768px) {
  .movie-list {
    padding: 0 1.5rem;
  }
  .movielist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .movielist-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .movie-list {
    padding: 0 3rem;
  }
  .movielist-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 8px;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}
</style>
