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
    :options="items"
    optionLabel="name"
    filter
    :placeholder="message"
    :maxSelectedLabels="99"
    class="w-full multiselect-expandable"
  />
</template>