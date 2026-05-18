<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  getRecommendedMovies,
  setAsNotSeen,
  submitRating,
} from "@/repositories/movieRepository";
import type { Movie } from "@/types";
import MovieComponent from "@/components/movieComponent.vue";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import StarsComponent from "@/components/starsComponent.vue";
import { useLangStore } from "@/stores/langStore";
import ActionsComponent from "@/components/actionsComponent.vue";
import DraggeableComponent from "@/components/draggeableComponent.vue";
import MovieInfoDrawer from "@/components/movieInfoDrawer.vue";
import AddToListDialog from "@/components/addToListDialog.vue";
import KeyboardShorcuts, {
  type DropdownOption,
} from "@/components/keyboardShorcuts.vue";
import FriendsRatingsComponent from "@/components/friendsRatingsComponent.vue";

const PREDICTED_COLORS: Record<string, string> = {
  right: "var(--yellow)",
  left: "var(--red)",
  up: "var(--primary)",
  down: "var(--gray)",
};
const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const movies = ref<Movie[]>([] as Movie[]);
const movieIndex = ref(0);
const langStore = useLangStore();
const direction = ref<string>("");
const isDragging = ref<boolean>(false);
const visibleDrawer = ref<boolean>(false);
const visibleDialog = ref<boolean>(false);
const glowEl = ref<HTMLElement | null>(null);
const swipeEl = ref<HTMLElement | null>(null);
let rafId: number | null = null;

const actualMovie = computed(() => {
  return movies.value.length > 0 ? movies.value[movieIndex.value] : null;
});

onMounted(async () => {
  await fetchMovies();
  prefetchImage(movieIndex.value);
});

const fetchMovies = async () => {
  if (loading.value) return;
  if (movies.value.length === 0) loading.value = true;
  try {
    movies.value = await getRecommendedMovies();
    movieIndex.value = 0;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("home.fetchMoviesError"),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const showNextRecommendedMovie = async () => {
  if (movies.value.length > movieIndex.value && !loading.value) {
    movieIndex.value++;
  }
  if (movies.value.length <= movieIndex.value + 1 && !loading.value) {
    await fetchMovies();
  }
};

const prefetchImage = (newIndex: number) => {
  const nextMovie = movies.value[newIndex + 1];
  if (nextMovie) {
    const img = new Image();
    img.src = nextMovie.cover;
  }
};

watch(movieIndex, (newIndex) => {
  prefetchImage(newIndex);
});

watch(
  () => langStore.language,
  async (newLang, oldLang) => {
    if (newLang !== oldLang) {
      movies.value = [];
      await fetchMovies();
    }
  },
);
watch(direction, (newDir) => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => updateGlow(newDir));
});


watch(isDragging, (dragging) => {
  glowEl.value = glowEl.value ?? document.getElementById('glow-container');
  swipeEl.value = swipeEl.value ?? document.getElementById('mainSwipe');

  const value = dragging ? 'transform, opacity' : 'auto';
  glowEl.value?.style.setProperty('will-change', value);
  swipeEl.value?.style.setProperty('will-change', value);
});

const updateGlow = (dir: string) => {
  const el = glowEl.value;
  if (!el) return;

  if (!dir) {
    el.style.setProperty('--glow-opacity', '0');
    el.style.transform = 'scale(0.95)';
    return;
  }

  const color = PREDICTED_COLORS[dir];
  el.style.setProperty('--glow-color', color ?? 'transparent');
  el.style.setProperty('--glow-opacity', '1');
  el.style.transform = 'scale(1.04)';
};


const markAsNotSeen = async () => {
  loading.value = true;
  if (navigator.vibrate) navigator.vibrate(100);
  if (actualMovie.value) {
    await setAsNotSeen(actualMovie.value.slug);
  }
  loading.value = false;
  showNextRecommendedMovie();
};

const rateMovie = async (rating: number) => {
  if (rating === 0) return;
  loading.value = true;
  if (navigator.vibrate) navigator.vibrate(100);
  if (actualMovie.value) {
    await submitRating(actualMovie.value.slug, rating);
  }
  loading.value = false;
  showNextRecommendedMovie();
};

const shortcuts = [
  {
    label: t("shortcuts.alternateInfo"),
    icon: "i-heroicons-information-circle-solid",
    handler: () => (visibleDrawer.value = !visibleDrawer.value),
    shortcut: "space",
  },
  {
    label: t("shortcuts.addToList"),
    icon: "i-heroicons-plus-solid",
    handler: () => (visibleDialog.value = !visibleDialog.value),
    shortcut: "w",
  },
  {
    label: t("shortcuts.markAsNotSeen"),
    icon: "i-heroicons-eye-slash-solid",
    handler: markAsNotSeen,
    shortcut: "s",
  },
  {
    label: t("shortcuts.rateNStars", { n: 5 }),
    icon: "i-heroicons-star-solid",
    handler: () => rateMovie(5),
    shortcut: "d",
  },
  {
    label: t("shortcuts.rateNStars", { n: 1 }),

    icon: "i-heroicons-thumb-down-solid",
    handler: () => rateMovie(1),
    shortcut: "a",
  },
] as DropdownOption[];

