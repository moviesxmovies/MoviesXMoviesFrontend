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
      <span class="section-icon" aria-hidden="true"><i :class="props.icon || 'pi pi-video'" /></span>
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
      <span class="section-icon" aria-hidden="true"><i :class="props.icon || 'pi pi-video'" /></span>
      <h2 class="section-title">
        {{ props.title }}
      </h2>
    </AccordionHeader>
    <AccordionContent class="section-body">
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">
          <i class="pi pi-video"></i>
        </div>
        <h3 class="empty-title">
          {{ t("components.filmography.no_movies") }}
        </h3>
        <p class="empty-description">
          {{ t("components.filmography.no_movies_description") }}
        </p>
      </div>
    </AccordionContent>
  </AccordionPanel>
</template>

<style scoped>
:deep(.p-accordionheader) {
  color: var(--text);
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
}

:deep(.p-accordionheader:hover) {
  background: var(--surface-2) !important;
}

:deep(.p-accordionheader[aria-expanded="true"]) {
  border-bottom: 1px solid var(--border) !important;
}

:deep(.p-accordionheader-toggle-icon) {
  color: var(--text-subtle);
}

:deep(.p-accordioncontent-content) {
  all: unset;
}

.section {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem !important;
  min-height: 3.5rem;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  color: var(--text-subtle);
  font-size: 0.9375rem;
}

.section-title {
  flex: 1;
  text-align: left;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 1rem;
  color: var(--text);
  margin: 0;
}

.section-body {
  padding: 1.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin: 0;
}

.empty-description {
  font-size: 0.9375rem;
  color: var(--text-muted);
  max-width: 22rem;
  margin: 0;
}

:deep(.movies-grid) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-right: 0.75rem;
}

@media (min-width: 640px) {
  :deep(.movies-grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  :deep(.movies-grid) {
    grid-template-columns: repeat(4, 1fr);
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
  color: var(--primary);
}

:deep(.p-scrollpanel-bar) {
  background: color-mix(in srgb, var(--text-subtle) 45%, transparent);
  border-radius: var(--radius-md);
  width: 6px;
  opacity: 1;
}

:deep(.p-scrollpanel-bar-y) {
  width: 6px;
}

:deep(.p-scrollpanel-bar:hover) {
  background: var(--primary);
}
</style>
