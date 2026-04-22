<script lang="ts" setup>
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  movieSearching,
  type searchData,
} from "@/repositories/searchRepository";
import type { MoviePagination } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
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

    <div v-if="!loading && movies.total_pages > 1">
      <PaginationComponent
        :total_pages="movies.total_pages"
        :current_page="movies.current_page"
        @change-page="changePage"
      />
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
</style>
