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
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: t("components.addToList.success", [props.movie.title, listSlug]),
      life: 3000,
    });
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
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: t("components.addToList.removeFromListSuccess", [props.movie.title, listSlug]),
      life: 3000,
    });
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
    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gray)] opacity-60 mb-6">
      {{ t("components.addToList.description", [props.movie.title]) }}
    </p>

    <ListComponent :items="userList" :loading="loading" v-model:sentinelRef="sentinelRef" @add="addToList"
      @remove="removeFromList" />

    <template #footer>
      <div class="w-full pt-4">
        <button
          class="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all cursor-pointer"
          @click="visibleCreateList = true">
          <i class="pi pi-plus-circle"></i>
          {{ t("components.addToList.createList") }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-checkbox-box) {
  border-radius: 8px !important;
  border: 2px solid var(--secondary) !important;
  transition: all 0.2s ease;
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

div[v-for] {
  animation: slideIn 0.3s ease forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
