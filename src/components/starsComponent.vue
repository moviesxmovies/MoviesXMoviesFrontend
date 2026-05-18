<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from "vue";
const focusedRating = ref(0);
const starsContainer = ref<HTMLElement | null>(null);
const poppingStars = ref<boolean[]>([false, false, false, false, false]);
const poppingActive = ref<boolean[]>([false, false, false, false, false]);
const popTimeouts = ref<ReturnType<typeof setTimeout>[]>([]);
const STAR_STAGGER = 60;
const STAR_POP_MS = 350;
const isAnimating = computed(() => poppingStars.value.some(Boolean));
const props = defineProps<{ loading: boolean; actualRating?: number }>();
const emit = defineEmits(["rateMovie"]);

function clearPopTimeouts() {
  popTimeouts.value.forEach(clearTimeout);
  popTimeouts.value = [];
  poppingStars.value = [false, false, false, false, false];
  poppingActive.value = [false, false, false, false, false];
}

function animateRating(rating: number) {
  clearPopTimeouts();
  for (let i = 1; i <= rating; i++) {
    const onDelay = (i - 1) * STAR_STAGGER;
    const offDelay = onDelay + STAR_POP_MS;
    popTimeouts.value.push(
      setTimeout(() => { poppingStars.value[i - 1] = true; poppingActive.value[i - 1] = true; }, onDelay),
      setTimeout(() => { poppingStars.value[i - 1] = false; poppingActive.value[i - 1] = false; }, offDelay),
    );
  }
}

defineExpose({ triggerAnimation: animateRating });
// ─── handlers ────────────────────────────────────────────────────────────────
const handleMouseEnter = (rating: number) => {
  if (isAnimating.value) return;
  focusedRating.value = rating;
};
const handleMouseLeave = () => { focusedRating.value = 0; };

const handleTouchMove = (event: TouchEvent) => {
  if (!starsContainer.value) return;
  const touch = event.touches[0];
  if (!touch) return;
  const rect = starsContainer.value.getBoundingClientRect();
  const rating = Math.min(5, Math.max(0, Math.ceil((touch.clientX - rect.left) / rect.width * 5)));
  focusedRating.value = rating;
};

const rateMovie = (rating: number) => {
  handleMouseLeave();
  if (rating === 0) return;
  emit("rateMovie", rating);
  animateRating(rating);
};

const isActive = (i: number) => {
  if (isAnimating.value) return false;
  const display = focusedRating.value || props.actualRating || 0;
  return i <= display;
};

onUnmounted(clearPopTimeouts);

watch(() => props.loading, (val) => {
  if (val && popTimeouts.value.length === 0) clearPopTimeouts();
});

</script>
<template>
  <div ref="starsContainer" class="touch-none select-none flex justify-center transition-opacity duration-300 relative"
    :class="loading ? 'opacity-40 pointer-events-none' : 'opacity-100'" @mouseleave="handleMouseLeave"
    @touchend.prevent="rateMovie(focusedRating)" @touchmove.prevent="handleTouchMove">
    <i v-for="i in 5" :key="i" class="pi text-5xl mx-2 star-icon" :class="[
      (isActive(i) || poppingActive[i - 1]) ? 'pi-star-fill active' : 'pi-star',
      { 'cursor-pointer': !loading },
      { 'star-pop': poppingStars[i - 1] },
    ]" @mouseenter="!loading && handleMouseEnter(i)" @click="!loading && rateMovie(i)" />
  </div>
</template>
<style scoped>
.star-icon {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease;
  color: var(--primary);
}

.pi-star-fill.active {
  color: var(--yellow);
  transform: scale(1.15);
  text-shadow: 0 0 12px color-mix(in srgb, var(--yellow) 60%, transparent);
}

.star-pop {
  animation: star-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes star-pop {
  0% {
    transform: scale(1.15);
    color: var(--yellow);

  }

  50% {
    transform: scale(1.6);
  }

  100% {
    transform: scale(1.15);
  }
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
