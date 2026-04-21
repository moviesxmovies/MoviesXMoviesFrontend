<script lang="ts" setup>
import MovieCardComponent from "@/components/movieCardComponent.vue";
import {
  movieSearching,
  type searchData,
} from "@/repositories/searchRepository";
import type { MoviePagination } from "@/types";
import { useToast } from "primevue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const movies = ref<MoviePagination>({} as MoviePagination);
const { t } = useI18n();
const loading = ref<boolean>(false);

const searchMovies = async (data: searchData) => {
  try {
    loading.value = true;
    const result = await movieSearching(data);
    movies.value = result;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("search.error.searchMovies"),
    });
  } finally {
    loading.value = false;
  }
};

const changePage = async (page: number) => {
  router.push(`/search?page=${page}`);
};

const showingPages = computed(() => {
  const total = movies.value.total_pages;
  const current = movies.value.current_page;

  const candidates = new Set([
    1,
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
    total,
  ]);

  const pages: (number | 0)[] = [];

  for (const page of [...candidates].filter((p) => p >= 1 && p <= total)) {
    if (pages.length && page - (pages[pages.length - 1] as number) > 1) {
      pages.push(0);
    }
    pages.push(page);
  }
  return pages;
});

watch(
  () => route.query,
  async () => {
    if (route.query.type === "user") {
      console.log("user search");
    } else if (route.query.type === "person") {
      console.log("person params");
    } else {
      await searchMovies(route.query as searchData);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="page">
    <div class="movies-grid">
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner loading-spinner"></i>
        <span>Buscando películas...</span>
      </div>

      <!-- Estado: sin resultados -->
      <div v-else-if="!movies.results?.length" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-search"></i>
        </div>
        <p>No se encontraron películas</p>
        <span>Intenta con otro término de búsqueda</span>
      </div>

      <!-- Estado: con resultados -->
      <template v-else>
        <MovieCardComponent
          v-for="movie in movies.results"
          :key="movie.id"
          :movie="movie"
        />
      </template>
    </div>

    <!-- Paginación -->
    <div v-if="!loading && movies.total_pages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="movies.current_page === 1"
        @click="changePage(movies.current_page - 1)"
      >
        <i class="pi pi-angle-left"></i>
      </button>

      <template v-for="page in showingPages" :key="page">
        <span v-if="page === 0" class="page-ellipsis">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: page === movies.current_page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="movies.current_page === movies.total_pages"
        @click="changePage(movies.current_page + 1)"
      >
        <i class="pi pi-angle-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  font-family: "Inter", sans-serif;
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

/* Estado: cargando */
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

/* Estado: vacío */
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

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  background: var(--surface-card);
  color: var(--text-color-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-ellipsis {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}
</style>
