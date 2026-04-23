<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SearchGenresComponent from "./searchGenresComponent.vue";
import SearchPlatformsComponent from "./searchPlatformsComponent.vue";
import SearchStarsComponent from "./searchStarsComponent.vue";

const { t } = useI18n();
const emit = defineEmits(["filterGenres", "filterPlatforms", "filterStars"]);
</script>

<template>
  <div class="filters-content">
    <div class="filter-group">
      <span class="filter-label">{{ t("components.filter.genres") }}</span>
      <SearchGenresComponent @filter-genres="emit('filterGenres', $event)" />
    </div>
    <div class="filter-group">
      <span class="filter-label">{{ t("components.filter.platforms") }}</span>
      <SearchPlatformsComponent
        @filter-platforms="emit('filterPlatforms', $event)"
      />
    </div>
    <div class="filter-group">
      <span class="filter-label">{{ t("components.filter.stars") }}</span>
      <SearchStarsComponent @filter-stars="emit('filterStars', $event)" />
    </div>
  </div>
</template>

<style scoped>
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
