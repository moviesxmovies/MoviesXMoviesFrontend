<script lang="ts" setup>
import type { Person } from "@/types";
import { goToPerson } from "@/utils/goTo";
import { computed, ref } from "vue";
import { Skeleton } from "primevue";
import { useDate } from "@/composables/useDate";

const props = defineProps<{
    celebrity: Person;
}>();

const { formatRelativeTime } = useDate();

const genderMap: Record<string, { color: string; fg: string; icon: string }> = {
    "0": { color: "var(--secondary)", fg: "var(--text)", icon: "pi pi-minus" },
    "1": { color: "var(--accent)", fg: "var(--on-accent)", icon: "pi pi-venus" },
    "2": { color: "var(--primary)", fg: "var(--on-primary)", icon: "pi pi-mars" },
    "3": { color: "var(--secondary)", fg: "var(--text)", icon: "pi pi-question" },
};

const gender = computed(() => genderMap[props.celebrity.gender] ?? genderMap["0"]);

const imageLoaded = ref(false);

const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

const showTooltip = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipX.value = rect.left + rect.width / 2;
    tooltipY.value = rect.bottom + 6;
    tooltipVisible.value = true;
};

const hideTooltip = () => {
    tooltipVisible.value = false;
};
</script>

<template>
    <div class="celeb-card" role="link" tabindex="0" :aria-label="celebrity.name" @click="goToPerson(celebrity.slug)"
        @keydown.enter="goToPerson(celebrity.slug)">
        <div class="cover">

            <img :src="celebrity.image" :alt="celebrity.name" class="cover-img" :class="{ loaded: imageLoaded }"
                @load="imageLoaded = true" />

            <!-- ── SKELETON STATE ─────────────────────────────── -->
            <template v-if="!imageLoaded">
                <Skeleton width="100%" height="100%" class="cover-skeleton" />

                <Skeleton width="22px" height="22px" border-radius="6px" class="badge-skeleton badge-gender" />

                <div class="card-footer">
                    <Skeleton width="70%" height="12px" border-radius="4px" class="footer-skeleton" />
                    <Skeleton width="50%" height="10px" border-radius="4px" class="footer-skeleton" />
                </div>
            </template>

            <!-- ── LOADED STATE ───────────────────────────────── -->
            <template v-else>
                <span v-if="gender" class="gender-badge" :style="{ background: gender.color, color: gender.fg }">
                    <i :class="gender.icon" />
                </span>

                <span v-if="celebrity.deathday" class="death-badge" @mouseenter="showTooltip" @mouseleave="hideTooltip"
                    @click.stop>
                    <i class="pi pi-heart-fill" />
                </span>

                <div class="card-footer">
                    <p class="name">{{ celebrity.name }}</p>
                    <span v-if="celebrity.birthday" class="birthday">
                        <i class="pi pi-calendar" />
                        {{ formatRelativeTime(celebrity.birthday) }}
                    </span>
                </div>
            </template>
        </div>
    </div>

    <Teleport to="body">
        <div v-if="tooltipVisible && celebrity.deathday" class="death-tooltip"
            :style="{ top: `${tooltipY}px`, left: `${tooltipX}px` }">
            {{ formatRelativeTime(celebrity.deathday) }}
        </div>
    </Teleport>
</template>

<style scoped>
.celeb-card {
    cursor: pointer;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.celeb-card:hover,
.celeb-card:focus-visible {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
}

.celeb-card:active {
    transform: scale(0.98);
}

.cover {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--surface-2);
}

:deep(.cover-skeleton) {
    position: absolute;
    inset: 0;
    border-radius: 0 !important;
    z-index: 1;
}

.badge-skeleton {
    position: absolute;
    z-index: 2;
}

.badge-gender {
    top: 8px;
    right: 8px;
}

:deep(.footer-skeleton) {
    display: block;
}

.cover-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
    opacity: 0;
    transition: transform 0.35s ease, opacity 0.3s ease;
    z-index: 2;
}

.cover-img.loaded {
    opacity: 1;
}

.celeb-card:hover .cover-img {
    transform: scale(1.04);
}

.gender-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    z-index: 3;
}

.death-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    background: rgba(8, 7, 14, 0.78);
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    cursor: default;
    z-index: 3;
}

/* Gradiente siempre oscuro: el texto blanco mantiene ≥ 7:1 */
.card-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2.5rem 0.8rem 0.8rem;
    background: linear-gradient(to top, rgba(8, 7, 14, 0.94) 0%, rgba(8, 7, 14, 0.7) 55%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    z-index: 3;
}

.name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.25;
}

.birthday {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.85);
}

.birthday i {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.85);
}
</style>

<style>
.death-tooltip {
    position: fixed;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--background);
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    z-index: 9999;
    animation: fade-in 0.15s ease;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-3px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}
</style>