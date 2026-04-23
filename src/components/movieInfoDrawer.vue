<script setup lang="ts">
import type { Person, Movie } from "@/types";
import { Drawer, ScrollPanel, Skeleton, useToast } from "primevue";
import { ref, watch, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "@/composables/useAPI";
import { RouterLink } from "vue-router";

const props = defineProps<{
  movie: Movie;
}>();

const visible = defineModel<boolean>("visible", { default: false });
const toast = useToast();
const { t } = useI18n();
const actors = ref<Person[]>([]);
const directors = ref<Person[]>([]);
const loading = ref(false);
const actorsScroll = ref();
const directorsScroll = ref();
const hasDragged = ref(false);

const fetchDetails = async (finalList: Ref<Person[]>, list: string[]) => {
  if (!list) return;
  finalList.value = [];

  for (const element of list) {
    try {
      const { data } = await api.get(element);
      finalList.value.push(data);
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message ||
          t("components.movieInfoDrawer.fetchActorsError"),
        life: 3000,
      });
    }
  }
};

watch(
  () => props.movie,
  async (movie) => {
    const currentId = movie.id;
    loading.value = true;
    await Promise.all([
      fetchDetails(actors, movie.actors),
      fetchDetails(directors, movie.directors),
    ]);

    if (currentId === props.movie.id) {
      loading.value = false;
    }
  },
  { immediate: true },
);

function useDragScroll() {
  const isDown = ref(false);
  const startX = ref(0);
  const scrollLeft = ref(0);

  function onMouseDown(e: MouseEvent, el: HTMLElement) {
    isDown.value = true;
    hasDragged.value = false;
    startX.value = e.pageX - el.offsetLeft;
    scrollLeft.value = el.scrollLeft;
  }

  function onMouseMove(e: MouseEvent, el: HTMLElement) {
    if (!isDown.value) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.value) * 1.2;

    if (Math.abs(x - startX.value) > 5) {
      hasDragged.value = true;
    }

    el.scrollLeft = scrollLeft.value - walk;
  }

  function onMouseUp() {
    isDown.value = false;
  }

  function onClick(e: MouseEvent) {
    if (hasDragged.value) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return { onMouseDown, onMouseMove, onMouseUp, onClick };
}

const { onMouseDown, onMouseMove, onMouseUp, onClick } = useDragScroll();
</script>

