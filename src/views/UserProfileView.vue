<script lang="ts" setup>
import {
    getSelfUserProfile,
    getUserProfile,
    getUserReviews,
    getFriendsRequests,
    completeFriendRequest,
    getUserFriends
} from "@/repositories/userRepository";
import type { DynamicPagination, FriendRequest, Review, User } from "@/types";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    useToast,
} from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { useLangStore } from "@/stores/langStore";
import { useAuthStore } from "@/stores/authStore";
import FriendRequestComponent from "@/components/friendRequestComponent.vue";
import ReviewOnUserComponent from "@/components/reviewOnUserComponent.vue";
import { useNotificationsStore } from "@/stores/notificationStore";
import FriendWithFollow from "@/components/friendWithFollow.vue";
import FriendshipStatusComponent from "@/components/friendshipStatusComponent.vue";
import type TranslatedError from "@/exceptions/TranslatedError";

const route = useRoute();
const user = ref<User>({} as User);
const loadingProfile = ref<boolean>(false);
const loadingReviews = ref<boolean>(false);
const loadingRequests = ref<boolean>(false);
const loadingFriends = ref<boolean>(false);
const toast = useToast();
const { t } = useI18n();
const router = useRouter();
const reviews = ref<DynamicPagination<Review>>({} as DynamicPagination<Review>);
const friendRequests = ref<DynamicPagination<FriendRequest>>({} as DynamicPagination<FriendRequest>);
const friends = ref<DynamicPagination<User>>({} as DynamicPagination<User>);
const langStore = useLangStore();
const authStore = useAuthStore();
const isSelfProfile = ref<boolean>(false);
const editProfileModalVisible = ref<boolean>(false);
const notificationsStore = useNotificationsStore();

const fetchUserProfile = async () => {
    const { slug } = route.params;
    loadingProfile.value = true;
    try {
        if (!slug) {
            const userProfile = await getSelfUserProfile();
            user.value = userProfile;
            isSelfProfile.value = true;
            return;
        }
        const userProfile = await getUserProfile(slug as string);
        if (userProfile.id == authStore.user?.user_id) {
            isSelfProfile.value = true;
        }
        user.value = userProfile;
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail:
                error.response?.data?.message || t("user.error.fetchingProfile"),
        });
        router.push({ name: "NotFound" });
    } finally {
        loadingProfile.value = false;
    }
};

const fetchUserReviews = async (lastId?: number) => {
    loadingReviews.value = true;
    try {
        const data = await getUserReviews(user.value.username, lastId);
        if (!reviews.value.results) {
            reviews.value = data;
            return;
        }
        reviews.value.results.push(...data.results);
        reviews.value.next_last_id = data.next_last_id;
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.response?.data?.message || t("user.error.fetchingReviews"),
        });
    } finally {
        loadingReviews.value = false;
    }
};

const fetchUserFriendRequests = async (lastId?: number) => {
    loadingRequests.value = true;
    try {
        const requests = await getFriendsRequests(lastId);
        if (!friendRequests.value.results) {
            friendRequests.value = requests;
            return
        }
        friendRequests.value.results.push(...requests.results);
        friendRequests.value.next_last_id = requests.next_last_id;

    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail:
                error.response?.data?.message || t("user.error.fetchingFriendRequests"),
        });
    } finally {
        loadingRequests.value = false;
    }
}
const fetchUserFriends = async (lastId?: number) => {
    loadingFriends.value = true;
    try {
        const data = await getUserFriends(user.value.username, lastId);
        if (!friends.value.results) {
            friends.value = data;
            return;
        }
        friends.value.results.push(...data.results);
        friends.value.next_last_id = data.next_last_id;
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.response?.data?.message || t("user.error.fetchingFriends"),
        });
    } finally {
        loadingFriends.value = false;
    }
};
const acceptFriendRequest = async (username: string) => {
    try {
        await completeFriendRequest(username, true);
        friendRequests.value = {} as DynamicPagination<FriendRequest>;
        await fetchUserFriendRequests();
        notificationsStore.set(friendRequests.value.count ?? 0);
        toast.add({
            severity: "success",
            summary: t("toast.success"),
            detail: t("user.friendRequestAccepted"),
        });
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.response?.data?.message || t("user.error.acceptingFriendRequest"),
        });
    }
};

const rejectFriendRequest = async (username: string) => {
    try {
        await completeFriendRequest(username, false);
        friendRequests.value = {} as DynamicPagination<FriendRequest>;
        await fetchUserFriendRequests();
        notificationsStore.set(friendRequests.value.count ?? 0);
        toast.add({
            severity: "success",
            summary: t("toast.success"),
            detail: t("user.friendRequestRejected"),
        });
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.response?.data?.message || t("user.error.rejectingFriendRequest"),
        });
    }
};

