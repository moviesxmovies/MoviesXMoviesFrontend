<script lang="ts" setup>
import type { Person } from "@/types";
import { goToPerson } from "@/utils/goTo";
import { computed, ref } from "vue";
import { Skeleton } from "primevue";

const props = defineProps<{
    celebrity: Person;
}>();

const genderMap: Record<string, { color: string; icon: string }> = {
    "0": { color: "var(--secondary)", icon: "pi pi-minus" },
    "1": { color: "var(--accent)", icon: "pi pi-venus" },
    "2": { color: "var(--primary)", icon: "pi pi-mars" },
    "3": { color: "var(--secondary)", icon: "pi pi-question" },
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
    <div class="celeb-card" @click="goToPerson(celebrity.slug)">
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
                <span v-if="gender" class="gender-badge" :style="{ background: gender.color }">
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
                        {{ celebrity.birthday }}
                    </span>
                </div>
            </template>
        </div>
    </div>

    <Teleport to="body">
        <div v-if="tooltipVisible && celebrity.deathday" class="death-tooltip"
            :style="{ top: `${tooltipY}px`, left: `${tooltipX}px` }">
            {{ celebrity.deathday }}
        </div>
    </Teleport>
</template>

<style scoped>
.celeb-card {
    cursor: pointer;
    border-radius: 1.25rem;
    overflow: hidden;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.celeb-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
    border-color: var(--primary);
}

.celeb-card:active {
    transform: scale(0.97);
}

/* ── Cover ──────────────────────────────────────────────── */
.cover {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--secondary);
}

/* ── Skeletons ──────────────────────────────────────────── */
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

/* Los skeleton del footer heredan el layout del card-footer */
:deep(.footer-skeleton) {
    display: block;
}

/* ── Image ──────────────────────────────────────────────── */
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

/* ── Badges ─────────────────────────────────────────────── */
.gender-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    z-index: 3;
}

.death-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.55rem;
    background: rgba(239, 68, 68, 0.88);
    color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    cursor: default;
    z-index: 3;
}

/* ── Footer ─────────────────────────────────────────────── */
.card-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem 0.75rem 0.75rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    z-index: 3;
}

.name {
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
}

.birthday {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.65);
}

.birthday i {
    font-size: 0.6rem;
    color: var(--accent);
}
</style>

<style>
.death-tooltip {
    position: fixed;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    font-size: 0.65rem;
    white-space: nowrap;
    padding: 3px 8px;
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