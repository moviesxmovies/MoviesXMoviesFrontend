<script lang="ts" setup>
import FilterComponent from "@/components/filterComponent.vue";
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  movieSearching,
  type searchData,
} from "@/repositories/movieRepository";
import { useLangStore } from "@/stores/langStore";
import type { MoviePagination } from "@/types";
import { Drawer, useToast } from "primevue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type LocationQueryValue } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const movies = ref<MoviePagination>({} as MoviePagination);
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
    <FilterComponent
      @filter-genres="(genres: string[]) => updateRoute({ genres })"
      @filter-platforms="(platforms: string[]) => updateRoute({ platforms })"
      @filter-stars="(stars: number[]) => updateRoute({ stars })"
      @filter-unseen="(marked_unseen: string) => updateRoute({ marked_unseen })"
      @filter-reviewed="(reviewed: string) => updateRoute({ reviewed })"
      @close="filtersOpen = false"
    />
  </Drawer>

  <div class="content-layout">
    <aside class="desktop-only filters-sidebar">
      <FilterComponent
        @filter-genres="(genres: string[]) => updateRoute({ genres })"
        @filter-platforms="(platforms: string[]) => updateRoute({ platforms })"
        @filter-stars="(stars: number[]) => updateRoute({ stars })"
        @filter-unseen="
          (marked_unseen: string) => updateRoute({ marked_unseen })
        "
        @filter-reviewed="(reviewed: string) => updateRoute({ reviewed })"
        @close="filtersOpen = false"
      />
    </aside>

    <div class="main-content">
      <div class="movies-grid">
        <div v-if="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner loading-spinner"></i>
          <span>{{ t("loading") }}</span>
        </div>
        <div v-else-if="!movies.results?.length" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-search"></i>
          </div>
          <p>{{ t("search.empty") }}</p>
          <span>{{ t("search.help") }}</span>
        </div>
        <template v-else>
          <MovieCardComponent
            v-for="movie in movies.results"
            :key="movie.id"
            :movie="movie"
            data-testid="movie-card"
          />
        </template>
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
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  min-height: 200px;
}

.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 12px;
  color: var(--text-color-secondary);
}

.loading-spinner {
  font-size: 2rem;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 8px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.empty-state p {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

.empty-state span {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
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
    width: 200px;
  }

  .desktop-only {
    display: flex;
  }
}

@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .filters-sidebar {
    width: 250px;
  }

  .movies-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.content-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.filters-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent);
  background: color-mix(in srgb, var(--background) 95%, var(--text));
  color: var(--text);
  font-family: "DM Sans", sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1rem;
}

.filters-toggle:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, var(--background));
  transform: translateY(-1px);
}

.filters-toggle .pi-sliders-h {
  color: var(--primary);
  font-size: 1rem;
}

.filters-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 2rem;
  background: var(--primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
}

.filters-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1.5rem;
  border: 1px solid var(--secondary);
  border-radius: 1.25rem;
  padding: 1.25rem;
}
</style>
