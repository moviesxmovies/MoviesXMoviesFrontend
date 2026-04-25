<script lang="ts" setup>
import { privacityConfig } from "@/repositories/listRepository";
import type { UserMovieList } from "@/types";
import { Checkbox, ScrollPanel, Skeleton } from "primevue";
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
        <div v-for="item in props.items" :key="item.list.id" class="list-item group"
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
              <div v-if="item.list.privacity" :class="['privacity-badge', privacityConfig[item.list.privacity]?.class]">
                <i :class="[privacityConfig[item.list.privacity]?.icon, 'text-[10px]']" />
                <span>{{ privacityConfig[item.list.privacity]?.text }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <Checkbox :binary="true" :modelValue="item.containsMovie" class="custom-checkbox" @click.stop />
          </div>
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
  padding: 0.85rem 1.25rem;
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--background) 95%, var(--text));
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.list-item:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, var(--background));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-selected {
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--secondary) 50%, transparent);
  transition: all 0.3s ease;
}

.group:hover .icon-wrapper {
  background: var(--primary);
}

.main-icon {
  color: var(--primary);
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.group:hover .main-icon {
  color: var(--background);
  transform: scale(1.1);
}

.list-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.privacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;
}

.badge-public {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}

.badge-private {
  background: color-mix(in srgb, var(--secondary) 15%, transparent);
  color: color-mix(in srgb, var(--text) 75%, transparent);
}

.badge-friends {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
}

.empty-state {
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--secondary) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: color-mix(in srgb, var(--secondary) 40%, var(--text));
}

.empty-title {
  font-weight: 600;
  color: var(--text);
  opacity: 0.8;
}

.empty-desc {
  font-size: 0.85rem;
  opacity: 0.5;
  margin-top: 0.25rem;
}

:deep(.custom-skeleton) {
  background: color-mix(in srgb, var(--secondary) 10%, transparent);
}

:deep(.p-scrollpanel-bar) {
  background: color-mix(in srgb, var(--primary) 30%, transparent);
}
</style>
