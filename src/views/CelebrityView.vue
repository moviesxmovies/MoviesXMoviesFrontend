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

const genderMap: Record<string, { color: string; icon: string }> = {
  "0": { color: "var(--secondary)", icon: "pi pi-minus" },
  "1": { color: "var(--accent)", icon: "pi pi-venus" },
  "2": { color: "var(--primary)", icon: "pi pi-mars" },
};

const genderIcon = computed(
  () => genderMap[user.value.gender]?.icon ?? "pi pi-question",
);

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
              color: '#fff',
              borderRadius: '8px',
            }" />
          </div>

          <div class="card-body">
            <h1 class="celebrity-name">{{ user.name }}</h1>
            <div class="dates">
              <div v-if="user.birthday" class="date-row">
                <i class="pi pi-calendar accent-icon" />
                <span><b>{{ t("celebrity.birthday") }}:</b>
                  {{ user.birthday }}</span>
              </div>
              <div v-if="user.deathday" class="date-row">
                <i class="pi pi-heart-fill death-icon" />
                <span><b>{{ t("celebrity.deathday") }}:</b>
                  {{ user.deathday }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Accordion value="0" class="content">
        <AccordionPanel value="0" class="section">
          <AccordionHeader class="section-header">
            <i class="pi pi-book accent-icon" />
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
}

:deep(.p-accordioncontent-content) {
  all: unset;
}

/* ── Page ──────────────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: "Inter", sans-serif;
  padding: 1rem;
}

@media (min-width: 768px) {
  .page {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .page {
    padding: 2.5rem;
  }
}

/* ── Layout ────────────────────────────────────────────── */
.layout {
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 3fr;
  }

  .sidebar {
    order: 1;
  }

  .content {
    order: 2;
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 3fr;
  }
}

/* ── Sidebar ───────────────────────────────────────────── */
.sidebar {
  width: 100%;
}

.card {
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid var(--secondary);
  background: var(--background);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.sticky-card {
  position: sticky;
  top: 1.5rem;
}

.card-image {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--secondary);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.gender-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 10px !important;
  font-weight: 900 !important;
  padding: 0.25rem 0.75rem !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.celebrity-name {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--primary);
  margin: 0;
}

.dates {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--gray);
}

.date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.accent-icon {
  color: var(--accent);
}

.death-icon {
  color: #ef4444;
}

/* ── Main content ──────────────────────────────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Section ───────────────────────────────────────────── */
.section {
  border-radius: 1.5rem;
  border: 1px solid var(--secondary);
  background: var(--background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--secondary);
  background: rgba(255, 255, 255, 0.05);
}

.section-title {
  font-weight: 900;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
  margin: 0;
}

.section-body {
  padding: 1.5rem;
}

/* ── Biography ─────────────────────────────────────────── */
.biography {
  font-size: 0.95rem;
  line-height: 1.75;
  white-space: pre-line;
  font-weight: 300;
  margin: 0;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--gray);
  font-style: italic;
  margin: 0;
}
</style>