for (let i = 1; i <= 5; i++) {
  shortcuts.push({
    label: t("shortcuts.rateNStars", { n: i }),
    icon: `i-heroicons-${i}-solid`,
    handler: () => rateMovie(i),
    shortcut: `${i}`,
  });
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center overflow-hidden fixed inset-0"
    :class="isDragging && 'z-50'">
    <KeyboardShorcuts :options="shortcuts" />
    <FriendsRatingsComponent v-if="actualMovie" :movieSlug="actualMovie.slug" />
    <MovieInfoDrawer v-model:visible="visibleDrawer" :movie="actualMovie || ({} as Movie)" />
    <AddToListDialog v-model:visible="visibleDialog" :movie="actualMovie || ({} as Movie)" />
    <div v-if="loading || actualMovie" class="overflow-visible min-w-screen px-14 md:px-0">
      <DraggeableComponent :swipeThreshold="100" @right="rateMovie(5)" @left="rateMovie(1)"
        @up="() => (visibleDialog = true)" @down="markAsNotSeen" v-model:direction="direction"
        v-model:isDragging="isDragging">
        <div id="mainSwipe">
          <MovieComponent class="select-none" :movie="actualMovie || ({} as Movie)" :loading="loading" />
          <ActionsComponent class="select-none" :loading="loading" :movie="actualMovie || ({} as Movie)"
            @markAsNotSeen="markAsNotSeen" @showMoreInfo="() => (visibleDrawer = !visibleDrawer)"
            @addToList="() => (visibleDialog = !visibleDialog)" />
        </div>
      </DraggeableComponent>
      <div class="icon-container mb-7 px-14 md:px-0">
        <div class="icon-grid">
          <div class="cell top" :class="direction == 'down' && 'active-icon'">
            <i class="pi pi-eye-slash text-3xl"></i>
          </div>

          <div class="cell left" :class="direction == 'right' && 'active-icon'">
            <i class="pi pi-star-fill text-3xl"></i>
          </div>

          <div class="cell right" :class="direction == 'left' && 'active-icon'">
            <i class="pi pi-thumbs-down-fill text-3xl"></i>
          </div>

          <div class="cell bottom" :class="direction == 'up' && 'active-icon'">
            <i class="pi pi-plus-circle text-3xl"></i>
          </div>
        </div>
      </div>
      <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mb-7 px-14 md:px-0">
        <div ref="glowEl" class="glow-container w-full max-w-sm aspect-[3/5] rounded-3xl" id="glow-container" />
      </div>
      <div class="flex justify-center mt-4 relative z-">
        <StarsComponent id="stars" :loading="loading" @rateMovie="rateMovie" />
      </div>
    </div>
    <div v-else>No movies found.</div>
  </div>
</template>

<style>
#mainSwipe,
.cell,
.star-icon {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.glow-container {
  --glow-color: transparent;
  --glow-opacity: 0;

  position: absolute;
  background: radial-gradient(circle,
      transparent 10%,
      color-mix(in srgb, var(--glow-color) 25%, transparent) 100%);
  border: 3px solid var(--glow-color);
  box-shadow: inset 0 0 15px color-mix(in srgb, var(--glow-color) 40%, transparent);
  opacity: var(--glow-opacity);
  transform: scale(0.95);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.3s ease-in;
  will-change: auto;
  contain: paint;
}

.active-icon {
  opacity: 1 !important;
  transform: scale(1.4) translateZ(0);
  text-shadow:
    0 0 10px var(--glow-color),
    0 0 20px var(--glow-color),
    0 1px 2px rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

#mainSwipe.animate-boarding {
  z-index: 1001;
  animation: swipe-tutorial 8s ease-in-out infinite;
}

@keyframes swipe-tutorial {

  0%,
  10%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0);
  }

  15%,
  25% {
    transform: translate3d(60px, 5px, 0) rotate(4deg);
  }

  30%,
  35% {
    transform: translate3d(0, 0, 0) rotate(0);
  }

  40%,
  50% {
    transform: translate3d(-60px, 5px, 0) rotate(-4deg);
  }

  55%,
  60% {
    transform: translate3d(0, 0, 0) rotate(0);
  }

  65%,
  75% {
    transform: translate3d(0, -60px, 0) scale(0.98);
  }

  80%,
  85% {
    transform: translate3d(0, 0, 0) rotate(0);
  }

  90%,
  98% {
    transform: translate3d(0, 60px, 0) scale(1.02);
  }
}

.overflow-visible:has(#mainSwipe.animate-boarding) #glow-container {
  animation: glow-tutorial 8s ease-in-out infinite !important;
  filter: blur(1px);
}

