<script lang="ts" setup>
const emit = defineEmits(["markAsNotSeen", "showMoreInfo"]);
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="flex justify-center">
    <div class="inline-flex w-full max-w-sm overflow-hidden rounded-b-2xl">
      <button
        id="more-info"
        :disabled="loading"
        class="flex-1 h-16 bg-accent cursor-pointer hover:brightness-120 flex items-center justify-center border-r border-white/10 transition-all active:bg-accent/80"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('showMoreInfo')"
      >
        <i class="pi pi-info-circle text-2xl text-white" />
      </button>

      <button
        id="unseen-button"
        :disabled="loading"
        :class="[
          'flex-1 h-16 cursor-pointer hover:bg-gray-500 flex items-center justify-center border-r border-white/10 transition-all active:bg-gray-700',
          loading
            ? 'bg-gray-600 opacity-40 pointer-events-none'
            : 'bg-gray-600',
        ]"
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('markAsNotSeen')"
      >
        <i class="pi pi-eye-slash text-2xl text-white" />
      </button>

      <button
        id="add-to-list-button"
        :disabled="loading"
        class="flex-1 h-16 bg-primary cursor-pointer hover:brightness-120 flex items-center justify-center transition-all active:bg-primary/80"
      >
        <i class="pi pi-plus-circle text-2xl text-white" />
      </button>
    </div>
  </div>
</template>

<style scoped>
#more-info.animate-boarding,
#unseen-button.animate-boarding,
#add-to-list-button.animate-boarding {
  position: relative;
  z-index: 1001;
  animation: button-pulse 0.8s alternate infinite ease-in-out;
}

@keyframes button-pulse {
  0% {
    outline-color: rgba(var(--accent-rgb), 0.2);
    filter: brightness(1);
  }
  100% {
    outline-color: var(--accent);
    filter: brightness(1.5);
    box-shadow: 0 0 15px var(--accent);
  }
}
</style>
