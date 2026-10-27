<script lang="ts" setup>
const emit = defineEmits(["markAsNotSeen", "showMoreInfo", "addToList"]);
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="flex justify-center">
    <div class="action-bar inline-flex w-full max-w-sm overflow-hidden rounded-2xl">
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
  border-radius: 0 0 1.5rem 1.5rem;
  background: var(--surface);
  box-shadow: var(--shadow-md);
  overflow: hidden;
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
  border-right: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 600;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  transform: scale(0.92);
}

.action-btn:disabled {
  opacity: 0.45;
  pointer-events: none;
}

.accent-btn { color: var(--accent); }
.neutral-btn { color: var(--text-muted); }
.primary-btn { color: var(--primary); }

@media (hover: hover) {
  .accent-btn:hover { background: var(--accent); color: var(--on-accent); }
  .neutral-btn:hover { background: var(--surface-hover); color: var(--text); }
  .primary-btn:hover { background: var(--primary); color: var(--on-primary); }
}

#more-info.animate-boarding,
#unseen-button.animate-boarding,
#add-to-list-button.animate-boarding {
  position: relative;
  z-index: 1001;
  animation: button-cinematic-pop 1.5s infinite;
}

#more-info.animate-boarding { background: var(--accent); color: var(--on-accent); }
#unseen-button.animate-boarding { background: var(--surface-hover); color: var(--text); }
#add-to-list-button.animate-boarding { background: var(--primary); color: var(--on-primary); }

@keyframes button-cinematic-pop {
  0%, 100% {
    transform: scale(1) translateZ(0);
  }
  50% {
    transform: scale(1.08) translateZ(0);
  }
}
</style>
