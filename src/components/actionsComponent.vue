<script lang="ts" setup>
const emit = defineEmits(["markAsNotSeen", "showMoreInfo", "addToList"]);
const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div class="flex justify-center">
    <div class="inline-flex w-full max-w-sm overflow-hidden rounded-b-2xl">
      <button id="more-info" :disabled="loading"
        class="flex-1 h-16 bg-accent cursor-pointer hover:brightness-120 flex items-center justify-center border-r border-white/10 transition-all active:bg-accent/80"
        @mousedown.stop @touchstart.stop @click.stop="emit('showMoreInfo')"
        :aria-label="$t('actions.showMoreInfo')">
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
        @mousedown.stop
        @touchstart.stop
        @click.stop="emit('addToList')"
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