const sendFriendRequest = async (username: string) => {
    console.log("Sending friend request to", username);
    try {
        await completeFriendRequest(username, true);
        toast.add({
            severity: "success",
            summary: t("toast.success"),
            detail: t("user.friendRequestSent"),
        });
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.translatedMessage
        });
        throw error;
    }
};


const { sentinelRef: reviewsSentinelRef } = useInfiniteScroll(async () => {
    if (loadingReviews.value) return;
    loadingReviews.value = true;
    const lastId = reviews.value.next_last_id;
    if (lastId) await fetchUserReviews(lastId);
    loadingReviews.value = false;
});

const { sentinelRef: friendRequestsSentinelRef } = useInfiniteScroll(async () => {
    if (loadingRequests.value) return;
    loadingRequests.value = true;
    const lastId = friendRequests.value.next_last_id;
    if (lastId) await fetchUserFriendRequests(lastId);
    loadingRequests.value = false;
});
const { sentinelRef: friendsSentinelRef } = useInfiniteScroll(async () => {
    if (loadingFriends.value) return;
    loadingFriends.value = true;
    const lastId = friends.value.next_last_id;
    if (lastId) await fetchUserFriends(lastId);
    loadingFriends.value = false;
});

watch(
    () => [route.params.slug, langStore.language],
    async () => {
        reviews.value = {} as DynamicPagination<Review>;
        friendRequests.value = {} as DynamicPagination<FriendRequest>;
        friends.value = {} as DynamicPagination<User>;
        isSelfProfile.value = false;
        await Promise.all([
            await fetchUserProfile(),
            fetchUserFriendRequests(),
            fetchUserReviews(),
            fetchUserFriends(),
        ]);
    }, { immediate: true }
);

</script>

