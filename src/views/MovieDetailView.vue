<script lang="ts" setup>
import {
    getMovie,
    getMovieReviews,
} from '@/repositories/movieRepository';
import type { Movie, Review, Person } from '@/types';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel, Skeleton, useToast } from 'primevue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useLangStore } from '@/stores/langStore';
import { usePaginatedFetch } from '@/composables/usePaginatedFetch';
import { useInfinitePagination } from '@/composables/useInfinitePagination';
import ReviewOnUserComponent from '@/components/reviewOnUserComponent.vue';
import SectionAccordion from '@/components/sectionAccordion.vue';
import { api } from '@/composables/useAPI';
import AddReviewDialog from '@/components/addReviewDialog.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const langStore = useLangStore();

const movie = ref<Movie>({} as Movie);
const loadingMovie = ref(false);
const actors = ref<Person[]>([]);
const directors = ref<Person[]>([]);
const loadingActors = ref(false);
const loadingDirectors = ref(false);

const addReviewDialogVisible = ref(false);

const isMobile = ref(window.innerWidth < 640);
const handleResize = () => {
    isMobile.value = window.innerWidth < 640;
};



const { data: reviews, loading: loadingReviews, fetch: fetchReviews, reset: resetReviews } = usePaginatedFetch<Review>();

const fetchMovieDetail = async () => {
    const { slug } = route.params;
    if (!slug) return;
    loadingMovie.value = true;
    try {
        const movieData = await getMovie(slug as string);
        movie.value = movieData;
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: t('toast.error'),
            detail: error.response?.data?.message || t('movie.error.fetchingMovie'),
        });
        router.push({ name: 'NotFound' });
    } finally {
        loadingMovie.value = false;
    }
};

const fetchPersonDetails = async (list: string[], target: typeof actors, loadingRef: typeof loadingActors) => {
    if (!list?.length) return;
    loadingRef.value = true;
    target.value = [];
    for (const url of list) {
        try {
            const { data } = await api.get(url);
            target.value.push(data);
        } catch (error: any) {
            toast.add({
                severity: 'error',
                summary: t('toast.error'),
                detail: error.response?.data?.message || t('movie.error.fetchingPerson'),
            });
        }
    }
    loadingRef.value = false;
};

const fetchMovieReviews = (lastId?: number) =>
    fetchReviews((id) => getMovieReviews(movie.value.slug, id), lastId);

const { sentinelRef: reviewsSentinelRef } = useInfinitePagination(reviews, loadingReviews, fetchMovieReviews);

const reviewDialogConfig = {
    icon: 'pi pi-plus',
    label: t('movie.add_review'),
    onClick: () => addReviewDialogVisible.value = true,
}

watch(
    () => movie.value,
    async (m) => {
        if (!m?.actors) return;
        await Promise.all([
            fetchPersonDetails(m.actors, actors, loadingActors),
            fetchPersonDetails(m.directors, directors, loadingDirectors),
        ]);
    }
);

