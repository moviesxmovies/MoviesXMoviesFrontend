<script lang="ts" setup>
import {
  addMovieToList,
  fetchMovieListsFromMovie,
  fetchUserLists,
  removeMovieFromList,
} from "@/repositories/listRepository";
import { type DynamicPagination, type Movie, type MovieList, type UserMovieList } from "@/types";
import { Dialog, useToast } from "primevue";
import { watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import CreateListDialog from "./createListDialog.vue";
import ListComponent from "./listComponent.vue";
import { useAuthStore } from "@/stores/authStore";
import { useInfinitePagination } from "@/composables/useInfinitePagination";

const { t } = useI18n();
const toast = useToast();
const userList = ref<UserMovieList[]>([]);
const authStore = useAuthStore();
const loading = ref(false);
const props = defineProps<{
  movie: Movie;
}>();
const visible = defineModel<boolean>("visible", { default: false });
const visibleCreateList = ref(false);

const moviesListResponse = ref<DynamicPagination<MovieList>>({} as DynamicPagination<MovieList>);

const addToList = async (listSlug: string) => {
  try {
    await addMovieToList(authStore.user?.username || "", listSlug, props.movie.slug);
    await checkMovieInLists();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("components.addToList.error", [props.movie.title, listSlug]),
      life: 3000,
    });
  }
};

const removeFromList = async (listSlug: string) => {
  try {
    await removeMovieFromList(authStore.user?.username || "", listSlug, props.movie.slug);
    await checkMovieInLists();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.addToList.removeFromListError"),
      life: 3000,
    });
  }
};

const getUserLists = async (lastId?: number) => {
  loading.value = true;
  try {
    const response = await fetchUserLists(authStore.user?.username || "", lastId);
    if (lastId) {
      moviesListResponse.value.results.push(...response.results);
      moviesListResponse.value.next_last_id = response.next_last_id;
    } else {
      moviesListResponse.value = response;
      userList.value = response.results.map((list) => ({ list }));
    }
    const slugs = await fetchMovieListsFromMovie(props.movie.slug);
    userList.value = moviesListResponse.value.results.map((list) => ({
      list,
      containsMovie: slugs.includes(list.slug),
    }));
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.addToList.fetchListsError"),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const checkMovieInLists = async () => {
  try {
    const slugs = await fetchMovieListsFromMovie(props.movie.slug);
    userList.value.forEach((item) => {
      item.containsMovie = slugs.includes(item.list.slug);
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.addToList.checkMovieInListsError"),
      life: 3000,
    });
  }
};

const reloadData = async () => {
  moviesListResponse.value = {} as DynamicPagination<MovieList>;
  userList.value = [];
  await getUserLists();
};

const { sentinelRef } = useInfinitePagination(
  moviesListResponse,
  loading,
  getUserLists,
);

watch(
  () => props.movie,
  async () => {
    visible.value = false;
    await reloadData();
  },
  { immediate: true },
);
</script>

<template>
  <CreateListDialog :movie="props.movie" v-model:visible="visibleCreateList" @reloadLists="reloadData" />
  <Dialog v-model:visible="visible" modal :draggable="false" :dismissableMask="true"
    :header="t('components.addToList.title')" :style="{ width: '90vw', maxWidth: '400px' }" :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)]' },
      title: { class: 'text-2xl font-display font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
      footer: {
        class:
          'bg-[var(--background)] border-t border-[var(--secondary)]',
      },
    }">
    <p class="dialog-lead">
      {{ t("components.addToList.description", [props.movie.title]) }}
    </p>

    <ListComponent :items="userList" :loading="loading" v-model:sentinelRef="sentinelRef" @add="addToList"
      @remove="removeFromList" />

    <template #footer>
      <div class="w-full pt-3">
        <button class="create-list-btn" @click="visibleCreateList = true">
          <i class="pi pi-plus-circle"></i>
          {{ t("components.addToList.createList") }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-lead {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0 0 1.25rem;
}

.create-list-btn {
  width: 100%;
  min-height: 3rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px dashed color-mix(in srgb, var(--primary) 50%, transparent);
  cursor: pointer;
  transition: background-color 0.15s var(--ease), border-color 0.15s var(--ease);
}

.create-list-btn:hover {
  border-style: solid;
  border-color: var(--border-strong);
}

:deep(.p-checkbox-box) {
  border-radius: var(--radius-sm) !important;
  border: 1.5px solid var(--border-strong) !important;
  transition: background-color 0.15s var(--ease), border-color 0.15s var(--ease);
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
</style>
