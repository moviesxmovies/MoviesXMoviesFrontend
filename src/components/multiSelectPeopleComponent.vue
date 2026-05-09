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
  type: "person" | "user";
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
  if (props.type === "person") {
    const newValue = props.modelValue.filter(
      (item) => item.slug !== itemToRemove.slug,
    );
    handleSelectionChange(newValue);
  } else {
    const newValue = props.modelValue.filter(
      (item) => item.username !== itemToRemove.username,
    );
    handleSelectionChange(newValue);
  }
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
    :options="items"
    :optionLabel="type === 'person' ? 'name' : 'username'"
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
          <span class="text-sm">{{ $t("loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search opacity-40" />
          <span class="text-sm">{{ $t("search.empty") }}</span>
        </template>
      </div>
    </template>

    <template #emptyfilter>
      <div class="flex items-center justify-center gap-2 py-3">
        <template v-if="showLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search opacity-40" />
          <span class="text-sm">{{ $t("search.empty") }}</span>
        </template>
      </div>
    </template>

    <!-- Option -->
    <template #option="{ option }">
      <div class="flex items-center gap-3 py-1">
        <img
          v-if="type === 'person' ? option.image : option.picture"
          :src="type === 'person' ? option.image : option.picture"
          :alt="type === 'person' ? option.name : option.username"
          class="w-8 h-8 rounded-full object-cover"
        />
        <span class="text-sm font-medium" style="color: var(--text)">{{
          type === "person" ? option.name : option.username
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
          :src="type === 'person' ? value.image : value.picture"
          :alt="type === 'person' ? value.name : value.username"
          class="w-4 h-4 rounded-full object-cover"
        />
        {{ type === "person" ? value.name : value.username }}
        <i
          class="pi pi-times cursor-pointer ml-1"
          style="font-size: 0.6rem; opacity: 0.7"
          @click.stop="removeItem(value)"
        />
      </div>
    </template>
  </MultiSelect>
</template>
