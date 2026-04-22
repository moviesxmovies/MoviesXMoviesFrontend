<script lang="ts" setup>
import MovieCardComponent from "@/components/movieCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  movieSearching,
  type searchData,
} from "@/repositories/searchRepository";
import type { MoviePagination } from "@/types";
import { InputText, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const movies = ref<MoviePagination>({} as MoviePagination);
const { t } = useI18n();
const loading = ref<boolean>(false);
const search = ref<string>("");

const updateRoute = (newData: searchData) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ...newData,
      showUnseen: String(newData.showUnseen) || null,
      showReviewed: String(newData.showReviewed) || null,
    },
  });
};

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
  updateRoute({ page });
};

function debounce(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const debouncedUpdateRoute = debounce((name: string) => {
  updateRoute({ name, page: 1 });
}, 500);

watch(search, (newVal) => {
  debouncedUpdateRoute(newVal);
});

watch(
  () => route.query,
  async () => {
    search.value = String(route.query.name || "");
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
    <div class="search-container">
      <div class="search-wrapper">
        <i v-if="!loading" class="pi pi-search search-icon" />
        <i v-else class="pi pi-spin pi-spinner search-icon" />

        <InputText
          v-model="search"
          :placeholder="$t('home.searchPlaceholder')"
          class="search-input"
          fluid
        />

        <button
          v-if="search && !loading"
          class="clear-btn"
          @click="search = ''"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </div>

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
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: "Inter", sans-serif;
  padding: 1rem;
}

@media (min-width: 768px) {
  .page {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .page {
    padding: 2.5rem;
  }
}

.search-container {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  animation: slideDown 0.5s ease-out;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  color: color-mix(in srgb, var(--text) 40%, transparent);
  font-size: 1.1rem;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem !important;
  background: color-mix(in srgb, var(--text) 5%, transparent) !important;
  border: 1.5px solid rgba(47, 39, 206, 0.1) !important;
  border-radius: 14px !important;
  color: var(--text);
  font-family: "DM Sans", sans-serif;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  background: color-mix(in srgb, var(--text) 2%, transparent) !important;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 15%, transparent) !important;
  outline: none;
}

.search-input::placeholder {
  color: color-mix(in srgb, var(--text) 30%, transparent);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: color-mix(in srgb, var(--text) 40%, transparent);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: color-mix(in srgb, var(--text) 10%, transparent);
  color: var(--text);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .search-input {
    font-size: 1rem;
    padding: 0.7rem 1rem 0.7rem 2.8rem !important;
  }
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
