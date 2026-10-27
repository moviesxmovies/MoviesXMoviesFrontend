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
import SearchPersonComponent from "./searchPersonComponent.vue";

const { t } = useI18n();
const emit = defineEmits([
  "filterGenres",
  "filterPlatforms",
  "filterStars",
  "filterUnseen",
  "filterReviewed",
  "filterCelebrities",
]);
</script>

<template>
  <Accordion class="filters-content" multiple :value="['0', '1', '2', '3', '4']">
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
        t("components.filter.celebrities")
      }}</AccordionHeader>
      <AccordionContent>
        <SearchPersonComponent
          @filter-persons="emit('filterCelebrities', $event)"
        />
      </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="3" class="filter-group">
      <AccordionHeader class="filter-label">{{
        t("components.filter.stars")
      }}</AccordionHeader>
      <AccordionContent>
        <SearchStarsComponent @filter-stars="emit('filterStars', $event)" />
      </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="4" class="filter-group">
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

:deep(.p-accordionheader) {
  color: var(--text) !important;
  font-family: var(--font-sans);
}

:deep(.p-accordionheader:hover),
:deep(.p-accordionheader:focus-visible),
:deep(.p-accordionpanel-active .p-accordionheader) {
  color: var(--text) !important;
}

:deep(.p-accordionheader-toggle-icon) {
  color: var(--text-subtle);
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.filter-group + .filter-group {
  padding-top: 1.25rem !important;
  border-top: 1px solid var(--border) !important;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--text);
}
</style>
