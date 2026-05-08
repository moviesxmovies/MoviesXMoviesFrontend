<script lang="ts" setup>
import { MultiSelect } from "primevue";
import { ref } from "vue";

const props = defineProps<{
  modelValue: any[];
  isLoading: boolean;
  items: any[];
  message: string;
  optionLabel?: string;
}>();

const multiSelectRef = ref<any>(null);
const scrollListener = ref(false);
const emit = defineEmits(["update:modelValue", "change", "search", "loadmore", "loadprevious"]);

const handleSelectionChange = (value: any[]) => {
  emit("update:modelValue", value);
  emit("change");
};

const onShow = () => {
  if (scrollListener.value) return;
  const panel = multiSelectRef.value?.$el?.querySelector(
    ".p-multiselect-list-container",
  ) as HTMLElement | null;
  if (!panel) return;

  panel.addEventListener("scroll", () => {
    if (props.isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = panel;
    if (scrollHeight - scrollTop - clientHeight < 80) {
      emit("loadmore");
    }
    if (scrollTop < 80) {
      emit("loadprevious");
    }
  });
  scrollListener.value = true;
};

const onHide = () => {
  scrollListener.value = false;
};
</script>

<template>
  <MultiSelect
    ref="multiSelectRef"
    @show="onShow"
    @hide="onHide"
    :model-value="modelValue"
    @update:model-value="handleSelectionChange"
    @filter="emit('search', $event)"
    :loading="isLoading"
    :disabled="isLoading"
    display="chip"
    :appendTo="'self'"
    :options="items"
    :optionLabel="optionLabel || 'name'"
    filter
    :placeholder="message"
    :maxSelectedLabels="99"
    class="w-full multiselect-expandable"
    scroll-height="300px"
  >
    <!-- Loading state -->
    <template #empty>
      <div
        class="flex items-center justify-center gap-2 py-3"
        style="color: var(--text); opacity: 0.6"
      >
        <template v-if="isLoading">
          <i class="pi pi-spin pi-spinner" style="color: var(--primary)" />
          <span class="text-sm">{{ $t("common.loading") }}</span>
        </template>
        <template v-else>
          <i class="pi pi-search opacity-40" />
          <span class="text-sm">{{ $t("common.noResults") }}</span>
        </template>
      </div>
    </template>

    <!-- Option con foto -->
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

    <!-- Chip con foto -->
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
      </div>
    </template>
  </MultiSelect>
</template>
