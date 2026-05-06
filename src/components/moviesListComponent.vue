<script lang="ts" setup>
import { useDate } from '@/composables/useDate';
import type { MovieList } from '@/types';
import { goToMovieList } from '@/utils/goTo';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    movieList: MovieList;
}>();
const {formatRelativeTime} = useDate();
const privacyConfig: Record<string, { icon: string; class: string }> = {
    P: { icon: 'pi pi-globe', class: 'badge-public' },
    R: { icon: 'pi pi-lock', class: 'badge-private' },
    F: { icon: 'pi pi-users', class: 'badge-friends' },
};

const privacy = privacyConfig[props.movieList.privacity] ?? privacyConfig['R'];
</script>

<template>
    <div class="movie-list" @click="goToMovieList(movieList.slug)">
        <div class="movie-list-header">
            <span class="privacy-badge" :class="privacy.class" v-if="privacy">
                <i :class="privacy.icon" />
            </span>
            <span class="movie-list-count">{{ t('components.movieList.moviesCount', { count: movieList.movies.length }) }}</span>
        </div>

        <div class="movie-list-body">
            <span class="movie-list-name">{{ movieList.name }}</span>
            <p v-if="movieList.description" class="movie-list-description">{{ movieList.description }}</p>
        </div>

        <div class="movie-list-footer">
            <span class="movie-list-date">{{ formatRelativeTime(movieList.updated_at) }}</span>
        </div>
    </div>
</template>

<style scoped>
.movie-list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.85rem;
    border-radius: 1rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    transition: background 0.2s;
    cursor: pointer;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    min-width: 0;
}

.movie-list:hover {
    background: rgba(255, 255, 255, 0.05);
}

.movie-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.movie-list-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
    overflow: hidden;
    justify-content: center;
}

.movie-list-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.movie-list-count {
    font-size: 0.65rem;
    color: var(--gray);
}

.privacy-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    font-size: 0.75rem;
    flex-shrink: 0;
}

.badge-public {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.badge-private {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.badge-friends {
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
}

.movie-list-description {
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.6;
    margin: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.movie-list-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.movie-list-date {
    font-size: 0.65rem;
    color: var(--gray);
}
</style>