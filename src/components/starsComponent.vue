<script lang="ts" setup>
import { ref } from "vue";

const focusedRating = ref(0);
const starsContainer = ref<HTMLElement | null>(null);
const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits(["rateMovie"]);

const handleMouseEnter = (rating: number) => {
  focusedRating.value = rating;
};

const handleMouseLeave = () => {
  focusedRating.value = 0;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!starsContainer.value) return;

  const touch = event.touches[0];

  if (touch) {
    const rect = starsContainer.value.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const progress = x / rect.width;

    let rating = Math.ceil(progress * 5);

    if (rating < 0) rating = 0;
    if (rating > 5) rating = 0;

    focusedRating.value = rating;
  }
};

const rateMovie = async (rating: number) => {
  emit("rateMovie", rating);
  handleMouseLeave();
};
</script>

<template>
  <div
    ref="starsContainer"
    class="touch-none select-none flex justify-center transition-opacity duration-300"
    :class="loading ? 'opacity-40 pointer-events-none' : 'opacity-100'"
    @mouseleave="handleMouseLeave"
    @touchend.prevent="rateMovie(focusedRating)"
    @touchmove.prevent="handleTouchMove"
  >
    <i
      v-for="i in 5"
      :key="i"
      class="pi text-5xl mx-2 star-icon"
      :class="[
        i <= focusedRating ? 'pi-star-fill active' : 'pi-star',
        { 'cursor-pointer': !loading }
      ]"
      @mouseenter="!loading && handleMouseEnter(i)"
      @click="!loading && rateMovie(i)"
    />
  </div>
</template>

<style scoped>
.star-icon {
  transform: translateZ(0);
  will-change: transform, color;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease;
  color: var(--primary); 
}

.pi-star-fill.active {
  color: var(--yellow);
  transform: scale(1.15);
  text-shadow: 0 0 12px color-mix(in srgb, var(--yellow) 60%, transparent);
}

@media (hover: hover) {
  .star-icon:hover {
    transform: scale(1.2);
    color: var(--yellow);
  }
}

:deep(.animate-boarding) .star-icon {
  text-shadow: none;
}
</style>