<template>
  <Drawer
    v-model:visible="visible"
    :modal="false"
    :dismissable="false"
    position="right"
    class="movie-drawer !w-full md:!w-[40rem]"
  >
    <template #header>
      <div class="drawer-header-inner">
        <img
          v-if="movie.cover"
          :src="movie.cover"
          :alt="movie.title"
          class="drawer-poster"
        />
        <div class="drawer-title-block">
          <h2 class="drawer-title">{{ movie.title }}</h2>
          <span class="drawer-year">{{ movie.release_date }}</span>
        </div>
      </div>
    </template>

    <div v-if="loading" class="drawer-loading">
      <!-- Synopsis -->
      <div class="drawer-section">
        <Skeleton
          width="30%"
          height="0.7rem"
          border-radius="4px"
          class="mb-3"
        />
        <Skeleton
          width="100%"
          height="0.9rem"
          border-radius="4px"
          class="mb-2"
        />
        <Skeleton
          width="100%"
          height="0.9rem"
          border-radius="4px"
          class="mb-2"
        />
        <Skeleton width="75%" height="0.9rem" border-radius="4px" />
      </div>

      <!-- Platforms -->
      <div class="drawer-section">
        <Skeleton
          width="25%"
          height="0.7rem"
          border-radius="4px"
          class="mb-3"
        />
        <div class="inline-list">
          <Skeleton
            v-for="n in 3"
            :key="n"
            width="52px"
            height="52px"
            border-radius="10px"
          />
        </div>
      </div>

      <!-- Genres -->
      <div class="drawer-section">
        <Skeleton
          width="20%"
          height="0.7rem"
          border-radius="4px"
          class="mb-3"
        />
        <div class="genre-list">
          <Skeleton
            v-for="n in 4"
            :key="n"
            width="72px"
            height="1.6rem"
            border-radius="99px"
          />
        </div>
      </div>

      <!-- Actors -->
      <div class="drawer-section">
        <Skeleton
          width="22%"
          height="0.7rem"
          border-radius="4px"
          class="mb-3"
        />
        <div class="inline-list">
          <div v-for="n in 4" :key="n" class="person-item">
            <Skeleton width="64px" height="64px" border-radius="50%" />
            <Skeleton width="56px" height="0.65rem" border-radius="4px" />
          </div>
        </div>
      </div>

      <!-- Directors -->
      <div class="drawer-section">
        <Skeleton
          width="24%"
          height="0.7rem"
          border-radius="4px"
          class="mb-3"
        />
        <div class="inline-list">
          <div v-for="n in 2" :key="n" class="person-item">
            <Skeleton width="64px" height="64px" border-radius="50%" />
            <Skeleton width="56px" height="0.65rem" border-radius="4px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Synopsis -->
    <template v-else>
      <section class="drawer-section" v-show="movie.synopsis">
        <h3 class="drawer-section__title">
          {{ t("components.movieInfoDrawer.synopsis") }}
        </h3>
        <p class="drawer-section__body">{{ movie.synopsis }}</p>
      </section>

      <!-- Platforms -->
      <section class="drawer-section" v-show="movie.platforms.length">
        <h3 class="drawer-section__title">
          {{
            t(
              "components.movieInfoDrawer.platforms",
              movie.platforms.length > 1 ? 2 : 1,
            )
          }}
        </h3>
        <ScrollPanel
          class="horizontal-scroll-panel"
          :pt="{ content: { class: 'scroll-content' } }"
        >
          <div class="inline-list">
            <div
              v-for="platform in movie.platforms"
              :key="platform.id"
              class="platform-item"
            >
              <RouterLink :to="`/search?platforms=${platform.slug}`"
                ><img
                  :src="platform.image ?? ''"
                  :alt="platform.name"
                  class="platform-item__img"
                />
              </RouterLink>
            </div>
          </div>
        </ScrollPanel>
      </section>

      <!-- Genres -->
      <section class="drawer-section" v-show="movie.genres.length">
        <h3 class="drawer-section__title">
          {{
            t(
              "components.movieInfoDrawer.genres",
              movie.genres.length > 1 ? 2 : 1,
            )
          }}
        </h3>
        <RouterLink
          class="genre-list"
          v-for="genre in movie.genres"
          :key="genre.id"
          :to="`/search?genres=${genre.slug}`"
        >
          <span class="genre-tag">
            {{ genre.name }}
          </span>
        </RouterLink>
      </section>

      <!-- Actors -->
      <section class="drawer-section" v-show="movie.actors.length">
        <h3 class="drawer-section__title">
          {{
            t(
              "components.movieInfoDrawer.actors",
              movie.actors.length > 1 ? 2 : 1,
            )
          }}
        </h3>
        <div
          class="scroll-container"
          ref="actorsScroll"
          @mousedown="onMouseDown($event, actorsScroll)"
          @mousemove="onMouseMove($event, actorsScroll)"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <div class="inline-list">
            <RouterLink
              v-for="actor in actors"
              :key="actor.id"
              class="person-item"
              :to="`/profiles/${actor.slug}`"
              draggable="false"
              @click="onClick"
            >
              <img
                :src="actor.image"
                :alt="actor.name"
                class="person-item__img"
                draggable="false"
              />
              <span class="person-item__name">{{ actor.name }}</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Directors -->
      <section class="drawer-section" v-show="movie.directors.length">
        <h3 class="drawer-section__title">
          {{
            t(
              "components.movieInfoDrawer.directors",
              movie.directors.length > 1 ? 2 : 1,
            )
          }}
        </h3>
        <div
          class="scroll-container"
          ref="directorsScroll"
          @mousedown="onMouseDown($event, directorsScroll)"
          @mousemove="onMouseMove($event, directorsScroll)"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <div class="inline-list">
            <RouterLink
              v-for="director in directors"
              :key="director.id"
              class="person-item"
              :to="`/profiles/${director.slug}`"
              draggable="false"
              @click="onClick"
            >
              <img
                :src="director.image"
                :alt="director.name"
                class="person-item__img"
                draggable="false"
              />
              <span class="person-item__name">{{ director.name }}</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </template>
  </Drawer>
</template>

<style scoped>
:deep(.movie-drawer__root) {
  background: var(--mxm-bg) !important;
  border-left: 1px solid rgba(232, 184, 75, 0.15);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.6);
}

:deep(.movie-drawer__header) {
  background: var(--mxm-surface) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1.25rem 1.5rem !important;
}

.drawer-header-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.drawer-poster {
  width: 52px;
  height: 74px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.drawer-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mxm-text);
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
}

.drawer-year {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--mxm-accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.movie-drawer__content) {
  background: var(--mxm-bg) !important;
  padding: 1.5rem !important;
  overflow-y: auto;
}

.drawer-section {
  margin-bottom: 2rem;
}

.drawer-section__title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mxm-accent);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #2f27ce1d;
}

.drawer-section__body {
  font-size: 0.925rem;
  line-height: 1.7;
  color: var(--mxm-text-muted);
  margin: 0;
}

.horizontal-scroll-panel {
  width: 100%;
  height: auto;
}

:deep(.horizontal-scroll-panel .p-scrollpanel-bar-x) {
  background: rgba(232, 184, 75, 0.25) !important;
  height: 3px !important;
  border-radius: 99px;
}

:deep(.horizontal-scroll-panel .p-scrollpanel-bar-x:hover) {
  background: var(--mxm-accent) !important;
}

.inline-list {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 0.25rem 0.125rem 0.5rem;
  width: max-content;
}

.person-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 76px;
  flex-shrink: 0;
}

.person-item__img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: #7f6e8b45;
  border: 2px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s;
}

.person-item:hover .person-item__img {
  border-color: #bb3dff;
}

.person-item__name {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--mxm-text-muted);
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  transition: color 0.2s;
}

.person-item:hover .person-item__name {
  color: var(--mxm-text);
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.platform-item__img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 10px;
  background: var(--mxm-surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 6px;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.platform-item:hover .platform-item__img {
  border-color: #bb3dff;
  background: var(--mxm-surface-2);
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mxm-text-muted);
  background: var(--mxm-surface);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 99px;
  padding: 0.25rem 0.75rem;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.genre-tag:hover {
  color: var(--mxm-accent);
  border-color: #bb3dff;
}

.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  user-select: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.scroll-container:active {
  cursor: grabbing;
}
</style>
