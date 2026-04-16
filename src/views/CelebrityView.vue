<script lang="ts" setup>
import { getUserProfile } from "@/repositories/userRepository";
import type { Movie, Person } from "@/types";
import { useToast } from "primevue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const user = ref<Person>({} as Person);
const loading = ref<boolean>(false);
const toast = useToast();
const { t } = useI18n();
const router = useRouter();
const acted_movies = ref<Movie[]>([]);
const directed_movies = ref<Movie[]>([]);

const genderMap: Record<number, { label: string; icon: string }> = {
  0: { label: t("profile.gender.unknown"), icon: "pi pi-minus" },
  1: { label: t("profile.gender.female"), icon: "pi pi-venus" },
  2: { label: t("profile.gender.male"), icon: "pi pi-mars" },
};

const genderLabel = computed(
  () => genderMap[user.value.gender]?.label ?? t("profile.gender.unknown"),
);
const genderIcon = computed(
  () => genderMap[user.value.gender]?.icon ?? "pi pi-question",
);

onMounted(async () => {
  const { slug } = route.params;
  loading.value = true;
  try {
    const profile = await getUserProfile(slug as string);
    user.value = profile;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("celebrity.error.fetching"),
    });
    router.push({ name: "NotFound" });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="layout">
      <!-- ─── ASIDE ─── -->
      <aside class="sidebar">
        <div class="card sticky-card">
          <div class="card-image">
            <img :src="user.image" :alt="user.name" class="card-img" />
            <Tag
              :value="genderLabel"
              :icon="genderIcon"
              class="gender-tag"
              :style="{
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '8px',
              }"
            />
          </div>

          <div class="card-body">
            <h1 class="celebrity-name">{{ user.name }}</h1>
            <div class="dates">
              <div class="date-row">
                <i class="pi pi-calendar accent-icon" />
                <span
                  ><b>{{ t("celebrity.birthday") }}:</b> {{ user.birthday }}</span
                >
              </div>
              <div v-if="user.deathday" class="date-row">
                <i class="pi pi-heart-fill death-icon" />
                <span
                  ><b>{{ t("celebrity.deathday") }}:</b> {{ user.deathday }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ─── MAIN ─── -->
      <main class="content">
        <!-- Biography -->
        <section class="section">
          <div class="section-header">
            <i class="pi pi-book accent-icon" />
            <h2 class="section-title">{{ t("celebrity.biography") }}</h2>
          </div>
          <div class="section-body">
            <p v-if="user.biography" class="biography">{{ user.biography }}</p>
            <p v-else class="empty-text">{{ t("celebrity.no_biography") }}</p>
          </div>
        </section>

        <!-- Filmography -->
        <section v-if="acted_movies.length === 0 && directed_movies.length === 0" class="section">
          <div class="section-header">
            <i class="pi pi-video primary-icon" />
            <h2 class="section-title">
              {{ t("celebrity.filmography.acted_in") }}
            </h2>
          </div>
          <div class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40 flex flex-col items-center justify-center text-center">
            <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-video text-3xl text-secondary"></i>
            </div>
            <h3 class="text-xl font-semibold opacity-70">{{ t("celebrity.filmography.no_movies") }}</h3>
            <p class="text-sm opacity-50 max-w-xs mx-auto">{{ t("celebrity.filmography.no_movies_description") }}</p>
          </div>
        </section>
        <section v-if="acted_movies.length" class="section">
          <div class="section-header">
            <i class="pi pi-video primary-icon" />
            <h2 class="section-title">
              {{ t("celebrity.filmography.acted_in") }}
            </h2>
          </div>
          <div class="section-body">
            <div class="movies-grid">
              <div
                v-for="movie in acted_movies"
                :key="movie.id"
                class="movie-card"
              >
                <div class="movie-poster-wrap">
                  <img
                    :src="movie.cover"
                    :alt="movie.title"
                    class="movie-poster"
                  />
                </div>
                <div class="movie-info">
                  <p class="movie-title">{{ movie.title }}</p>
                  <p class="movie-year">{{ movie.release_date }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="directed_movies.length" class="section">
          <div class="section-header">
            <i class="pi pi-video primary-icon" />
            <h2 class="section-title">
              {{ t("celebrity.filmography.directed") }}
            </h2>
          </div>
          <div class="section-body">
            <div class="movies-grid">
              <div
                v-for="movie in directed_movies"
                :key="movie.id"
                class="movie-card"
              >
                <div class="movie-poster-wrap">
                  <img
                    :src="movie.cover"
                    :alt="movie.title"
                    class="movie-poster"
                  />
                </div>
                <div class="movie-info">
                  <p class="movie-title">{{ movie.title }}</p>
                  <p class="movie-year">{{ movie.release_date }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
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
.primary-icon {
  color: var(--primary);
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

/* ── Movies ────────────────────────────────────────────── */
.empty-movies {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 0;
  color: var(--gray);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.2;
}

.empty-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
}

.movies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 480px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .movies-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* ── Movie card ────────────────────────────────────────── */
.movie-card {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--secondary);
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.movie-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.movie-poster-wrap {
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
  transition: transform 0.5s;
}

.movie-card:hover .movie-poster {
  transform: scale(1.08);
}

.movie-info {
  padding: 0.6rem 0.75rem;
}

.movie-title {
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 0.2rem;
  line-height: 1.3;
}

.movie-year {
  font-size: 0.65rem;
  color: var(--gray);
  font-weight: 500;
  margin: 0;
}
</style>
