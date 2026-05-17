<script lang="ts" setup>
import { api } from "@/composables/useAPI";
import { friendsRatings } from "@/repositories/movieRepository";
import type { Rating, User } from "@/types";
import { goToUser } from "@/utils/goTo";
import { ref, onMounted, watch, onUnmounted } from "vue";

const props = defineProps<{
    movieSlug: string;
}>();

const visibleBubbles = ref<(Rating & { key: number; xOffset: string; profile?: User })[]>([]);
const queue = ref<Rating[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const LIMIT = 5;
const BUBBLE_INTERVAL_MS = 2200
const BUBBLE_LIFETIME_MS = 9000
const ROUND_PAUSE_MS = 6000



let bubbleTimer: ReturnType<typeof setInterval> | null = null;
let keyCounter = 0;
let roundPauseActive = false;
let hasCompletedFirstLoop = false;

const profileCache = new Map<string, User>();
const profileFetching = new Map<string, Promise<User>>();
const pageCache = new Map<number, Rating[]>();
const isMobile = window.innerWidth <= 640;

const RATING_COLORS: Record<number, string> = {
    1: "var(--red)",
    2: "var(--red)",
    3: "var(--gray)",
    4: "var(--yellow)",
    5: "var(--yellow)",
};

const getProfile = (userUrl: string): Promise<User> => {
    if (profileCache.has(userUrl)) {
        return Promise.resolve(profileCache.get(userUrl)!);
    }
    if (profileFetching.has(userUrl)) {
        return profileFetching.get(userUrl)!;
    }
    const promise = api.get(userUrl)
        .then((response) => {
            const profile = response.data as User;
            profileCache.set(userUrl, profile);
            return profile;
        })
        .catch((error) => {
            console.error(`Failed to fetch profile for ${userUrl}:`, error);
            throw error;
        })
        .finally(() => {
            profileFetching.delete(userUrl);
        });
    profileFetching.set(userUrl, promise);
    return promise;
};

const refillQueue = () => {
    if (loading.value || roundPauseActive) return;
    const isLooping = hasCompletedFirstLoop && currentPage.value === 1;
    fetchPage(isLooping);
};

const fetchPage = async (delayed = false) => {
    if (loading.value) return;

    if (pageCache.has(currentPage.value)) {
        const cached = pageCache.get(currentPage.value)!;
        const enqueue = () => {
            queue.value.push(...cached);
            cached.forEach((r: Rating) => getProfile(r.user));
            roundPauseActive = false;
        };
        if (delayed) {
            roundPauseActive = true;
            setTimeout(enqueue, ROUND_PAUSE_MS);
        } else {
            enqueue();
        }
        if (currentPage.value >= totalPages.value) {
            currentPage.value = 1;
            hasCompletedFirstLoop = true;
        } else {
            currentPage.value++;
        }
        return;
    }

    loading.value = true;
    try {
        const data = await friendsRatings(props.movieSlug, LIMIT, currentPage.value);
        totalPages.value = data.total_pages;
        pageCache.set(currentPage.value, data.results);

        const enqueue = () => {
            queue.value.push(...data.results);
            data.results.forEach((r: Rating) => getProfile(r.user));
            roundPauseActive = false;
        };

        if (delayed) {
            roundPauseActive = true;
            setTimeout(enqueue, ROUND_PAUSE_MS);
        } else {
            enqueue();
        }

        if (currentPage.value >= totalPages.value) {
            currentPage.value = 1;
            hasCompletedFirstLoop = true;
        } else {
            currentPage.value++;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const reset = async () => {
    if (bubbleTimer) clearInterval(bubbleTimer);
    visibleBubbles.value = [];
    queue.value = [];
    currentPage.value = 1;
    totalPages.value = 1;
    keyCounter = 0;
    roundPauseActive = false;
    hasCompletedFirstLoop = false;
    pageCache.clear();

    await fetchPage();
    startBubbles();
};

const popBubble = () => {
    if (queue.value.length <= 0) refillQueue();
    if (roundPauseActive || queue.value.length === 0) return;

    const rating = queue.value.shift()!;
    const key = keyCounter++;

    const xOffset = isMobile
        ? `${Math.random() * 70 + 5}%`
        : `${Math.random() * 50 + 5}%`;

    getProfile(rating.user)
        .catch(() => undefined)
        .then((profile) => {

            visibleBubbles.value.push({ ...rating, key, xOffset, profile });
        });

    setTimeout(() => {
        visibleBubbles.value = visibleBubbles.value.filter((b) => b.key !== key);
    }, BUBBLE_LIFETIME_MS);
};



const startBubbles = () => {
    if (bubbleTimer) clearInterval(bubbleTimer);
    bubbleTimer = setInterval(popBubble, BUBBLE_INTERVAL_MS);
    popBubble();
};



watch(() => props.movieSlug, reset);
onMounted(reset);
onUnmounted(() => { if (bubbleTimer) clearInterval(bubbleTimer); });
</script>

<template>
    <div class="bubbles-stage" aria-hidden="true">
        <TransitionGroup name="bubble">
            <div v-for="bubble in visibleBubbles" :key="bubble.key" class="bubble" :style="{
                '--bubble-color': RATING_COLORS[bubble.rating] ?? 'var(--primary)',
                '--x-offset': bubble.xOffset,
            }" @click="goToUser(bubble.profile?.username)">
                <div class="bubble-avatar">
                    <img v-if="bubble.profile?.picture" :src="bubble.profile.picture" :alt="bubble.user"
                        class="avatar-img" />
                    <span v-else class="avatar-initials">
                        {{ (bubble.profile?.username ?? bubble.user).slice(0, 2).toUpperCase() }}
                    </span>
                </div>

                <div class="bubble-info">
                    <span class="bubble-user">
                        {{ (bubble.profile?.username ?? bubble.user).length > 10
                            ? (bubble.profile?.username ?? bubble.user).slice(0, 10) + '…'
                            : (bubble.profile?.username ?? bubble.user) }}
                    </span>
                    <span class="bubble-stars">
                        <i v-for="n in 5" :key="n" class="pi"
                            :class="n <= bubble.rating ? 'pi-star-fill' : 'pi-star'" />
                    </span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.bubbles-stage {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999999;
    overflow: hidden;
    width: 33vw;
    left: 0;
}

.bubble {
    position: absolute;
    bottom: -80px;
    left: var(--x-offset, 10%);
    max-width: calc(33vw - 1rem);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem 0.4rem 0.4rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--background) 92%, transparent);
    border: 0.5px solid color-mix(in srgb, var(--bubble-color) 35%, var(--ob-card-border));
    box-shadow:
        0 0 14px -4px color-mix(in srgb, var(--bubble-color) 60%, transparent),
        0 2px 12px var(--ob-card-shadow),
        inset 0 0 12px -8px color-mix(in srgb, var(--bubble-color) 20%, transparent);
    white-space: nowrap;
    animation: float-up 6s ease-in forwards;
    font-family: 'DM Sans', sans-serif;
    transform-origin: left center;
    cursor: pointer;
    pointer-events: all;
    user-select: none;
}

.bubble-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--bubble-color) 15%, var(--secondary));
    border: 1.5px solid color-mix(in srgb, var(--bubble-color) 60%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.avatar-initials {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--bubble-color);
    letter-spacing: 0.02em;
}

