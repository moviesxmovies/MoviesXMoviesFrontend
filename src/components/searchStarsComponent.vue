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
  <div v-for="star of STARS" :key="star" class="star-item">
    <Checkbox
      v-model="selectedStars"
      :inputId="String(star)"
      name="stars"
      :value="star"
      @change="emit('filterStars', selectedStars)"
    />
    <div class="star-label">
      <i v-for="n in Number(star)" :key="n" class="pi pi-star-fill" />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-checkbox-box) {
  background: color-mix(in srgb, var(--background) 50%, transparent);
  border-radius: 8px !important;
  border: 2px solid var(--secondary) !important;
  transition: all 0.2s ease;
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

.star-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.star-label {
  display: flex;
  gap: 2px;
  cursor: pointer;
  color: color-mix(in srgb, var(--text) 50%, transparent);
}

.star-label .pi-star-fill {
  font-size: 0.75rem;
  color: #f59e0b;
}
</style>
