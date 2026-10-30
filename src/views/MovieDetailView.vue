<script lang="ts" setup>
import { getMovie, getMovieReviews, getRating, submitRating, updateRating } from "@/repositories/movieRepository";
import type { Movie, Review, Person } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Skeleton,
  useToast,
} from "primevue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useLangStore } from "@/stores/langStore";
import { usePaginatedFetch } from "@/composables/usePaginatedFetch";
import { useInfinitePagination } from "@/composables/useInfinitePagination";
import ReviewComponent from "@/components/reviewComponent.vue";
import SectionAccordion from "@/components/sectionAccordion.vue";
import { api } from "@/composables/useAPI";
import AddReviewDialog from "@/components/addReviewDialog.vue";
import { useDate } from "@/composables/useDate";
import AddToListDialog from "@/components/addToListDialog.vue";
import StarsComponent from "@/components/starsComponent.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const langStore = useLangStore();
const { formatRelativeTime } = useDate();

const movie = ref<Movie>({} as Movie);
const loadingMovie = ref(false);
const actors = ref<Person[]>([]);
const directors = ref<Person[]>([]);
const loadingActors = ref(false);
const loadingDirectors = ref(false);
const loadingStars = ref(false);
const userRating = ref(0);

const addReviewDialogVisible = ref(false);
const addToListDialogVisible = ref(false);

const isMobile = ref(window.innerWidth < 640);
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

const {
  data: reviews,
  loading: loadingReviews,
  fetch: fetchReviews,
  reset: resetReviews,
} = usePaginatedFetch<Review>();

const fetchMovieDetail = async () => {
  const { slug } = route.params;
  if (!slug) return;
  loadingMovie.value = true;
  try {
    const movieData = await getMovie(slug as string);
    movie.value = movieData;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("movie.error.fetchingMovie"),
    });
    router.push({ name: "NotFound" });
  } finally {
    loadingMovie.value = false;
  }
};

const fetchPersonDetails = async (
  list: string[],
  target: typeof actors,
  loadingRef: typeof loadingActors,
) => {
  if (!list?.length) return;
  loadingRef.value = true;
  target.value = [];
  for (const url of list) {
    try {
      const { data } = await api.get(url);
      target.value.push(data);
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: t("toast.error"),
        detail:
          error.response?.data?.message || t("movie.error.fetchingPerson"),
      });
    }
  }
  loadingRef.value = false;
};

const fetchMovieReviews = (lastId?: number) =>
  fetchReviews((id) => getMovieReviews(movie.value.slug, id), lastId);

const { sentinelRef: reviewsSentinelRef } = useInfinitePagination(
  reviews,
  loadingReviews,
  fetchMovieReviews,
);
const rateMovie = async (rating: number) => {
  if (rating === 0) return;
  loadingStars.value = true;
  if (navigator.vibrate) navigator.vibrate(100);
  if (movie.value) {
    if (userRating.value) {
      updateRating(movie.value.slug, rating);
    } else {
      submitRating(movie.value.slug, rating);
    }
    userRating.value = rating;

  }
  loadingStars.value = false;
};
const fetchRating = async () => {
  if (!movie.value) return;
  try {
    const { rating } = await getRating(movie.value.slug);

    userRating.value = rating;
  } catch (error: any) {
    console.error("Error fetching rating:", error);
  }
};


const reviewDialogConfig = {
  icon: "pi pi-plus",
  label: t("movie.add_review"),
  onClick: () => (addReviewDialogVisible.value = true),
};


watch(
  () => movie.value,
  async (m) => {
    if (!m?.actors) return;
    await Promise.all([
      fetchPersonDetails(m.actors, actors, loadingActors),
      fetchPersonDetails(m.directors, directors, loadingDirectors),
      fetchRating(),
    ]);
  },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});

watch(
  () => [route.params.slug, langStore.language],
  async () => {
    resetReviews();
    actors.value = [];
    directors.value = [];
    await fetchMovieDetail();
    fetchMovieReviews();
  },
  { immediate: true },
);
</script>

