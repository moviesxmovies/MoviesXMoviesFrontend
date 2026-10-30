<script lang="ts" setup>
const emit = defineEmits(["markAsNotSeen", "showMoreInfo", "addToList"]);
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="flex justify-center">
    <div class="action-bar ticket-tear inline-flex w-full max-w-sm ">
      <button
        id="more-info"
        :disabled="loading"
        class="action-btn accent-btn"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('showMoreInfo')"
        :aria-label="$t('actions.showMoreInfo')"
        :title="$t('actions.showMoreInfo')"
      >
        <i class="pi pi-info-circle" />
      </button>
      <button
        id="unseen-button"
        :disabled="loading"
        :class="['action-btn neutral-btn', { 'opacity-40 pointer-events-none': loading }]"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('markAsNotSeen')"
        :aria-label="$t('actions.markAsNotSeen')"
        :title="$t('actions.markAsNotSeen')"
      >
        <i class="pi pi-eye-slash" />
      </button>
      <button
        id="add-to-list-button"
        :disabled="loading"
        class="action-btn primary-btn"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('addToList')"
        :aria-label="$t('actions.addToList')"
        :title="$t('actions.addToList')"
      >
        <i class="pi pi-plus-circle" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-bar {
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  background: var(--surface);
  transform: translateZ(0);
}

.action-btn {
  flex: 1;
  height: 3.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
    background: transparent;
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 500;
  transition: background-color 0.15s var(--ease), color 0.15s var(--ease), transform 0.15s var(--var(--ease));
  -webkit-tap-highlight-color: transparent;
}

.action-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -4px;
}

.action-btn:last-child {
  border-right: none;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn:disabled {
  opacity: 0.45;
  pointer-events: none;
}

.accent-btn,
.neutral-btn,
.primary-btn { color: var(--text-muted); }

@media (hover: hover) {
  .action-btn:hover { background: var(--surface-hover); color: var(--text); }
}

#more-info.animate-boarding,
#unseen-button.animate-boarding,
#add-to-list-button.animate-boarding {
  position: relative;
  z-index: 1001;
  outline: 2px solid var(--primary);
  outline-offset: -4px;
}

</style>
