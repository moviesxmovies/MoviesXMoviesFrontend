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
  font-family: "DM Sans", sans-serif;
}

:deep(.custom-paginator .p-paginator-page),
:deep(.custom-paginator .p-paginator-first),
:deep(.custom-paginator .p-paginator-prev),
:deep(.custom-paginator .p-paginator-next),
:deep(.custom-paginator .p-paginator-last) {
  border: 0.5px solid var(--secondary);
  color: var(--primary);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 600;
}

:deep(.custom-paginator .p-paginator-page:not(.p-highlight):hover),
:deep(.custom-paginator .p-link:not(.p-disabled):hover) {
  background: color-mix(in srgb, var(--text) 10%, transparent) !important;
  border-color: var(--primary) !important;
  color: var(--primary) !important;
}

:deep(.custom-paginator .p-paginator-page.p-highlight) {
  background: var(--primary) !important;
  color: white !important;
  border-color: var(--primary);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
}

@media (max-width: 640px) {
  :deep(.custom-paginator .p-paginator-page),
  :deep(.custom-paginator .p-paginator-first),
  :deep(.custom-paginator .p-paginator-prev),
  :deep(.custom-paginator .p-paginator-next),
  :deep(.custom-paginator .p-paginator-last) {
    min-width: 2rem;
    font-size: 0.7rem;
  }
}
</style>
