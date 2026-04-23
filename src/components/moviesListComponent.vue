<script lang="ts" setup>
import type { MovieList } from '@/types';
const props = defineProps<{
    movieList: MovieList
}>();

</script>


<template>
    <div class="movie-list-card">
        <div class="movie-list-header">
            <i class="pi pi-folder accent-icon" />
            <span class="movie-list-name">{{ props.movieList.name }}</span>
        </div>
    </div>
</template>