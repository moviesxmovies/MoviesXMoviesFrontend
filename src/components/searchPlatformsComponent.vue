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
