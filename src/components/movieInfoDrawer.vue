<script setup lang="ts">
import type { Movie } from "@/types";
import { Drawer } from "primevue";

const props = defineProps<{
  movie: Movie;
}>();

const visible = defineModel<boolean>("visible", { default: false });
</script>

<template>
  <Drawer
    v-model:visible="visible"
    :header="movie.title"
    :modal="false"
    :dismissable="false"
    position="right"
    class="!w-full md:!w-[40rem]"
  >
    <p>
      {{ movie.synopsis }}
    </p>
  </Drawer>
</template>
