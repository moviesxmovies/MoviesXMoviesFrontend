<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import SearchMovieView from "./SearchMovieView.vue";
import SearchUsersView from "./SearchUsersView.vue";
import { ref, watch } from "vue";
import debounce from "@/utils/debounce";
import { InputText } from "primevue";

const route = useRoute();
const router = useRouter();
const search = ref<string>("");
const loading = ref<boolean>(false);

const updateRoute = () => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      name: search.value || undefined,
      page: 1,
    },
  });
};

const debouncedUpdate = debounce(() => updateRoute(), 500);

watch(
  () => route.query,
  (query) => {
    search.value = String(query.name || "");
  },
  { immediate: true },
);

watch(search, () => {
  loading.value = true;
  debouncedUpdate();
  loading.value = false;
});
</script>

<template>
  <div class="page">
    <div class="search-container">
      <div class="search-wrapper">
        <i v-if="!loading" class="pi pi-search search-icon" />
        <i v-else class="pi pi-spin pi-spinner search-icon" />
        <InputText
          v-model="search"
          data-testid="search-input"
          :placeholder="$t('search.searchPlaceholder')"
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
    <SearchUsersView v-if="route.query.type === 'users'" key="users" />
    <SearchMovieView v-else />
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

.search-container {
  margin: 40px 0 20px 0;
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

@media (max-width: 640px) {
  .search-input {
    font-size: 1rem;
    padding: 0.7rem 1rem 0.7rem 2.8rem !important;
  }
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
</style>
