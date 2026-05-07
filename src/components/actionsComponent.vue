<script lang="ts" setup>
const emit = defineEmits(["markAsNotSeen", "showMoreInfo", "addToList"]);
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="flex justify-center">
    <div
      class="action-bar inline-flex w-full max-w-sm overflow-hidden rounded-b-2xl"
    >
      <button
        id="more-info"
        :disabled="loading"
        class="action-btn accent-btn"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('showMoreInfo')"
        :aria-label="$t('actions.showMoreInfo')"
      >
        <i class="pi pi-info-circle" />
      </button>

      <button
        id="unseen-button"
        :disabled="loading"
        :class="[
          'action-btn neutral-btn bg-gray-600',
          { 'opacity-40 pointer-events-none': loading },
        ]"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('markAsNotSeen')"
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
      >
        <i class="pi pi-plus-circle" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-bar {
  border: 1px solid var(--secondary);
}

.action-btn {
  flex: 1;
  height: 3.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    filter 0.15s ease,
    transform 0.1s ease;
  font-size: 1.2rem;
  color: white;
}

.action-btn:last-child {
  border-right: none;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.accent-btn {
  background: var(--accent);
}
.accent-btn:hover {
  filter: brightness(1.15);
}

.neutral-btn:hover {
  filter: brightness(1.1);
}

.primary-btn {
  background: var(--primary);
}
.primary-btn:hover {
  filter: brightness(1.15);
}

#more-info.animate-boarding,
#unseen-button.animate-boarding,
#add-to-list-button.animate-boarding {
  position: relative;
  z-index: 1001;
  animation: button-cinematic-pop 1.5s infinite;
  border-color: white !important;
}

@keyframes button-cinematic-pop {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    transform: scale(1.08);
    box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0);
    filter: brightness(1.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style>
