<script lang="ts" setup>
import { Checkbox } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const selectedStars = ref<string[]>([]);
const route = useRoute();
const STARS = ["1", "2", "3", "4", "5"];
const emit = defineEmits(["filterStars"]);
const { t } = useI18n();

watch(
  () => route.query.stars,
  () => {
    const toArray = (value: any): string[] => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    selectedStars.value = toArray(route.query.stars);
  },
  { immediate: true },
);
</script>

<template>
  <div v-for="star of STARS" :key="star" class="flex items-center gap-2">
    <Checkbox
      v-model="selectedStars"
      :inputId="'star-' + star"
      name="stars"
      :value="star"
      @change="emit('filterStars', selectedStars)"
    />
    <label :for="star">{{ t("components.searchStar.star", [star]) }} </label>
  </div>
</template>
