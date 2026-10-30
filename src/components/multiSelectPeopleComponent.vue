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
      <div class="flex items-center justify-center gap-2 py-3 text-muted">
        <template v-if="showLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search" aria-hidden="true" />
          <span class="text-sm">{{ $t("search.empty") }}</span>
        </template>
      </div>
    </template>

    <template #emptyfilter>
      <div class="flex items-center justify-center gap-2 py-3 text-muted">
        <template v-if="showLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search" aria-hidden="true" />
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
        <span class="text-sm font-medium">{{
          type === "person" ? option.name : option.username
        }}</span>
      </div>
    </template>

    <!-- Chip -->
    <template #chip="{ value }">
      <div class="people-chip">
        <img
          :src="type === 'person' ? value.image : value.picture"
          :alt="type === 'person' ? value.name : value.username"
          class="w-4 h-4 rounded-full object-cover"
        />
        {{ type === "person" ? value.name : value.username }}
        <button
          type="button"
          class="people-chip-remove"
          :aria-label="$t('common.delete')"
          @click.stop="removeItem(value)"
        >
          <i class="pi pi-times" aria-hidden="true" />
        </button>
      </div>
    </template>
  </MultiSelect>
</template>

<style scoped>
.people-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.25rem 0.25rem 0.25rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--primary-soft);
  color: var(--primary);
}

.people-chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.people-chip-remove i {
  font-size: 0.75rem;
}

.people-chip-remove:hover {
  background: color-mix(in srgb, var(--primary) 20%, transparent);
}
</style>
