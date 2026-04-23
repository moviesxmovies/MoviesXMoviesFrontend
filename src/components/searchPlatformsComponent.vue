<script lang="ts" setup>
import { fetchPlatforms } from "@/repositories/platformRepository";
import type { Platform } from "@/types";
import { MultiSelect, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const selectedPlatforms = ref<Platform[]>();
const platforms = ref<Platform[]>();
const emit = defineEmits(["filterPlatforms"]);

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
        t("components.searchPlatforms.getPlatforms"),
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
  <div class="platform">
    <MultiSelect
      v-model="selectedPlatforms"
      :loading="isLoading"
      display="chip"
      :options="platforms"
      optionLabel="name"
      filter
      :placeholder="
        t(
          isLoading
            ? 'components.searchPlatforms.loading'
            : 'components.searchPlatforms.platforms',
        )
      "
      :maxSelectedLabels="99"
      class="w-full multiselect-expandable"
      @change="
        emit(
          'filterPlatforms',
          selectedPlatforms?.map((g) => g.slug),
        )
      "
    />
  </div>
</template>
