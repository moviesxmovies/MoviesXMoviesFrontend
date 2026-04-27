<script lang="ts" setup>
import { fetchPlatforms } from "@/repositories/platformRepository";
import type { Platform } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import MultiSelectComponent from "./multiSelectComponent.vue";

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const selectedPlatforms = ref<Platform[]>();
const platforms = ref<Platform[]>();
const emit = defineEmits(["filterPlatforms"]);
const message = t("components.searchPlatforms.platforms");

const getPlatforms = async () => {
  isLoading.value = true;
  try {
    platforms.value = await fetchPlatforms();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.searchPlatforms.getPlatformsError"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.query.platforms,
  async () => {
    await getPlatforms();
    if (route.query.platforms) {
      selectedPlatforms.value = platforms.value?.filter((p: Platform) =>
        [route.query.platforms].flat().includes(p.slug),
      );
    }
  },
  { immediate: true },
);
</script>

<template>
  <MultiSelectComponent
    :message="message"
    :isLoading="isLoading"
    :items="platforms as Platform[]"
    v-model="selectedPlatforms as Platform[]"
    @change="
      emit(
        'filterPlatforms',
        selectedPlatforms?.map((g) => g.slug),
      )
    "
  />
</template>

<style scoped>
:deep(.p-multiselect-overlay) {
  background: var(--background) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 1.25rem !important;
}

:deep(.p-multiselect-overlay .p-checkbox .p-checkbox-box) {
  background: var(--background) !important;
  border-color: color-mix(
    in srgb,
    var(--secondary) 40%,
    transparent
  ) !important;
  border-radius: 6px !important;
}

:deep(.p-multiselect-filter) {
  background: color-mix(in srgb, var(--background) 95%, var(--text)) !important;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent) !important;
  border-radius: 0.75rem !important;
  color: var(--text) !important;
}

:deep(.p-multiselect-filter:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-multiselect-option) {
  color: var(--text) !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease;
}

:deep(.p-multiselect-option:hover) {
  background: color-mix(in srgb, var(--primary) 10%, transparent) !important;
}

:deep(.p-multiselect-option.p-selected) {
  background: color-mix(in srgb, var(--primary) 15%, transparent) !important;
  color: var(--primary) !important;
}


:deep(.p-multiselect-option.p-selected .p-checkbox .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
:deep(.p-multiselect-overlay .p-checkbox .p-checkbox-box[data-p="checked"]) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  color: white !important;
}
:deep(
  .p-multiselect-option.p-selected .p-checkbox .p-checkbox-box .p-checkbox-icon
) {
  color: white !important;
}
</style>
