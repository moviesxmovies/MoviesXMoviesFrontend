<script lang="ts" setup>
import type { Movie } from "@/types";
import {
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  ScrollPanel,
} from "primevue";
import { useI18n } from "vue-i18n";
import MovieCardComponent from "./movieCardComponent.vue";

const { t } = useI18n();
const props = defineProps<{
  index: number;
  list?: Movie[];
  icon?: string;
  title: string;
  loading: boolean;
  sentinelRef: HTMLElement | null;
  empty?: boolean;
}>();

const emit = defineEmits<{
  "update:sentinelRef": [el: HTMLElement | null];
}>();
</script>

<template>
  <AccordionPanel :value="index" v-if="props.list?.length" class="section">
    <AccordionHeader class="section-header">
      <i :class="[props.icon || 'pi pi-video', 'primary-icon']" />
      <h2 class="section-title">
        {{ props.title }}
      </h2>
    </AccordionHeader>
    <AccordionContent v-if="props.list" class="section-body">
      <ScrollPanel style="width: 100%; height: 680px">
        <div class="movies-grid">
          <MovieCardComponent v-for="movie in props.list" :key="movie.id" :movie="movie" />
          <div :ref="(el) => emit('update:sentinelRef', el as HTMLElement)" class="sentinel" />
          <div v-if="props.loading" class="loading-footer">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
        </div>
      </ScrollPanel>
    </AccordionContent>
  </AccordionPanel>

  <AccordionPanel :value="index" v-if="props.empty" class="section">
    <AccordionHeader class="section-header">
      <i :class="[props.icon || 'pi pi-video', 'primary-icon']" />
      <h2 class="section-title">
        {{ props.title }}
      </h2>
    </AccordionHeader>
    <AccordionContent class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
      <div class="flex flex-col items-center justify-center text-center">

        <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
          <i class="pi pi-video text-3xl text-secondary"></i>
        </div>
        <h3 class="text-xl font-semibold opacity-70">
          {{ t("components.filmography.no_movies") }}
        </h3>
        <p class="text-sm opacity-50 max-w-xs mx-auto">
          {{ t("components.filmography.no_movies_description") }}
        </p>
      </div>
    </AccordionContent>
  </AccordionPanel>
</template>

<style scoped>
:deep(.p-accordionheader) {
  color: var(--text);
}

:deep(.p-accordioncontent-content) {
  all: unset;
}

.primary-icon {
  color: var(--primary);
}

.section {
  border-radius: 1.5rem;
  border: 1px solid var(--secondary);
  background: var(--background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--secondary);
  background: rgba(255, 255, 255, 0.05);
}

.section-title {
  font-weight: 900;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
  margin: 0;
}

.section-body {
  padding: 1.5rem;
}

.empty-movies {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 0;
  color: var(--gray);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.2;
}

.empty-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
}

:deep(.movies-grid) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (min-width: 1024px) {
  :deep(.movies-grid) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.sentinel {
  grid-column: 1 / -1;
  height: 1px;
}

.loading-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 1rem;
}
:deep(.p-scrollpanel-bar) {
    background: var(--secondary);
    border-radius: 999px;
    width: 4px;
    opacity: 1;
}

:deep(.p-scrollpanel-bar-y) {
    width: 4px;
}

:deep(.p-scrollpanel-bar:hover) {
    background: var(--primary);
}
</style>
