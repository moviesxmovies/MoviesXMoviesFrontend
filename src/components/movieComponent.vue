<script lang="ts" setup>
import type { Movie } from "@/types";
import { Button } from "primevue";

const props = defineProps<{
  movie: Movie;
}>();
</script>

<template>
  <div
    class="movie-card min-h-screen flex items-center justify-center p-6"
  >
    <div
      class="relative w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group"
      style="background: #0a0a0a"
    >
      <img
        :src="movie.cover"
        :alt="movie.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div
        class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent"
      ></div>

      <div class="relative z-10 p-4 text-center">
        <span
          class="text-xl font-bold tracking-tight text-white/90 drop-shadow-md"
        >
          {{ movie.title }}
        </span>
      </div>

      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-6 gap-3"
      >
        <div class="text-center mb-2">
          <p
            class="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase"
          >
            {{ movie.genres.join(" | ") }}
          </p>
        </div>
        <div
          class="space-y-3 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5"
        >
          <p
            class="text-xs leading-relaxed text-white/70 line-clamp-4 italic font-light"
          >
            "{{ movie.synopsis }}"
          </p>
        </div>

        <Button
          icon="pi pi-ticket"
          label="Get Tickets"
          fluid
          class="p-button-danger p-button-sm !bg-[#bc3121] !border-none hover:!brightness-110"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;700&display=swap");

.movie-card {
  font-family: "DM Sans", sans-serif;
}

/* Efecto de grano opcional para dar textura de película */
.movie-card::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Grain_Texture.jpg");
  z-index: 50;
}
</style>
