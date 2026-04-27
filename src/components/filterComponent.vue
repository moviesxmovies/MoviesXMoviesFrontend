<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SearchGenresComponent from "./searchGenresComponent.vue";
import SearchPlatformsComponent from "./searchPlatformsComponent.vue";
import SearchStarsComponent from "./searchStarsComponent.vue";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from "primevue";
import FilterPreferencesComponent from "./filterPreferencesComponent.vue";

const { t } = useI18n();
const emit = defineEmits([
  "filterGenres",
  "filterPlatforms",
  "filterStars",
  "filterUnseen",
  "filterReviewed",
]);
</script>

<template>
  <Accordion class="filters-content" multiple :value="['0', '1', '2', '3']">
    <AccordionPanel value="0" class="filter-group">
      <AccordionHeader class="filter-label">{{
        t("components.filter.genres")
      }}</AccordionHeader>
      <AccordionContent>
        <SearchGenresComponent @filter-genres="emit('filterGenres', $event)" />
      </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="1" class="filter-group">
      <AccordionHeader class="filter-label">{{
        t("components.filter.platforms")
      }}</AccordionHeader>
      <AccordionContent>
        <SearchPlatformsComponent
          @filter-platforms="emit('filterPlatforms', $event)"
        />
      </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="2" class="filter-group">
      <AccordionHeader class="filter-label">{{
        t("components.filter.stars")
      }}</AccordionHeader>
      <AccordionContent>
        <SearchStarsComponent @filter-stars="emit('filterStars', $event)" />
      </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="3" class="filter-group">
      <AccordionHeader class="filter-label">{{
        t("components.filter.preferences")
      }}</AccordionHeader>
      <AccordionContent>
        <FilterPreferencesComponent
          @filter-unseen="emit('filterUnseen', $event)"
          @filter-reviewed="emit('filterReviewed', $event)"
        />
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<style scoped>
:deep(.p-accordion),
:deep(.p-accordionpanel),
:deep(.p-accordionheader),
:deep(.p-accordioncontent-content) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}

:deep(.p-accordionheader:hover),
:deep(.p-accordionheader:focus-visible),
:deep(.p-accordionpanel-active .p-accordionheader) {
  color: var(--text) !important;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--text) 40%, transparent);
}

:deep(.p-multiselect) {
  background: color-mix(in srgb, var(--background) 95%, var(--text)) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 1.25rem !important;
  color: var(--text) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-multiselect:hover) {
  border-color: var(--primary) !important;
}

:deep(.p-multiselect.p-focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-multiselect-label) {
  color: var(--text) !important;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 8px;
  white-space: normal;
  height: auto !important;
}

:deep(.p-multiselect-label.p-placeholder) {
  color: color-mix(in srgb, var(--text) 35%, transparent) !important;
}

:deep(.p-chip) {
  background: color-mix(in srgb, var(--primary) 15%, transparent) !important;
  color: var(--primary) !important;
  border-radius: 2rem !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  padding: 2px 10px !important;
}

:deep(.p-chip-remove-icon) {
  color: var(--primary) !important;
  opacity: 0.7;
}

:deep(.p-chip-remove-icon:hover) {
  opacity: 1;
}

:deep(.p-multiselect-overlay) {
  background: var(--background) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 1.25rem !important;
  overflow: hidden;
}

:deep(.p-multiselect-filter-input) {
  background: color-mix(in srgb, var(--background) 95%, var(--text)) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 0.75rem !important;
  color: var(--text) !important;
}

:deep(.p-multiselect-filter-input:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-multiselect-option) {
  color: var(--text) !important;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.p-multiselect-option:hover) {
  background: color-mix(in srgb, var(--primary) 10%, transparent) !important;
}

:deep(.p-multiselect-option.p-selected) {
  background: color-mix(in srgb, var(--primary) 15%, transparent) !important;
  color: var(--primary) !important;
}
</style>
