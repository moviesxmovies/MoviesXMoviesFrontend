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
    :class="[
      'touch-none select-none flex justify-center transition-opacity duration-300',
      loading ? 'opacity-40 pointer-events-none' : 'opacity-100',
    ]"
    @contextmenu.prevent
    @mouseleave="handleMouseLeave"
    @touchend.prevent="rateMovie(focusedRating)"
    @touchmove.prevent="handleTouchMove"
  >
    <i
      v-for="i in 5"
      :key="i"
      :class="[
        'text-5xl mx-2 transition-all duration-200 star-icon',
        !loading ? 'cursor-pointer' : 'cursor-default',
        i <= focusedRating
          ? 'pi pi-star-fill text-accent focused-rating'
          : 'pi pi-star text-primary',
      ]"
      @mouseenter="!loading && handleMouseEnter(i)"
      @touchstart="!loading && handleMouseEnter(i)"
      @click="!loading && rateMovie(i)"
    />
  </div>
</template>

<style scoped>
.focused-rating {
  transform: scale(1.15);
  filter: drop-shadow(0 0 10px var(--accent));
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
  cursor: pointer;
  color: var(--accent) !important;
}

.pi-star-fill {
  transform: scale(1.1);
  display: inline-block;
}
</style>