@keyframes glow-tutorial {

  0%,
  12%,
  28%,
  37%,
  53%,
  62%,
  78%,
  87%,
  100% {
    opacity: 0;
    transform: scale(0.95);
    border: 3px solid transparent;
  }

  /* Like - Yellow */
  15%,
  25% {
    opacity: 0.7;
    transform: scale(1.04);
    background: radial-gradient(circle, transparent 10%, color-mix(in srgb, var(--yellow) 25%, transparent) 100%);
    border: 3px solid var(--yellow);
    box-shadow: 0 0 15px var(--yellow);
  }

  /* Dislike - Red */
  40%,
  50% {
    opacity: 0.7;
    transform: scale(1.04);
    background: radial-gradient(circle, transparent 10%, color-mix(in srgb, var(--red) 25%, transparent) 100%);
    border: 3px solid var(--red);
    box-shadow: 0 0 15px var(--red);
  }

  /* Up - Azul/Primary */
  65%,
  75% {
    opacity: 0.7;
    transform: scale(1.04);
    background: radial-gradient(circle, transparent 10%, color-mix(in srgb, var(--primary) 25%, transparent) 100%);
    border: 3px solid var(--primary);
    box-shadow: 0 0 15px var(--primary);
  }

  /* Down - Gris */
  90%,
  98% {
    opacity: 0.7;
    transform: scale(1.04);
    background: radial-gradient(circle, transparent 10%, color-mix(in srgb, var(--gray) 25%, transparent) 100%);
    border: 3px solid var(--gray);
    box-shadow: 0 0 15px var(--gray);
  }
}

@keyframes icon-left-tutorial {

  15%,
  25% {
    opacity: 1;
    transform: scale(1.4);
    color: var(--text);
  }

  0%,
  14%,
  26%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
}

@keyframes icon-right-tutorial {

  40%,
  50% {
    opacity: 1;
    transform: scale(1.4);
    color: var(--text);
  }

  0%,
  39%,
  51%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
}

@keyframes icon-bottom-tutorial {

  65%,
  75% {
    opacity: 1;
    transform: scale(1.4);
    color: var(--text);
  }

  0%,
  64%,
  76%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
}

@keyframes icon-top-tutorial {

  90%,
  98% {
    opacity: 1;
    transform: scale(1.4);
    color: var(--text);
  }

  0%,
  89%,
  99%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
}

#stars.animate-boarding {
  position: relative;
  z-index: 1001;
  background: rgba(var(--primary-rgb), 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 2px dashed var(--yellow);
  display: flex;
  justify-content: center;
  min-height: 4rem;
}

.animate-boarding .star-icon {
  display: inline-block !important;
  color: var(--primary);
  animation: star-fill-sweep 2.5s alternate infinite ease-in-out !important;
}

.animate-boarding .star-icon:before {
  display: inline-block;
  animation: icon-change 2.5s infinite ease-in-out;
}

.animate-boarding .star-icon:nth-child(1) {
  animation-delay: 0s;
}

.animate-boarding .star-icon:nth-child(2) {
  animation-delay: 0.2s;
}

.animate-boarding .star-icon:nth-child(3) {
  animation-delay: 0.4s;
}

.animate-boarding .star-icon:nth-child(4) {
  animation-delay: 0.6s;
}

.animate-boarding .star-icon:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes star-fill-sweep {

  0%,
  100% {
    color: var(--primary);
    transform: translate3d(0, 0, 0) scale(1);
  }

  30%,
  70% {
    color: var(--yellow);
    transform: translate3d(0, 0, 0) scale(1.15);
  }
}

@keyframes icon-change {

  0%,
  100%,
  20%,
  80% {
    content: "\e937";
  }

  30%,
  70% {
    content: "\e936";
  }
}

.animate-boarding .star-icon:nth-child(1):before {
  animation-delay: 0s;
}

.animate-boarding .star-icon:nth-child(2):before {
  animation-delay: 0.2s;
}

.animate-boarding .star-icon:nth-child(3):before {
  animation-delay: 0.4s;
}

.animate-boarding .star-icon:nth-child(4):before {
  animation-delay: 0.6s;
}

.animate-boarding .star-icon:nth-child(5):before {
  animation-delay: 0.8s;
}

.icon-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  margin-bottom: 1.75rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 85vw;
  max-width: 24rem;
  aspect-ratio: 3 / 5;
  border-radius: 1.5rem;
  transition: transform 0.5s ease-out;
}

.cell {
  display: flex;
  color: var(--text);
  font-size: 2rem;
  transition:
    transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.3s ease,
    color 0.3s ease;
  opacity: 0.15;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.cell.top {
  grid-column: 2;
  grid-row: 1;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2rem;
}

.cell.left {
  grid-column: 1;
  grid-row: 2;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2rem;
}

.cell.right {
  grid-column: 3;
  grid-row: 2;
  align-items: center;
  justify-content: flex-end;
  padding-right: 2rem;
}

.cell.bottom {
  grid-column: 2;
  grid-row: 3;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2rem;
}

.animate-boarding .cell.left {
  animation: icon-left-tutorial 8s infinite;
}

.animate-boarding .cell.right {
  animation: icon-right-tutorial 8s infinite;
}

.animate-boarding .cell.bottom {
  animation: icon-bottom-tutorial 8s infinite;
}

.animate-boarding .cell.top {
  animation: icon-top-tutorial 8s infinite;
}

.w-full.max-w-sm.aspect-\[3\/5\] {
  max-width: 85vw;

  @media (min-width: 640px) {
    max-width: 24rem;
  }
}
</style>
