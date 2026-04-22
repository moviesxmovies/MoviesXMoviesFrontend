<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  total_pages: number;
  current_page: number;
}>();

const showingPages = computed(() => {
  const total = props.total_pages;
  const current = props.current_page;

  const candidates = new Set([
    1,
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
    total,
  ]);

  const pages: (number | 0)[] = [];

  for (const page of [...candidates].filter((p) => p >= 1 && p <= total)) {
    if (pages.length && page - (pages[pages.length - 1] as number) > 1) {
      pages.push(0);
    }
    pages.push(page);
  }
  return pages;
});
const emit = defineEmits(["changePage"]);
</script>

<template>
  <div v-if="total_pages > 1" class="pagination">
    <button
      class="page-btn"
      :disabled="current_page === 1"
      @click="emit('changePage', current_page - 1)"
    >
      <i class="pi pi-angle-left"></i>
    </button>

    <template v-for="page in showingPages" :key="page">
      <span v-if="page === 0" class="page-ellipsis">…</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: page === current_page }"
        @click="emit('changePage', page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="page-btn"
      :disabled="current_page === total_pages"
      @click="emit('changePage', current_page + 1)"
    >
      <i class="pi pi-angle-right"></i>
    </button>
  </div>
</template>

<style scoped>
/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  background: var(--surface-card);
  color: var(--text-color-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-ellipsis {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}
</style>