<template>
  <AddReviewDialog v-model:visible="addReviewDialogVisible" :movieSlug="movie.slug" @reload="
    () => {
      resetReviews();
      fetchMovieReviews();
    }
  " />
  <AddToListDialog v-model:visible="addToListDialogVisible" :movie="movie" class="card-section" />

  <div class="page">
    <div class="layout">
      <!-- Movie Details -->
      <aside class="sidebar">
        <div class="card">
          <template v-if="loadingMovie">
            <div class="card-image">
              <Skeleton width="100%" height="100%" />
            </div>
            <div class="card-body">
              <Skeleton width="120px" height="20px" border-radius="8px" />
              <Skeleton width="60px" height="20px" border-radius="8px" />
            </div>
          </template>
          <template v-else>
            <div class="card-image">
              <img :src="movie.cover" :alt="movie.title" class="card-img" />
            </div>
            <div class="card-body ticket-tear">
              <div class="movie-info-group">
                <h1 class="movie-title">{{ movie.title }}</h1>
                <span class="movie-year">
                  {{ formatRelativeTime(movie.release_date) }}
                </span>
              </div>

              <button class="btn-add-list" @click="addToListDialogVisible = true">
                <i class="pi pi-bookmark" aria-hidden="true" />
                <span>{{ t("movie.add_to_list") }}</span>
              </button>
            </div>
            <div class="card-section">
              <span class="card-section__label">{{ t("movie.yourRating") }}</span>
              <StarsComponent id="stars" class="rating-stars" :loading="loadingMovie" @rateMovie="rateMovie"
                :actualRating="userRating" />
            </div>
            <div v-if="movie.platforms?.length" class="card-section">
              <span class="card-section__label">{{
                t("movie.platforms", movie.platforms.length)
              }}</span>
              <div class="platforms-list">
                <RouterLink v-for="platform in movie.platforms" :key="platform.id"
                  :to="`/search?platforms=${platform.slug}`" class="platform-item">
                  <img :src="platform.image" :alt="platform.name" class="platform-item__img" />
                  <span class="platform-item__name">{{ platform.name }}</span>
                </RouterLink>
              </div>
            </div>
            <div v-if="movie.genres?.length" class="card-section">
              <span class="card-section__label">{{
                t("movie.genres", movie.genres.length)
              }}</span>
              <div class="genre-list">
                <RouterLink v-for="genre in movie.genres" :key="genre.id" :to="`/search?genres=${genre.slug}`"
                  class="genre-tag">
                  {{ genre.name }}
                </RouterLink>
              </div>
            </div>


          </template>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="content">
        <!-- SYNOPSIS -->
        <Accordion value="0">
          <AccordionPanel value="0" class="section">
            <AccordionHeader class="section-header">
              <span class="section-icon" aria-hidden="true"><i class="pi pi-align-left" /></span>
              <h2 class="section-title">{{ t("movie.synopsis") }}</h2>
            </AccordionHeader>
            <AccordionContent class="section-body">
              <p v-if="movie.synopsis" class="synopsis">{{ movie.synopsis }}</p>
              <p v-else class="empty-text">{{ t("movie.no_synopsis") }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>

        <!-- REVIEWS -->
        <SectionAccordion icon="pi pi-file-word accent-icon" :title="t('movie.reviews')"
          :isEmpty="!reviews.results?.length" :emptyIcon="'pi pi-file-word'" :emptyTitle="t('movie.no_reviews')"
          :emptyDescription="t('movie.no_reviews_description')" :dialog-options="reviewDialogConfig"
          :loading="loadingReviews" v-model:sentinelRef="reviewsSentinelRef" defaultOpen>
          <ReviewComponent v-for="review in reviews.results" :key="review.id" :review="review" @deleted="
            () => {
              resetReviews();
              fetchMovieReviews();
            }
          " @reload="
            () => {
              resetReviews();
              fetchMovieReviews();
            }
          " />
        </SectionAccordion>
      </div>

      <!-- CAST SECTION -->
      <div class="content cast-section">
        <!-- ACTORS -->
        <SectionAccordion icon="pi pi-users accent-icon" :title="t('movie.actors', actors.length)"
          :isEmpty="!actors.length" :emptyIcon="'pi pi-users'" :emptyTitle="t('movie.no_actors')"
          :emptyDescription="t('movie.no_actors_description')" :loading="loadingActors">
          <div class="person-grid">
            <RouterLink v-for="actor in actors" :key="actor.id" :to="`/profiles/${actor.slug}`" class="person-item">
              <div class="person-item__avatar">
                <img :src="actor.image" :alt="actor.name" class="person-item__img" />
              </div>
              <span class="person-item__name">{{ actor.name }}</span>
            </RouterLink>
          </div>
        </SectionAccordion>

        <!-- DIRECTORS -->
        <SectionAccordion icon="pi pi-video accent-icon" :title="t('movie.directors', directors.length)"
          :isEmpty="!directors.length" :emptyIcon="'pi pi-video'" :emptyTitle="t('movie.no_directors')"
          :emptyDescription="t('movie.no_directors_description')" :loading="loadingDirectors">
          <div class="person-grid">
            <RouterLink v-for="director in directors" :key="director.id" :to="`/profiles/${director.slug}`"
              class="person-item">
              <div class="person-item__avatar">
                <img :src="director.image" :alt="director.name" class="person-item__img" />
              </div>
              <span class="person-item__name">{{ director.name }}</span>
            </RouterLink>
          </div>
        </SectionAccordion>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-accordionheader) {
  color: var(--text);
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
}

