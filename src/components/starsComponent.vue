<script lang="ts" setup>
import { onUnmounted, ref, watch } from "vue";

const focusedRating = ref(0);
const starsContainer = ref<HTMLElement | null>(null);
const poppingStars = ref<boolean[]>([false, false, false, false, false]);
const popTimeouts = ref<ReturnType<typeof setTimeout>[]>([]);
const isAnimatingNow = ref(false);

const props = defineProps<{
  loading: boolean;
  actualRating?: number;
}>();

const emit = defineEmits(["rateMovie"]);
function clearPopTimeouts() {
  popTimeouts.value.forEach(clearTimeout);
  popTimeouts.value = [];
  poppingStars.value = [false, false, false, false, false];
}



function animateRating(rating: number) {
  clearPopTimeouts();
  for (let i = 1; i <= rating; i++) {
    const t1 = setTimeout(() => {
      poppingStars.value[i - 1] = true;
      const t2 = setTimeout(() => {
        poppingStars.value[i - 1] = false;
      }, 350);
      popTimeouts.value.push(t2);
    }, (i - 1) * 60);
    popTimeouts.value.push(t1);
  }
}







function triggerAnimation(rating: number) {
  animateRating(rating);
}

defineExpose({ triggerAnimation });

// ─── handlers ────────────────────────────────────────────────────────────────

const handleMouseEnter = (rating: number) => { focusedRating.value = rating; };
const handleMouseLeave = () => { focusedRating.value = 0; };

const handleTouchMove = (event: TouchEvent) => {
  if (!starsContainer.value) return;
  const touch = event.touches[0];
  if (touch) {
    const rect = starsContainer.value.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    let rating = Math.ceil((x / rect.width) * 5);
    if (rating < 0) rating = 0;
    if (rating > 5) rating = 0;
    focusedRating.value = rating;
  }
};

const rateMovie = async (rating: number) => {
  console.log("[stars] rateMovie — rating:", rating);
  emit("rateMovie", rating);
  animateRating(rating);
  handleMouseLeave();
};


const isActive = (i: number) => {
  const display = focusedRating.value > 0 ? focusedRating.value : (props.actualRating ?? 0);
  return i <= display;
};
onUnmounted(() => {
  console.log("[stars] onUnmounted — limpiando");
  clearPopTimeouts();
});
watch(() => props.loading, (val) => {
  console.log("[stars] loading cambió a:", val, "animando:", isAnimatingNow.value);
  if (val && !isAnimatingNow.value) clearPopTimeouts();
});


</script>

<template>
  <div ref="starsContainer" class="touch-none select-none flex justify-center transition-opacity duration-300 relative"
    :class="loading ? 'opacity-40 pointer-events-none' : 'opacity-100'" @mouseleave="handleMouseLeave"
    @touchend.prevent="rateMovie(focusedRating)" @touchmove.prevent="handleTouchMove">
    <i v-for="i in 5" :key="i" class="pi text-5xl mx-2 star-icon" :class="[
      isActive(i) ? 'pi-star-fill active' : 'pi-star',
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