<script lang="ts" setup>
import {
  getPersonFilmography,
  getPersonProfile,
} from "@/repositories/userRepository";
import type { DynamicPagination, Movie, Person } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Tag,
  useToast,
} from "primevue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import FilmographyComponent from "@/components/filmographyComponent.vue";
import { useLangStore } from "@/stores/langStore";
import { useDate } from "@/composables/useDate";

const route = useRoute();
const user = ref<Person>({} as Person);
const loadingProfile = ref<boolean>(false);
const loadingActors = ref<boolean>(false);
const loadingDirectors = ref<boolean>(false);
const toast = useToast();
const { t } = useI18n();
const router = useRouter();
const acted_movies = ref<DynamicPagination<Movie>>({} as DynamicPagination<Movie>);
const directed_movies = ref<DynamicPagination<Movie>>({} as DynamicPagination<Movie>);
const langStore = useLangStore();
const { formatRelativeTime } = useDate();
const genderMap: Record<string, { color: string; icon: string }> = {
  "0": { color: "var(--secondary)", icon: "pi pi-minus" },
  "1": { color: "var(--accent)", icon: "pi pi-venus" },
  "2": { color: "var(--primary)", icon: "pi pi-mars" },
  "3": { color: "var(--secondary)", icon: "pi pi-question" },
};

const genderIcon = computed(
  () => genderMap[user.value.gender]?.icon ?? "pi pi-question",
);

const genderForeground = computed(() => {
  const bg = genderMap[user.value.gender]?.color ?? "var(--secondary)";
  if (bg.includes("--primary")) return "var(--on-primary)";
  if (bg.includes("--accent")) return "var(--on-accent)";
  return "var(--text)";
});

const genderBackground = computed(() => {
  return genderMap[user.value.gender]?.color ?? "var(--secondary)";
});

const fetchPersonProfile = async () => {
  const { slug } = route.params;
  loadingProfile.value = true;
  try {
    const profile = await getPersonProfile(slug as string);
    user.value = profile;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message || t("celebrity.error.fetchingProfile"),
    });
    router.push({ name: "NotFound" });
  } finally {
    loadingProfile.value = false;
  }
};

const fetchFilmography = async (
  type: "acted" | "directed",
  lastId?: number,
) => {
  try {
    if (type === "acted") {
      loadingActors.value = true;
    } else if (type === "directed") {
      loadingDirectors.value = true;
    }
    const movies = await getPersonFilmography(
      route.params.slug as string,
      type,
      lastId,
    );
    if (type === "acted") {
      if (!acted_movies.value.results) {
        acted_movies.value = movies;
        return;
      }
      acted_movies.value.results.push(...movies.results);
      acted_movies.value.next_last_id = movies.next_last_id;
    } else if (type === "directed") {
      if (!directed_movies.value.results) {
        directed_movies.value = movies;
        return;
      }
      directed_movies.value.results.push(...movies.results);
      directed_movies.value.next_last_id = movies.next_last_id;
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message || t("celebrity.error.fetchingMovies"),
    });
  } finally {
    if (type === "acted") {
      loadingActors.value = false;
    } else if (type === "directed") {
      loadingDirectors.value = false;
    }
  }
};

const { sentinelRef: actedSentinelRef } = useInfiniteScroll(async () => {
  if (loadingActors.value) return;
  loadingActors.value = true;
  const lastId = acted_movies.value.next_last_id;
  if (lastId) await fetchFilmography("acted", lastId);
  loadingActors.value = false;
});

const { sentinelRef: directedSentinelRef } = useInfiniteScroll(async () => {
  if (loadingDirectors.value) return;
  loadingDirectors.value = true;
  const lastId = directed_movies.value.next_last_id;
  if (lastId) await fetchFilmography("directed", lastId);
  loadingDirectors.value = false;
});

onMounted(async () => {
  await Promise.all([
    fetchPersonProfile(),
    fetchFilmography("acted"),
    fetchFilmography("directed"),
  ]);
});
watch(
  () => langStore.language, async (newLang, oldLang) => {
    if (newLang !== oldLang) {
      acted_movies.value = {} as DynamicPagination<Movie>;
      directed_movies.value = {} as DynamicPagination<Movie>;
      await fetchPersonProfile();
      await fetchFilmography("acted");
      await fetchFilmography("directed");
    }

  }
)
</script>

<template>
  <div class="page">
    <div class="layout">
      <aside class="sidebar">
        <div class="card sticky-card">
          <div class="card-image">
            <img :src="user.image" :alt="user.name" class="card-img" />
            <Tag :icon="genderIcon" class="gender-tag" :style="{
              background: `${genderBackground}`,
              color: genderForeground,
              borderRadius: '8px',
            }" />
          </div>

          <div class="card-body">
            <h1 class="celebrity-name">{{ user.name }}</h1>
            <div class="dates">
              <div v-if="user.birthday" class="date-row">
                <i class="pi pi-calendar accent-icon" aria-hidden="true" />
                <span><b>{{ t("celebrity.birthday") }}:</b>
                  {{ formatRelativeTime(user.birthday) }}</span>
              </div>
              <div v-if="user.deathday" class="date-row">
                <i class="pi pi-heart-fill death-icon" aria-hidden="true" />
                <span><b>{{ t("celebrity.deathday") }}:</b>
                  {{ formatRelativeTime(user.deathday) }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Accordion :value="(['0', 1, 2] as any)" multiple class="content">
        <AccordionPanel value="0" class="section">
          <AccordionHeader class="section-header">
            <span class="section-icon" aria-hidden="true"><i class="pi pi-book" /></span>
            <h2 class="section-title">{{ t("celebrity.biography") }}</h2>
          </AccordionHeader>
          <AccordionContent class="section-body">
            <p v-if="user.biography" class="biography">{{ user.biography }}</p>
            <p v-else class="empty-text">{{ t("celebrity.no_biography") }}</p>
          </AccordionContent>
        </AccordionPanel>

        <FilmographyComponent v-if="
          acted_movies.results?.length === 0 &&
          directed_movies.results?.length === 0
        " :empty="true" :index="1" :loading="loadingActors" :title="t('celebrity.filmography.acted_in')"
          v-model:sentinelRef="actedSentinelRef" />

        <FilmographyComponent :index="1" :list="acted_movies.results" :loading="loadingActors"
          :title="t('celebrity.filmography.acted_in')" v-model:sentinelRef="actedSentinelRef" />

        <FilmographyComponent :index="2" :list="directed_movies.results" :loading="loadingDirectors"
          :title="t('celebrity.filmography.directed')" v-model:sentinelRef="directedSentinelRef" />
      </Accordion>
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

@media (min-width: 768px) {
  .sidebar {
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

/* CELEBRITY */
.gender-tag {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  box-shadow: var(--shadow-md);
}

.celebrity-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: var(--text);
}

.dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.date-row b {
  color: var(--text);
  font-weight: 500;
}

.accent-icon {
  color: var(--text-subtle);
}

.death-icon {
  color: var(--text-subtle);
}

.biography {
  font-size: 1rem;
  line-height: 1.75;
  white-space: pre-line;
  color: var(--text-muted);
  margin: 0;
  max-width: 75ch;
}

.empty-text {
  font-size: 0.9375rem;
  color: var(--text-subtle);
  margin: 0;
}
</style>
