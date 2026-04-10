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

const PREDICTED_COLORS: Record<string, string> = {
  right: "var(--accent)",
  left: "var(--primary)",
  up: "var(--primary)",
  down: "#6b7280",
};
const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const movies = ref<Movie[]>([] as Movie[]);
const movieIndex = ref(0);
const langStore = useLangStore();
const direction = ref<string>("");
const isDragging = ref<boolean>(false);

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
      detail: error.response?.data?.message || t("toast.home.fetchMoviesError"),
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

const glowStyle = computed(() => {
  const color = PREDICTED_COLORS[direction.value || ""] || "transparent";
  const isActive = !!direction.value;

  return {
    // We use a very soft border to define the edge of the neon
    border: isActive ? `2px solid ${color}` : "2px solid transparent",
    // Multiple shadows create the "glow" depth without looking like a solid block
    boxShadow: isActive
      ? `0 0 40px -10px ${color}, 0 0 100px -20px ${color}`
      : "none",
    // Very subtle inner glow
    backgroundColor: isActive ? `${color}` : "transparent",
    opacity: isActive ? 0.7 : 0,
    // Adding a slight scale effect makes it feel alive
    filter: "blur(2px)", // Softens the edges even more
  };
});

const markAsNotSeen = async () => {
  loading.value = true;
  if (actualMovie.value) {
    await setAsNotSeen(actualMovie.value.slug);
  }
  loading.value = false;
  showNextRecommendedMovie();
};

const rateMovie = async (rating: number) => {
  if (rating === 0) return;
  loading.value = true;
  if (actualMovie.value) {
    await submitRating(actualMovie.value.slug, rating);
  }
  loading.value = false;
  showNextRecommendedMovie();
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center overflow-hidden fixed inset-0" :class="isDragging && 'z-50'">
    <div v-if="loading || actualMovie" class="overflow-visible min-w-screen">
      <DraggeableComponent
        :swipeThreshold="100"
        @right="rateMovie(0)"
        @left="rateMovie(0)"
        @up="showNextRecommendedMovie"
        @down=""
        v-model:direction="direction"
        v-model:isDragging="isDragging"
      >
        <div id="mainSwipe">
          <MovieComponent
            class="select-none"
            :movie="actualMovie || ({} as Movie)"
            :loading="loading"
          />
          <ActionsComponent
            class="select-none"
            :loading="loading"
            @markAsNotSeen="markAsNotSeen"
          />
        </div>
      </DraggeableComponent>
      <div
        class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mb-7"
      >
        <div
          class="w-full max-w-sm aspect-[3/5] rounded-3xl transition-all duration-500 ease-out"
          :style="glowStyle"
        ></div>
      </div>
      <div class="flex justify-center mt-4 relative z-">
        <StarsComponent id="stars" :loading="loading" @rateMovie="rateMovie" />
      </div>
    </div>
    <div v-else>No movies found.</div>
  </div>
</template>

<style>
#mainSwipe.animate-boarding {
  z-index: 1001;
}

#stars.animate-boarding {
  position: relative;
  z-index: 1001;
  background: rgba(var(--primary-rgb), 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 2px dashed var(--accent);
}

.animate-boarding .star-icon {
  animation: star-fill-sweep 2.5s alternate infinite ease-in-out;
  position: relative;
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
    transform: scale(1);
  }
  30%,
  70% {
    color: var(--accent);
    transform: scale(1.15);
    filter: drop-shadow(0 0 10px var(--accent));
  }
}

.animate-boarding .star-icon.pi-star:before {
  animation: icon-change 2.5s infinite ease-in-out;
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
</style>
