<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import { type Movie, type Review } from '@/types';
import { goToMovie } from '@/utils/goTo';
import { onMounted, ref } from 'vue';
import ReactionsComponent from './reactionsComponent.vue';

const props = defineProps<{
    review: Review;
}>();

const movie = ref<Movie | null>(null);

const fetchMovieData = async () => {
    try {
        const response = await api.get(props.review.movie);
        movie.value = response.data;
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
};




onMounted(() => {
    fetchMovieData();
});
</script>

<template>
    <div class="review">
        <div class="review-main">
            <img class="movie-cover" :src="movie?.cover" :alt="movie?.title" @click="goToMovie(movie?.slug)" />
            <div class="review-body">
                <div class="review-header">
                    <div class="review-meta">
                        <span class="movie-name" @click="goToMovie(movie?.slug)">{{ movie?.title }}</span>
                        <span class="review-date">{{ new Date(review.created_at).toLocaleDateString() }}</span>
                    </div>
                    <span class="badge" :class="review.is_positive ? 'badge-positive' : 'badge-negative'">
                        <i :class="review.is_positive ? 'pi pi-thumbs-up' : 'pi pi-thumbs-down'" />
                    </span>
                </div>
                <h3 class="review-title">{{ review.title }}</h3>
                <p class="review-content">{{ review.content }}</p>
            </div>
        </div>
        <ReactionsComponent :reviewId="review.id" type="review" />
    </div>
</template>

<style scoped>
.review {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    transition: background 0.2s;
    margin-bottom: 0.75rem;
}

.review-main {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.review:hover {
    background: rgba(255, 255, 255, 0.05);
}

.movie-cover {
    width: 4rem;
    min-width: 4rem;
    height: 6rem;
    object-fit: cover;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
}

.movie-cover:hover {
    opacity: 0.85;
    transform: scale(1.03);
}

.review-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.review-meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
}

.movie-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.movie-name:hover {
    opacity: 0.75;
}

.review-date {
    font-size: 0.7rem;
    color: var(--gray);
}

.badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.8rem;
    flex-shrink: 0;
}

.badge-positive {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.badge-negative {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.review-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.review-content {
    font-size: 0.85rem;
    line-height: 1.6;
    font-weight: 300;
    color: var(--text);
    opacity: 0.8;
    margin: 0;
    white-space: pre-line;
}
</style>