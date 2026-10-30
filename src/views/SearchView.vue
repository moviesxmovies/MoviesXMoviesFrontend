<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import SearchMovieView from "./SearchMovieView.vue";
import SearchUsersView from "./SearchUsersView.vue";
import { ref, watch } from "vue";
import debounce from "@/utils/debounce";
import { InputText, SelectButton } from "primevue";
import { useI18n } from "vue-i18n";
import SearchMovieListsView from "./SearchMovieListsView.vue";
import SearchCelebritiesView from "./SearchCelebritiesView.vue";

const route = useRoute();
const router = useRouter();
const search = ref<string>("");
const { t } = useI18n();

const type = ref(route.query.type?.toString() || "movies");

const options = ref([
  { label: t("search.movies"), value: "movies" },
  { label: t("search.users"), value: "users" },
  { label: t("search.lists"), value: "lists" },
  { label: t("search.celebrities"), value: "celebrities" },
]);

const updateRoute = (type: string) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      type,
      name: search.value || undefined,
      page: 1,
    },
  });
};

const debouncedUpdate = debounce(() => updateRoute(type.value), 500);

watch(
  () => route.query,
  (query) => {
    search.value = String(query.name || "");
    type.value = String(query.type || "movies");
  },
  { immediate: true },
);

watch(search, () => {
  debouncedUpdate();
});

watch(
  () => t("search.movies"),
  () => {
    options.value = [
      { label: t("search.movies"), value: "movies" },
      { label: t("search.users"), value: "users" },
      { label: t("search.lists"), value: "lists" },
      { label: t("search.celebrities"), value: "celebrities" },
    ];
  },
);
</script>

<template>
  <div class="page">
    <div class="search-container">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" aria-hidden="true" />
        <InputText
          v-model="search"
          data-testid="search-input"
          :placeholder="$t('search.searchPlaceholder')"
          class="search-input"
          :aria-label="$t('search.searchPlaceholder')"
          fluid
        />
        <button v-if="search" class="clear-btn" @click="search = ''" :aria-label="$t('common.close')">
          <i class="pi pi-times" />
        </button>
      </div>
    </div>

    <div class="type-container">
      <SelectButton
        v-model="type"
        :options="options"
        option-label="label"
        option-value="value"
        @change="updateRoute(type)"
      />
    </div>

    <SearchUsersView v-if="route.query.type === 'users'" key="users" />
    <SearchMovieListsView v-else-if="route.query.type === 'lists'" key="lists" />
    <SearchCelebritiesView v-else-if="route.query.type === 'celebrities'" key="celebrities" />
    <SearchMovieView v-else />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
  padding: 5rem 1rem 2rem;
}

@media (min-width: 768px) {
  .page {
    padding: 5.5rem 1.5rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .page {
    padding: 5.5rem 2rem 3rem;
  }
}

.search-container {
  margin: 0.5rem 0 1.25rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.1rem;
  color: var(--text-subtle);
  font-size: 1.125rem;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 3.25rem;
  padding: 0 3rem 0 3rem !important;
  background: var(--surface) !important;
  border: 1px solid var(--border-strong) !important;
  border-radius: var(--radius-lg) !important;
  color: var(--text) !important;
  font-family: var(--font-sans);
  font-size: 1rem !important;
  box-shadow: var(--shadow-sm) !important;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-input:focus {
  border-color: var(--primary) !important;
  box-shadow: var(--focus-ring) !important;
  outline: none;
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s, color 0.15s;
}

.clear-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

@media (max-width: 640px) {
  .search-input {
    height: 3rem;
    font-size: 1rem !important;
  }
}

.type-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1.75rem;
  overflow-x: auto;
}

:deep(.p-selectbutton) {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-md);
  padding: 4px;
  gap: 2px;
  box-shadow: var(--shadow-sm);
}

:deep(.p-selectbutton .p-togglebutton) {
  background: transparent !important;
  border: none !important;
  border-radius: var(--radius-md);
  color: var(--text-muted) !important;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: background-color 0.15s var(--ease), color 0.15s var(--ease);
  box-shadow: none !important;
}

:deep(.p-selectbutton .p-togglebutton::before),
:deep(.p-selectbutton .p-togglebutton-content) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.p-selectbutton .p-togglebutton:hover) {
  background: var(--surface-hover) !important;
  color: var(--text) !important;
}

:deep(.p-selectbutton .p-togglebutton.p-togglebutton-checked) {
  background: var(--primary) !important;
  color: var(--on-primary) !important;
}

:deep(.p-selectbutton .p-togglebutton.p-togglebutton-checked .p-togglebutton-label) {
  color: var(--on-primary) !important;
}

:deep(.p-selectbutton .p-togglebutton:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>
