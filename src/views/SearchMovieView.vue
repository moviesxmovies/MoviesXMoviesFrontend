<script lang="ts" setup>
import FilterComponent from "@/components/filterComponent.vue";
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  movieSearching,
  type searchData,
} from "@/repositories/movieRepository";
import { useLangStore } from "@/stores/langStore";
import type { Movie, Pagination } from "@/types";
import { Drawer, useToast } from "primevue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const movies = ref<Pagination<Movie>>({} as Pagination<Movie>);
const { t } = useI18n();
const loading = ref<boolean>(false);
const langStore = useLangStore();
const filtersOpen = ref(false);

const activeFiltersCount = computed(() => {
  return (
    (typeof route.query.genres === "string"
      ? 1
      : (route.query.genres?.length ?? 0)) +
    (typeof route.query.stars === "string"
      ? 1
      : (route.query.stars?.length ?? 0)) +
    (typeof route.query.platforms === "string"
      ? 1
      : (route.query.platforms?.length ?? 0)) +
    (typeof route.query.celebrities === "string"
      ? 1
      : (route.query.celebrities?.length ?? 0)) +
    (route.query.marked_unseen === "true" ? 1 : 0) +
    (route.query.reviewed === "true" ? 1 : 0)
  );
});

const getBoolean = (
  path: LocationQueryValue | LocationQueryValue[] | undefined,
  value?: string,
) => {
  if (value) {
    return value === "true" ? "true" : undefined;
  }
  return path === "true" ? "true" : undefined;
};

const updateRoute = (newData: searchData) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ...newData,
      marked_unseen: newData.marked_unseen
        ? getBoolean(route.query.marked_unseen, newData.marked_unseen)
        : getBoolean(route.query.marked_unseen),
      reviewed: newData.reviewed
        ? getBoolean(route.query.reviewed, newData.reviewed)
        : getBoolean(route.query.reviewed),
    },
  });
};

const normalizeQueryParams = (query: typeof route.query): searchData => {
  const toArray = (value: any): string[] | number[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  return {
    ...query,
    genres: toArray(query.genres),
    platforms: toArray(query.platforms),
    stars: toArray(query.stars),
    celebrities: toArray(query.celebrities),
  } as searchData;
};

const searchMovies = async (data: searchData) => {
  try {
    loading.value = true;
    movies.value = await movieSearching(data);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("search.searchMoviesError"),
    });
  } finally {
    loading.value = false;
  }
};

const changePage = async (page: number) => {
  updateRoute({ page });
};

watch(
  [() => route.query, () => langStore.language],
  async () => {
    await searchMovies(normalizeQueryParams(route.query));
  },
  { immediate: true },
);
</script>

<template>
  <button class="filters-toggle mobile-only" @click="filtersOpen = true">
    <i class="pi pi-sliders-h" />
    {{ t("search.filters") }}
    <span v-if="activeFiltersCount" class="filters-badge">
      {{ activeFiltersCount }}
    </span>
  </button>

  <Drawer
    v-model:visible="filtersOpen"
    :header="t('search.filters')"
    position="left"
    class="mobile-only !w-full md:!w-[40rem]"
    :pt="{
      root: { style: 'transition: none' },
      mask: { style: 'transition: none' },
    }"
  >
    <div class="clear-filters-wrapper">
      <button class="btn-clear-filters" @click="router.push('/search')">
        <span class="btn-content">
          <i class="pi pi-filter-slash" aria-hidden="true" />
          <span>{{ $t("search.clearFilters") }}</span>
        </span>
        <span v-if="activeFiltersCount" class="filters-badge">
          {{ activeFiltersCount }}
        </span>
      </button>
    </div>
    <FilterComponent
      @filter-genres="(genres: string[]) => updateRoute({ genres })"
      @filter-platforms="(platforms: string[]) => updateRoute({ platforms })"
      @filter-stars="(stars: number[]) => updateRoute({ stars })"
      @filter-unseen="(marked_unseen: string) => updateRoute({ marked_unseen })"
      @filter-reviewed="(reviewed: string) => updateRoute({ reviewed })"
      @filter-celebrities="
        (celebrities: string[]) => updateRoute({ celebrities })
      "
      @close="filtersOpen = false"
    />
  </Drawer>

  <div class="content-layout">
    <aside class="desktop-only filters-sidebar">
      <div class="clear-filters-wrapper">
        <button class="btn-clear-filters" @click="router.push('/search')">
          <span class="btn-content">
            <i class="pi pi-filter-slash" aria-hidden="true" />
            <span>{{ $t("search.clearFilters") }}</span>
          </span>
          <span v-if="activeFiltersCount" class="filters-badge">
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
      <FilterComponent
        @filter-genres="(genres: string[]) => updateRoute({ genres })"
        @filter-platforms="(platforms: string[]) => updateRoute({ platforms })"
        @filter-stars="(stars: number[]) => updateRoute({ stars })"
        @filter-unseen="
          (marked_unseen: string) => updateRoute({ marked_unseen })
        "
        @filter-reviewed="(reviewed: string) => updateRoute({ reviewed })"
        @filter-celebrities="
          (celebrities: string[]) => updateRoute({ celebrities })
        "
        @close="filtersOpen = false"
      />
    </aside>

    <div class="main-content">
      <div v-if="!loading && !movies.results?.length" class="empty-state">
        <div class="empty-icon" aria-hidden="true">
          <i class="pi pi-search"></i>
        </div>
        <p>{{ t("search.empty") }}</p>
        <span>{{ t("search.help") }}</span>
      </div>
      <div v-else class="movies-grid">
        <MovieCardComponent
          v-for="movie in movies.results"
          :key="movie.id"
          :movie="movie"
          :loading="loading"
          data-testid="movie-card"
        />
      </div>

      <div v-if="!loading && movies.total_pages > 1">
        <PaginationComponent
          data-testid="PaginationComponent"
          :data-total="movies.total_pages"
          :data-current="movies.current_page"
          :total_pages="movies.total_pages"
          :current_page="movies.current_page"
          @change-page="changePage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.movies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  min-height: 200px;
}

@media (min-width: 480px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 900px) {
  .movies-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .movies-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 0.5rem;
  text-align: center;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-xl);
  background: var(--surface);
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-subtle);
  margin-bottom: 0.25rem;
}

.empty-state p {
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--text);
  font-size: 1.125rem;
  margin: 0;
}

.empty-state span {
  font-size: 0.9375rem;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .content-layout {
    flex-direction: column;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex;
  }
}

@media (min-width: 641px) {
  .mobile-only {
    display: none !important;
  }

  .filters-sidebar {
    width: 240px;
  }

  .desktop-only {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .filters-sidebar {
    width: 272px;
  }
}

.content-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  max-width: 1440px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.filters-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  margin-bottom: 1rem;
}

.filters-toggle:hover {
  border-color: var(--border-strong);
  background: var(--primary-soft);
}

.filters-toggle .pi-sliders-h {
  color: var(--text-subtle);
  font-size: 1rem;
}

.filters-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 1.375rem;
  height: 1.5rem;
  border-radius: var(--radius-md);
  padding: 0 8px;
}

.filters-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 5rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
}

.skeleton-card {
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.clear-filters-wrapper {
  margin: 0;
}

.btn-clear-filters {
  width: 100%;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.btn-content i {
  color: var(--text-subtle);
  font-size: 0.875rem;
}

.btn-clear-filters:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--primary-soft);
}

.btn-clear-filters:active {
  transform: scale(0.98);
}
</style>
