<script lang="ts" setup>
import { addMovieToList, fetchUserLists } from "@/repositories/listRepository";
import type { Movie, MovieList } from "@/types";
import { Checkbox, Dialog, useToast } from "primevue";
import { watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import CreateListDialog from "./createListDialog.vue";

const { t } = useI18n();
const toast = useToast();
const userList = ref<MovieList[]>([]);
const loading = ref(false);
const props = defineProps<{
  movie: Movie;
}>();
const visible = defineModel<boolean>("visible", { default: false });
const visibleCreateList = ref(false);

const addToList = async (listSlug: string) => {
  try {
    await addMovieToList(listSlug, props.movie.slug);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message || t("components.actions.addToListError"),
      life: 3000,
    });
  }
};

watch(
  () => props.movie,
  async (movie) => {
    const currentId = movie.id;
    loading.value = true;
    visible.value = false;

    try {
      const data = await fetchUserLists();
      userList.value = data;
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: t("toast.error"),
        detail: error.response?.data?.message || t("toast.genericError"),
        life: 3000,
      });
    } finally {
      if (currentId === props.movie.id) {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <CreateListDialog v-model:visible="visibleCreateList" />
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissableMask="true"
    header="Mis Listas"
    :style="{ width: '90vw', maxWidth: '400px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'p-8 pb-4 bg-[var(--background)]' },
      title: { class: 'text-2xl font-display font-bold text-[var(--primary)]' },
      content: { class: 'p-8 pt-0 bg-[var(--background)]' },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <p
      class="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gray)] opacity-60 mb-6"
    >
      Selecciona una o varias listas
    </p>

    <div class="flex flex-col gap-3">
      <div v-if="loading" class="flex flex-col gap-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-16 w-full bg-[var(--secondary)]/10 animate-pulse rounded-2xl"
        ></div>
      </div>

      <div
        v-for="list in userList"
        :key="list.id"
        class="group flex items-center justify-between p-4 rounded-2xl border border-[var(--secondary)]/30 bg-white/50 dark:bg-white/5 hover:border-[var(--primary)] hover:bg-[var(--primary)]/[0.02] transition-all duration-300 cursor-pointer"
        @click="addToList(list.slug)"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-xl bg-[var(--secondary)]/20 flex items-center justify-center group-hover:bg-[var(--primary)]/10 transition-colors"
          >
            <i class="pi pi-bookmark text-[var(--primary)]"></i>
          </div>
          <span
            class="font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors"
          >
            {{ list.name }}
          </span>
        </div>

        <Checkbox
          :binary="true"
          :modelValue="false"
          @click.stop
          class="custom-checkbox"
        />
      </div>

      <div v-if="!loading && userList.length === 0" class="text-center py-10">
        <i
          class="pi pi-folder-open text-4xl text-[var(--gray)] opacity-20 mb-3 block"
        ></i>
        <p class="text-sm text-[var(--gray)] italic">
          No tienes listas creadas aún.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="w-full pt-4 border-t border-[var(--secondary)]/20">
        <button
          class="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all"
          @click="visibleCreateList = true"
        >
          <i class="pi pi-plus-circle"></i>
          Crear nueva lista
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Estilo para que el checkbox combine perfectamente con el color primary */
:deep(.p-checkbox-box) {
  border-radius: 8px !important;
  border: 2px solid var(--secondary) !important;
  transition: all 0.2s ease;
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

/* Animación de entrada suave para los items */
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
