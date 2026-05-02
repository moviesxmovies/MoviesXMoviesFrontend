<script lang="ts" setup>
import { useRoute } from "vue-router";
import SearchMovieView from "./SearchMovieView.vue";
import SearchUsersView from "./SearchUsersView.vue";

const route = useRoute();
</script>

<template>
  <SearchUsersView v-if="route.query.type === 'users'" />
  <SearchMovieView v-else />
</template>
