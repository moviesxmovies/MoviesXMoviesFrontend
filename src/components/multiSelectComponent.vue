<script lang="ts" setup>
import { MultiSelect } from "primevue";

const props = defineProps<{
  modelValue: any[];
  isLoading: boolean;
  items: any[];
  message: string;
}>();

const emit = defineEmits(["update:modelValue", "change"]);

const handleSelectionChange = (value: any[]) => {
  emit("update:modelValue", value);
  emit("change");
};
</script>

<template>
  <MultiSelect
    :model-value="modelValue"
    @update:model-value="handleSelectionChange"
    :loading="isLoading"
    :disabled="isLoading"
    display="chip"
    :appendTo="'self'"
    :options="items"
    optionLabel="name"
    filter
    :placeholder="message"
    :maxSelectedLabels="99"
    class="w-full multiselect-expandable"
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

:deep(
  .p-multiselect-option.p-selected .p-checkbox .p-checkbox-box .p-checkbox-icon
) {
  color: white !important;
}
</style>
