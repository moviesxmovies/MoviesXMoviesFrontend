<script lang="ts" setup>
import debounce from "@/utils/debounce";
import { MultiSelect } from "primevue";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  modelValue: any[];
  isLoading: boolean;
  items: any[];
  message: string;
  optionLabel?: string;
}>();

const isSearching = ref(false);
const showLoading = computed(() => props.isLoading || isSearching.value);

const emit = defineEmits(["update:modelValue", "change", "search"]);

const handleFilter = (event: any) => {
  isSearching.value = true;

  debounce(() => {
    emit("search", event);
  }, 500);
};

const removeItem = (itemToRemove: any) => {
  const newValue = props.modelValue.filter(
    (item) => item.username !== itemToRemove.username
  );
  handleSelectionChange(newValue);
};

const handleSelectionChange = (value: any[]) => {
  emit("update:modelValue", value);
  emit("change");
};

watch(
  () => props.isLoading,
  (loading) => {
    if (!loading) isSearching.value = false;
  },
);
</script>

<template>
  <MultiSelect
    :model-value="modelValue"
    @update:model-value="handleSelectionChange"
    @filter="handleFilter"
    :loading="showLoading"
    display="chip"
    :appendTo="'self'"
    :options="items"
    optionLabel="username"
    :autoFilter="false"
    filter
    :placeholder="message"
    :maxSelectedLabels="99"
    class="w-full multiselect-expandable"
  >
    <!-- Loading state -->
    <template #empty>
      <div
        class="flex items-center justify-center gap-2 py-3"
        style="color: var(--text); opacity: 0.6"
      >
        <template v-if="showLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("common.loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search opacity-40" />
          <span class="text-sm">{{ $t("common.noResults") }}</span>
        </template>
      </div>
    </template>

    <template #emptyfilter>
      <div class="flex items-center justify-center gap-2 py-3">
        <template v-if="showLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("common.loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search opacity-40" />
          <span class="text-sm">{{ $t("common.noResults") }}</span>
        </template>
      </div>
    </template>

    <!-- Option -->
    <template #option="{ option }">
      <div class="flex items-center gap-3 py-1">
        <img
          v-if="option.picture"
          :src="option.picture"
          :alt="option.username"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style="
            background: color-mix(in srgb, var(--primary) 15%, transparent);
          "
        >
          <i class="pi pi-user text-xs" style="color: var(--primary)" />
        </div>
        <span class="text-sm font-medium" style="color: var(--text)">{{
          option.username
        }}</span>
      </div>
    </template>

    <!-- Chip -->
    <template #chip="{ value }">
      <div
        class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
        style="
          background: color-mix(in srgb, var(--primary) 15%, transparent);
          color: var(--primary);
        "
      >
        <img
          v-if="value.picture"
          :src="value.picture"
          :alt="value.username"
          class="w-4 h-4 rounded-full object-cover"
        />
        <i v-else class="pi pi-user" style="font-size: 0.6rem" />
        {{ value.username }}
        <i
          class="pi pi-times cursor-pointer ml-1"
          style="font-size: 0.6rem; opacity: 0.7"
          @click.stop="removeItem(value)"
        />
      </div>
    </template>
  </MultiSelect>
</template>
