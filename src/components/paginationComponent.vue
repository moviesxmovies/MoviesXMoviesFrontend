<script lang="ts" setup>
import { Paginator } from "primevue";

const props = defineProps<{
  total_pages: number;
  current_page: number;
  rows?: number;
}>();

const emit = defineEmits(["changePage"]);
</script>

<template>
  <div class="paginator-container">
    <Paginator
      :pt="{
        root: { class: 'custom-paginator' },
        page: ({ context }) => ({
          class: context.active ? 'p-highlight' : '',
        }),
      }"
      :first="(current_page - 1) * (rows || 4)"
      :rows="rows || 4"
      :totalRecords="total_pages * (rows || 4)"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      @page="(e) => emit('changePage', e.page + 1)"
      class="custom-paginator"
    />
  </div>
</template>

<style scoped>
.paginator-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.custom-paginator.p-paginator) {
  background: transparent;
  border: none;
  padding: 0.5rem;
  gap: 8px;
  font-family: var(--font-sans);
}

:deep(.custom-paginator .p-paginator-pages) {
  gap: 8px;
}

:deep(.custom-paginator .p-paginator-page),
:deep(.custom-paginator .p-paginator-first),
:deep(.custom-paginator .p-paginator-prev),
:deep(.custom-paginator .p-paginator-next),
:deep(.custom-paginator .p-paginator-last) {
  min-width: 2.5rem;
  height: 2.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-md);
  transition: background-color 0.15s var(--ease), border-color 0.15s var(--ease), color 0.15s var(--ease);
  font-weight: 500;
  font-size: 0.9375rem;
}

:deep(.custom-paginator .p-disabled) {
  opacity: 0.45;
}

:deep(.custom-paginator .p-paginator-page:not(.p-highlight):hover),
:deep(.custom-paginator button:not(.p-disabled):not(.p-highlight):hover) {
  background: var(--primary-soft) !important;
  border-color: var(--border-strong) !important;
  color: var(--primary) !important;
}

:deep(.custom-paginator .p-paginator-page.p-highlight) {
  background: var(--primary) !important;
  color: var(--on-primary) !important;
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 640px) {
  :deep(.custom-paginator .p-paginator-page),
  :deep(.custom-paginator .p-paginator-first),
  :deep(.custom-paginator .p-paginator-prev),
  :deep(.custom-paginator .p-paginator-next),
  :deep(.custom-paginator .p-paginator-last) {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.875rem;
  }
}
</style>