.bubble-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
}

.bubble-user {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text);
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bubble-stars {
    display: flex;
    gap: 1px;
}

.bubble-stars .pi {
    font-size: 0.55rem;
    color: var(--bubble-color);
}

.bubble-enter-active {
    animation: float-up 6s ease-in forwards;
}

.bubble-leave-active {
    transition: opacity 0.4s ease;
}

.bubble-leave-to {
    opacity: 0;
}

@keyframes float-up {
    0% {
        transform: translateY(0) scale(0.85);
        opacity: 0;
    }

    8% {
        opacity: 1;
        transform: translateY(-20px) scale(1);
    }

    85% {
        opacity: 1;
    }

    100% {
        transform: translateY(-100vh) scale(0.95);
        opacity: 0;
    }
}

@media (max-width: 640px) {
    .bubbles-stage {
        width: 100vw;
        height: 120px;
        top: 30px;
        bottom: auto;
        left: 0;
    }

    .bubble {
        bottom: unset;
        left: -100px;
        right: unset;
        top: var(--x-offset, 30%);
        max-width: 240px;
        padding: 0.35rem 0.65rem 0.35rem 0.35rem;
        gap: 0.4rem;
        animation: float-right 6s ease-in forwards;
        transform-origin: left center;
    }

    .bubble-avatar {
        width: 24px;
        height: 24px;
    }

    .avatar-initials {
        font-size: 0.55rem;
    }

    .bubble-user {
        font-size: 0.6rem;
    }

    .bubble-stars .pi {
        font-size: 0.5rem;
    }

    .bubble-enter-active {
        animation: float-right 6s ease-in forwards;
    }
}

@keyframes float-right {
    0% {
        transform: translateX(0) scale(0.85);
        opacity: 0;
    }

    8% {
        opacity: 1;
        transform: translateX(20px) scale(1);
    }

    85% {
        opacity: 1;
    }

    100% {
        transform: translateX(110vw) scale(0.95);
        opacity: 0;
    }
}
</style>