onMounted(() => {
    window.addEventListener('resize', handleResize);
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
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
    { immediate: true }
);
</script>

<template>
    <AddReviewDialog v-model:visible="addReviewDialogVisible" :movieSlug="movie.slug"
        @reload="() => { resetReviews(); fetchMovieReviews() }" />
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
                        <div class="card-body">
                            <h1 class="movie-title">{{ movie.title }}</h1>
                            <span class="movie-year">{{ new Date(movie.release_date).toLocaleDateString() }}</span>
                        </div>
                        <div v-if="movie.platforms?.length" class="card-section">
                            <span class="card-section__label">{{ t('movie.platforms', movie.platforms.length) }}</span>
                            <div class="platforms-list">
                                <RouterLink v-for="platform in movie.platforms" :key="platform.id"
                                    :to="`/search?platforms=${platform.slug}`" class="platform-item">
                                    <img :src="platform.image" :alt="platform.name" class="platform-item__img" />
                                    <span class="platform-item__name">{{ platform.name }}</span>
                                </RouterLink>
                            </div>
                        </div>
                        <div v-if="movie.genres?.length" class="card-section">
                            <span class="card-section__label">{{ t('movie.genres', movie.genres.length) }}</span>
                            <div class="genre-list">
                                <RouterLink v-for="genre in movie.genres" :key="genre.id"
                                    :to="`/search?genres=${genre.slug}`" class="genre-tag">
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
                            <i class="pi pi-align-left accent-icon" />
                            <h2 class="section-title">{{ t('movie.synopsis') }}</h2>
                        </AccordionHeader>
                        <AccordionContent class="section-body">
                            <p v-if="movie.synopsis" class="synopsis">{{ movie.synopsis }}</p>
                            <p v-else class="empty-text">{{ t('movie.no_synopsis') }}</p>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>

                <!-- REVIEWS -->
                <SectionAccordion icon="pi pi-file-word accent-icon" :title="t('movie.reviews')"
                    :isEmpty="!reviews.results?.length" :emptyIcon="'pi pi-file-word'"
                    :emptyTitle="t('movie.no_reviews')" :emptyDescription="t('movie.no_reviews_description')"
                    :dialog-options="reviewDialogConfig" :loading="loadingReviews"
                    v-model:sentinelRef="reviewsSentinelRef" defaultOpen>
                    <ReviewOnUserComponent v-for="review in reviews.results" :key="review.id" :review="review" />
                </SectionAccordion>
            </div>

            <!-- CAST SECTION -->
            <div class="content cast-section">
                <!-- ACTORS -->
                <SectionAccordion icon="pi pi-users accent-icon" :title="t('movie.actors', actors.length)"
                    :isEmpty="!actors.length" :emptyIcon="'pi pi-users'" :emptyTitle="t('movie.no_actors')"
                    :emptyDescription="t('movie.no_actors_description')" :loading="loadingActors">
                    <div class="person-grid">
                        <RouterLink v-for="actor in actors" :key="actor.id" :to="`/profiles/${actor.slug}`"
                            class="person-item">
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
}

:deep(.p-accordioncontent-content) {
    all: unset;
}

.page {
    min-height: 100vh;
    background: var(--background);
    color: var(--text);
    font-family: 'Inter', sans-serif;
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

.layout {
    max-width: 1600px;
    margin: 0 auto;
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.sidebar {
    width: 100%;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}


@media (min-width: 768px) {
    .layout {
        grid-template-columns: 3fr 3fr;
    }

    .sidebar {
        order: 1;
    }

    .content {
        order: 2;
    }

    .content.cast-section {
        order: 3;
    }
}

@media (min-width: 1024px) {
    .layout {
        grid-template-columns: 1.5fr 3fr 1.5fr;
    }
}

/* CARD */
.card {
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

.card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--secondary);
}

.card-section {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    border-bottom: 1px solid var(--secondary);
}

.card-section:last-child {
    border-bottom: none;
}

.card-section__label {
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.5;
    color: var(--text);
}

.movie-title {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--primary);
    margin: 0;
}

.movie-year {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.08em;
    white-space: nowrap;
    flex-shrink: 0;
}

/* SECTION */
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

.accent-icon {
    color: var(--accent);
}

/* SYNOPSIS */
.synopsis {
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
    gap: 0.4rem;
    text-decoration: none;
}

.platform-item__img {
    width: 52px;
    height: 52px;
    object-fit: contain;
    border-radius: 10px;
    background: var(--background);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 6px;
    transition: border-color 0.2s, background 0.2s;
}

.platform-item:hover .platform-item__img {
    border-color: var(--accent);
}

.platform-item__name {
    font-size: 0.65rem;
    color: var(--gray);
    text-align: center;
    transition: color 0.2s;
    white-space: normal;
    overflow-wrap: break-word;
    max-width: 100px;
}

.platform-item:hover .platform-item__name {
    color: var(--text);
}

/* GENRES */
.genre-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.genre-tag {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text);
    background: var(--background);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 99px;
    padding: 0.25rem 0.75rem;
    text-decoration: none;
    transition: color 0.2s, border-color 0.2s;
}

.genre-tag:hover {
    color: var(--accent);
    border-color: var(--accent);
}

/* PERSON GRID */
.person-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

@media (min-width: 768px) {
    .person-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.person-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
}

.person-item__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.06);
    background: var(--secondary);
    transition: border-color 0.2s;
    flex-shrink: 0;
}

.person-item:hover .person-item__avatar {
    border-color: var(--accent);
}

.person-item__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.person-item__name {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--gray);
    text-align: center;
    line-height: 1.3;
    word-break: break-word;
    transition: color 0.2s;
}

.person-item:hover .person-item__name {
    color: var(--text);
}
</style>