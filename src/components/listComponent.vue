<script lang="ts" setup>
import { privacityConfig } from "@/repositories/listRepository";
import type { UserMovieList } from "@/types";
import { Checkbox, ScrollPanel, Skeleton } from "primevue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits<{
  (event: "add", listSlug: string): void;
  (event: "remove", listSlug: string): void;
  (event: "update:sentinelRef", el: HTMLElement | null): void;
}>();

const props = defineProps<{
  items: UserMovieList[];
  loading: boolean;
  sentinelRef?: HTMLElement | null;
}>();

const localizedPrivacyConfig = computed(() => {
  return Object.keys(privacityConfig).reduce((acc, key) => {
    const option = privacityConfig[key as keyof typeof privacityConfig];
    acc[key] = {
      ...option,
      key: t(option?.key || ""),
    };
    return acc;
  }, {} as any);
});
</script>

<template>
  <div class="max-h-[350px] flex flex-col gap-3">
    <div v-if="props.loading && !props.items.length" class="flex flex-col gap-3">
      <div v-for="i in 5" :key="i" class="h-20 rounded-2xl overflow-hidden">
        <Skeleton height="100%" class="custom-skeleton" />
      </div>
    </div>

    <ScrollPanel v-else class="w-full" style="height: 350px">
      <div class="flex flex-col gap-2.5 py-1 pr-2">
        <div v-for="item in props.items" :key="item.list.id" class="list-item group" role="checkbox"
          :aria-checked="!!item.containsMovie" tabindex="0"
          @keydown.enter.prevent="item.containsMovie ? emit('remove', item.list.slug) : emit('add', item.list.slug)"
          @keydown.space.prevent="item.containsMovie ? emit('remove', item.list.slug) : emit('add', item.list.slug)"
          :class="{ 'item-selected': item.containsMovie }" @click="
            item.containsMovie
              ? emit('remove', item.list.slug)
              : emit('add', item.list.slug)
            ">
          <div class="flex items-center gap-4">
            <div class="icon-wrapper">
              <i :class="[
                item.containsMovie ? 'pi pi-check' : 'pi pi-bookmark',
                'main-icon',
              ]"></i>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="list-name">{{ item.list.name }}</span>
              <div v-if="item.list.privacity" :class="['privacity-badge', localizedPrivacyConfig[item.list.privacity]?.class]">
                <i :class="[localizedPrivacyConfig[item.list.privacity]?.icon]" aria-hidden="true" />
                <span>{{ localizedPrivacyConfig[item.list.privacity]?.key }}</span>
              </div>
            </div>
          </div>

          <span class="check-indicator" aria-hidden="true">
            <i v-if="item.containsMovie" class="pi pi-check" />
          </span>
          <Checkbox :binary="true" :modelValue="item.containsMovie" class="custom-checkbox" @click.stop hidden />
        </div>

        <div :ref="(el) => $emit('update:sentinelRef', el as HTMLElement | null)" class="h-px" />

        <div v-if="props.loading && props.items.length" class="flex justify-center py-3">
          <i class="pi pi-spin pi-spinner text-[var(--primary)]" />
        </div>
      </div>
    </ScrollPanel>

    <div v-if="!loading && props.items.length === 0" class="empty-state">
      <div class="empty-icon-circle">
        <i class="pi pi-folder-open"></i>
      </div>
      <p class="empty-title">{{ t("components.lists.noLists") }}</p>
      <p class="empty-desc">{{ t("components.lists.noListsDesc") }}</p>
    </div>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.15s var(--ease), background-color 0.15s var(--ease);
  position: relative;
}

.list-item:hover {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.item-selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.item-selected .icon-wrapper {
  background: var(--primary);
  border-color: var(--primary);
}

.main-icon {
  color: var(--text-subtle);
  font-size: 1rem;
}

.item-selected .main-icon {
  color: var(--on-primary);
}

.list-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text);
}

.privacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.privacity-badge i {
  font-size: 0.75rem;
}

.check-indicator {
  width: 1.375rem;
  height: 1.5rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.75rem;
}

.item-selected .check-indicator {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

.empty-state {
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  color: var(--text-subtle);
}

.empty-title {
  font-weight: 500;
  color: var(--text);
}

.empty-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

:deep(.p-scrollpanel-bar) {
  background: color-mix(in srgb, var(--text-subtle) 45%, transparent);
}
</style>