<template>
    <div class="page">
        <div class="layout">
            <aside class="sidebar">
                <div class="card">
                    <div class="card-image">
                        <img :src="user.picture" :alt="user.username" class="card-img" />
                    </div>

                    <div class="card-body">
                        <h1 class="user-name" :style="isSelfProfile ? 'text-align: start' : 'text-align: center'">{{
                            user.username }}</h1>
                        <button v-if="isSelfProfile" @click="editProfileModalVisible = true" class="btn-edit">
                            {{ $t("user.editProfile") }}
                        </button>
                        <FriendshipStatusComponent v-else :user="user" :onAddFriend="sendFriendRequest" />
                    </div>

                </div>
            </aside>
            <div class="content">
                <!-- BIOGRAPHY -->
                <Accordion value="0">
                    <AccordionPanel value="0" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-book accent-icon" />
                            <h2 class="section-title">{{ t("user.biography") }}</h2>
                        </AccordionHeader>
                        <AccordionContent class="section-body">
                            <p v-if="user.bio" class="biography">{{ user.bio }}</p>
                            <p v-else class="empty-text">{{ t("user.no_biography") }}</p>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <!-- REVIEWS -->
                <Accordion :value="reviews.results?.length ? '0' : '1'">
                    <AccordionPanel value="0" v-if="reviews.results?.length" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-file-word accent-icon" />
                            <h2 class="section-title">
                                {{ t("user.reviews") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent v-if="reviews.results" class="section-body">
                            <div class="scroll-container">
                                <div class="user-grid">
                                    <ReviewOnUserComponent v-for="review in reviews.results" :key="review.id"
                                        :review="review" />
                                    <div :ref="reviewsSentinelRef as any" class="sentinel" />
                                    <div v-if="loadingReviews" class="loading-footer">
                                        <i class="pi pi-spin pi-spinner"></i>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel v-else value="1" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-file-word accent-icon" />
                            <h2 class="section-title">
                                {{ t("user.reviews") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent
                            class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
                            <div class="flex flex-col items-center justify-center text-center">
                                <div
                                    class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                                    <i class="pi pi-file-word text-3xl text-secondary"></i>
                                </div>
                                <h3 class="text-xl font-semibold opacity-70">
                                    {{ t("user.no_reviews") }}
                                </h3>
                                <p class="text-sm opacity-50 max-w-xs mx-auto">
                                    {{ t("user.no_reviews_description") }}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <!-- MOVIES LISTS -->

            </div>
            <!-- FRIENDS SECTION -->
            <div class="content friends-section">
                <!-- FRIEND REQUESTS -->
                <Accordion :value="1" v-if="isSelfProfile">
                    <AccordionPanel :value="1" v-if="friendRequests.results?.length" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-users primary-icon" />
                            <h2 class="section-title">
                                {{ t("user.friendsRequests") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent v-if="friendRequests.results" class="section-body">
                            <div class="scroll-container">
                                <FriendRequestComponent v-for="request in friendRequests.results" :key="request.id"
                                    :request="request" @accept="acceptFriendRequest" @decline="rejectFriendRequest" />
                                <div :ref="friendRequestsSentinelRef as any" class="sentinel" />
                                <div v-if="loadingRequests" class="loading-footer">
                                    <i class="pi pi-spin pi-spinner"></i>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>

                    <AccordionPanel :value="2" v-if="!friendRequests.results?.length" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-users primary-icon" />
                            <h2 class="section-title">
                                {{ t("user.friendsRequests") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent
                            class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
                            <div class="flex flex-col items-center justify-center text-center">
                                <div
                                    class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                                    <i class="pi pi-users text-3xl text-secondary"></i>
                                </div>
                                <h3 class="text-xl font-semibold opacity-70">
                                    {{ t("user.no_friends_requests") }}
                                </h3>
                                <p class="text-sm opacity-50 max-w-xs mx-auto">
                                    {{ t("user.no_friends_requests_description") }}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>

                <!-- FRIENDS -->
                <Accordion>
                    <AccordionPanel :value="1" v-if="friends.results?.length" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-users primary-icon" />
                            <h2 class="section-title">
                                {{ t("user.friends") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent v-if="friends.results" class="section-body">
                            <div class="scroll-container">
                                <FriendWithFollow v-for="friend in friends.results" :key="friend.id" :user="friend"
                                    :isSelfUser="isSelfProfile" :onAddFriend="sendFriendRequest" />
                                <div :ref="friendsSentinelRef as any" class="sentinel" />
                                <div v-if="loadingFriends" class="loading-footer">
                                    <i class="pi pi-spin pi-spinner"></i>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>

                    <AccordionPanel :value="2" v-if="!friends.results?.length" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-users primary-icon" />
                            <h2 class="section-title">
                                {{ t("user.friends") }}
                            </h2>
                        </AccordionHeader>
                        <AccordionContent
                            class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
                            <div class="flex flex-col items-center justify-center text-center">
                                <div
                                    class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                                    <i class="pi pi-users text-3xl text-secondary"></i>
                                </div>
                                <h3 class="text-xl font-semibold opacity-70">
                                    {{ t("user.no_friends") }}
                                </h3>
                                <p class="text-sm opacity-50 max-w-xs mx-auto">
                                    {{ t("user.no_friends_description") }}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>

                <!-- SUGGESTED FRIENDS -->

            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-accordionheader) {
    color: var(--text);
}

:deep(.p-accordioncontent-content) {
    all: unset;
}

/* ── Page ──────────────────────────────────────────────── */
.page {
    min-height: 100vh;
    background: var(--background);
    color: var(--text);
    font-family: "Inter", sans-serif;
    padding: 1rem;
}

@media (min-width: 768px) {
    .page {
        padding: 1.5rem;
    }
}

@media (min-width: 1024px) {
    .page {
        padding: 2.5rem;
    }
}

/* ── Layout ────────────────────────────────────────────── */
.layout {
    max-width: 1600px;
    margin: 0 auto;
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.sidebar {
    order: 1;
    width: 100%;

}

.content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    order: 3;
}

.content.friends-section {
    order: 2;
}

@media (min-width: 768px) {
    .layout {
        grid-template-columns: 3fr 3fr;
    }

    .sidebar {
        order: 1;
    }

    .content {
        order: 2;
    }

    .content.friends-section {
        order: 3;
    }
}


@media (min-width: 1024px) {
    .layout {
        grid-template-columns: 1.5fr 3fr 1.5fr;
    }
}

.card {
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.sticky-card {
    position: sticky;
    top: 1.5rem;
}

.card-image {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--secondary);
}

.card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
}

.gender-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 10px !important;
    font-weight: 900 !important;
    padding: 0.25rem 0.75rem !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
}

.user-name {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--primary);
    margin: 0;
    vertical-align: middle;
}

.dates {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.7rem;
    color: var(--gray);
}

.date-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.accent-icon {
    color: var(--accent);
}

.death-icon {
    color: #ef4444;
}


/* ── Section ───────────────────────────────────────────── */
.section {
    border-radius: 1.5rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--secondary);
    background: rgba(255, 255, 255, 0.05);
}

.section-title {
    font-weight: 900;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.7;
    margin: 0;
}

.section-body {
    padding: 1.5rem;
}

/* ── Biography ─────────────────────────────────────────── */
.biography {
    font-size: 0.95rem;
    line-height: 1.75;
    white-space: pre-line;
    font-weight: 300;
    margin: 0;
}

.empty-text {
    font-size: 0.875rem;
    color: var(--gray);
    font-style: italic;
    margin: 0;
}

:deep(.user-grid) {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
}

.scroll-container {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.scroll-container::-webkit-scrollbar {
    width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
    background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 999px;
}

.sentinel {
    height: 1px;
}

.loading-footer {
    display: flex;
    justify-content: center;
    padding: 1rem;
}

.btn-edit {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid var(--primary);
    background: transparent;
    color: var(--primary);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.1s;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-edit:hover {
    background: var(--primary);
    color: var(--background);
}

.btn-edit:active {
    transform: scale(0.97);
}
</style>
