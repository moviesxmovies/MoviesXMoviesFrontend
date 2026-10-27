<script lang="ts" setup>
import { Checkbox } from "primevue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const selectedStars = ref<string[]>([]);
const route = useRoute();
const STARS = ["1", "2", "3", "4", "5"];
const emit = defineEmits(["filterStars"]);

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
    <label :for="String(star)" class="star-label" :aria-label="`${star} / 5`">
      <i v-for="n in 5" :key="n" class="pi" :class="n <= Number(star) ? 'pi-star-fill' : 'pi-star star-empty'" aria-hidden="true" />
    </label>
  </div>
</template>

<style scoped>
:deep(.p-checkbox-box) {
  background: var(--surface);
  border-radius: 6px !important;
  border: 1.5px solid var(--border-strong) !important;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

:deep(.p-checkbox-checked .p-checkbox-box) {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

:deep(.p-checkbox-checked .p-checkbox-icon) {
  color: var(--on-primary) !important;
}

.star-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.star-label {
  display: flex;
  gap: 3px;
  cursor: pointer;
}

.star-label .pi {
  font-size: 0.875rem;
  color: var(--star);
}

.star-label .star-empty {
  color: var(--text-subtle);
  opacity: 0.6;
}
</style>