:deep(.p-accordionheader:hover) {
  background: var(--surface-2) !important;
}

:deep(.p-accordionheader[aria-expanded="true"]) {
  border-bottom: 1px solid var(--border) !important;
}

:deep(.p-accordionheader-toggle-icon) {
  color: var(--text-subtle);
}

:deep(.p-accordionpanel) {
  border: none;
}

:deep(.p-accordioncontent-content) {
  all: unset;
}

.page {
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  padding: 5rem 1rem 2rem;
}

@media (min-width: 768px) {
  .page {
    padding: 5.25rem 1.5rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .page {
    padding: 5.5rem 2rem 3rem;
  }
}

.layout {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar {
  width: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: minmax(280px, 340px) 1fr;
  }

  .sidebar {
    order: 1;
    grid-row: span 2;
  }

  .content {
    order: 2;
  }

  .content.cast-section {
    order: 3;
  }
}

@media (min-width: 1280px) {
  .layout {
    grid-template-columns: minmax(300px, 340px) minmax(0, 1fr) minmax(260px, 320px);
  }

  .sidebar {
    grid-row: auto;
    position: sticky;
    top: 5rem;
  }
}

/* CARD */
.card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.card-image {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--surface-2);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
}

.card-section {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.card-section:last-child {
  border-bottom: none;
}

.card-section__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-subtle);
}

.movie-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.movie-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 500;
  margin: 0;
  text-wrap: balance;
}

.movie-year {
  font-size: 0.875rem;
  color: var(--text-subtle);
}

.btn-add-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 500;
  border: 1px solid transparent;
  background: var(--primary);
  color: var(--on-primary);
  cursor: pointer;
  transition:
    background-color 0.15s,
    transform 0.1s;
  white-space: nowrap;
}

.btn-add-list:hover {
  background: var(--primary-hover);
}

.btn-add-list:active {
  transform: scale(0.98);
}

.rating-stars {
  justify-content: flex-start !important;
}

.rating-stars :deep(.star-icon) {
  font-size: 2rem !important;
  margin: 0 0.25rem 0 0 !important;
}

/* SECTION */
.section {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem !important;
  min-height: 3.5rem;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  color: var(--text-subtle);
  font-size: 0.9375rem;
}

.section-title {
  flex: 1;
  text-align: left;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 1rem;
  color: var(--text);
  margin: 0;
}

.section-body {
  padding: 1.25rem;
}

/* SYNOPSIS */
.synopsis {
  font-size: 1rem;
  line-height: 1.75;
  white-space: pre-line;
  color: var(--text-muted);
  margin: 0;
  max-width: 70ch;
}

.empty-text {
  font-size: 0.9375rem;
  color: var(--text-subtle);
  margin: 0;
}

/* PLATFORMS */
.platforms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.platform-item__img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 8px;
  transition: border-color 0.15s;
}

.platform-item:hover .platform-item__img {
  border-color: var(--border-strong);
}

.platform-item__name {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: center;
  transition: color 0.15s;
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 100px;
}

.platform-item:hover .platform-item__name {
  color: var(--primary);
}

/* GENRES */
.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 0.25rem 0.75rem;
  text-decoration: none;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}

.genre-tag:hover {
  color: var(--primary);
  border-color: var(--border-strong);
  background: var(--primary-soft);
}

/* PERSON GRID */
.person-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 1rem 0.75rem;
}

.person-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.person-item__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border);
  background: var(--surface-2);
  transition: border-color 0.15s;
  flex-shrink: 0;
}

.person-item:hover .person-item__avatar {
  border-color: var(--border-strong);
}

.person-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-item__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  transition: color 0.15s;
}

.person-item:hover .person-item__name {
  color: var(--primary);
}
</style>
