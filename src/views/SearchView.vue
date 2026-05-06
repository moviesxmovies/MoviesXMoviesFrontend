<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import SearchMovieView from "./SearchMovieView.vue";
import SearchUsersView from "./SearchUsersView.vue";
import { ref, watch } from "vue";
import debounce from "@/utils/debounce";
import { InputText, SelectButton } from "primevue";
import { useI18n } from "vue-i18n";
import SearchMovieListsView from "./SearchMovieListsView.vue";

const route = useRoute();
const router = useRouter();
const search = ref<string>("");
const { t } = useI18n();

const type = ref(route.query.type?.toString() || "movies");

const options = ref([
  { label: t("search.movies"), value: "movies" },
  { label: t("search.users"), value: "users" },
  { label: t("search.lists"), value: "lists" },
  { label: t("search.actors"), value: "actors" },
  { label: t("search.directors"), value: "directors" },
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
      { label: t("search.actors"), value: "actors" },
      { label: t("search.directors"), value: "directors" },
    ];
  },
);
</script>

<template>
  <div class="page">
    <div class="search-container">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <InputText
          v-model="search"
          data-testid="search-input"
          :placeholder="$t('search.searchPlaceholder')"
          class="search-input"
          fluid
        />
        <button v-if="search" class="clear-btn" @click="search = ''">
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
    <SearchMovieView v-else />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
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

.type-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1rem;
}

:deep(.p-selectbutton .p-togglebutton) {
  background: transparent;
  border: none;
  border-radius: 10px;
  color: color-mix(in srgb, var(--text) 50%, transparent);
  font-family: "DM Sans", sans-serif;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  box-shadow: none !important;
}

:deep(.p-selectbutton .p-togglebutton:hover) {
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  color: var(--text);
}

:deep(.p-selectbutton .p-togglebutton.p-togglebutton-checked) {
  background: var(--primary) !important;
  color: white !important;
  font-weight: 500;
}

:deep(.p-selectbutton .p-togglebutton.p-togglebutton-checked:hover) {
  background: var(--primary) !important;
  opacity: 0.9;
}

:deep(.p-selectbutton .p-togglebutton:focus) {
  box-shadow: none !important;
  outline: none;
}
</style>
