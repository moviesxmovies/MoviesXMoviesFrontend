<script lang="ts" setup>
import {
    getSelfUserProfile,
    getUserProfile,
    getUserReviews,
    getFriendsRequests,
    completeFriendRequest,
    getUserFriends,
    getSuggestedFriends,
    getUserMoviesLists,
} from '@/repositories/userRepository';
import type { FriendRequest, MovieList, Review, User } from '@/types';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel, Skeleton, useToast } from 'primevue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useLangStore } from '@/stores/langStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationsStore } from '@/stores/notificationStore';
import { usePaginatedFetch } from '@/composables/usePaginatedFetch';
import { useInfinitePagination } from '@/composables/useInfinitePagination';
import FriendRequestComponent from '@/components/friendRequestComponent.vue';
import ReviewOnUserComponent from '@/components/reviewOnUserComponent.vue';
import FriendWithFollow from '@/components/friendWithFollow.vue';
import FriendshipStatusComponent from '@/components/friendshipStatusComponent.vue';
import MoviesListComponent from '@/components/moviesListComponent.vue';
import SectionAccordion from '@/components/sectionAccordion.vue';
import EditProfileModal from '@/components/editProfileModal.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const langStore = useLangStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const user = ref<User>({} as User);
const loadingProfile = ref(false);
const isSelfProfile = ref(false);
const editProfileModalVisible = ref(false);

const isMobile = ref(window.innerWidth < 640);
const handleResize = () => {
    isMobile.value = window.innerWidth < 640;
};


const { data: reviews, loading: loadingReviews, fetch: fetchReviews, reset: resetReviews } = usePaginatedFetch<Review>();
const { data: friendRequests, loading: loadingRequests, fetch: fetchRequests, reset: resetRequests } = usePaginatedFetch<FriendRequest>();
const { data: friends, loading: loadingFriends, fetch: fetchFriends, reset: resetFriends } = usePaginatedFetch<User>();
const { data: suggestedFriends, loading: loadingSuggestedFriends, fetch: fetchSuggestedData, reset: resetSuggestedFriends } = usePaginatedFetch<User>();
const { data: moviesLists, loading: loadingMoviesLists, fetch: fetchMoviesListsData, reset: resetMoviesLists } = usePaginatedFetch<MovieList>();

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
            severity: 'error',
            summary: t('toast.error'),
            detail: error.response?.data?.message || t('user.error.fetchingProfile'),
        });
        router.push({ name: 'NotFound' });
    } finally {
        loadingProfile.value = false;
    }
};

const fetchUserReviews = (lastId?: number) =>
    fetchReviews((id) => getUserReviews(user.value.username, id), lastId);

const fetchUserFriendRequests = (lastId?: number) =>
    fetchRequests((id) => getFriendsRequests(id), lastId);

const fetchUserFriends = (lastId?: number) =>
    fetchFriends((id) => getUserFriends(user.value.username, id), lastId);

const fetchUserSuggestedFriends = (lastId?: number) =>
    fetchSuggestedData((id) => getSuggestedFriends(user.value.username, id), lastId);

const fetchMoviesLists = (lastId?: number) =>
    fetchMoviesListsData((id) => getUserMoviesLists(user.value.username, id), lastId);

const acceptFriendRequest = async (username: string) => {
    try {
        await completeFriendRequest(username, true);
        resetRequests();
        await fetchUserFriendRequests();
        resetFriends();
        fetchUserFriends();
        notificationsStore.set(friendRequests.value.count ?? 0);
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('user.friendRequestAccepted') });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: t('toast.error'), detail: error.response?.data?.message || t('user.error.acceptingFriendRequest') });
    }
};

const rejectFriendRequest = async (username: string) => {
    try {
        await completeFriendRequest(username, false);
        resetRequests();
        await fetchUserFriendRequests();
        notificationsStore.set(friendRequests.value.count ?? 0);
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('user.friendRequestRejected') });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: t('toast.error'), detail: error.response?.data?.message || t('user.error.rejectingFriendRequest') });
    }
};

const sendFriendRequest = async (username: string) => {
    try {
        await completeFriendRequest(username, true);
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('user.friendRequestSent') });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: t('toast.error'), detail: error.translatedMessage });
        throw error;
    }
};

const logout = () => {
    authStore.logout();
    router.push({ name: 'welcome' });
};

const { sentinelRef: reviewsSentinelRef } = useInfinitePagination(reviews, loadingReviews, fetchUserReviews);
const { sentinelRef: friendRequestsSentinelRef } = useInfinitePagination(friendRequests, loadingRequests, fetchUserFriendRequests);
const { sentinelRef: friendsSentinelRef } = useInfinitePagination(friends, loadingFriends, fetchUserFriends);
const { sentinelRef: suggestedFriendsSentinelRef } = useInfinitePagination(suggestedFriends, loadingSuggestedFriends, fetchUserSuggestedFriends);
const { sentinelRef: moviesListsSentinelRef } = useInfinitePagination(moviesLists, loadingMoviesLists, fetchMoviesLists);
onMounted(() => {
    window.addEventListener('resize', handleResize);

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });
});
watch(
    () => [route.params.slug, langStore.language],
    async () => {

        resetReviews();
        resetRequests();
        resetFriends();
        resetSuggestedFriends();
        resetMoviesLists();
        isSelfProfile.value = false;
        await Promise.all([
            await fetchUserProfile(),
            fetchUserFriendRequests(),
            fetchUserReviews(),
            fetchUserFriends(),
            fetchUserSuggestedFriends(),
            fetchMoviesLists(),
        ]);
    },
    { immediate: true }
);
</script>

<template>
    <EditProfileModal v-model:visible="editProfileModalVisible" @updated="(updatedUser) => user = updatedUser" />
    <div class="page">
        <div class="layout">
            <aside class="sidebar">
                <div class="card">
                    <template v-if="loadingProfile">
                        <div class="card-image">
                            <Skeleton width="100%" height="100%" />
                        </div>
                        <div class="card-body">
                            <Skeleton width="120px" height="20px" border-radius="8px" />
                            <Skeleton width="80px" height="32px" border-radius="999px" />
                        </div>
                    </template>
                    <template v-else>
                        <div class="card-image">
                            <img :src="user.picture" :alt="user.username" class="card-img" />
                        </div>
                        <div class="card-body">
                            <h1 class="user-name" :style="isSelfProfile ? 'text-align: start' : 'text-align: center'">
                                {{ user.username }}
                            </h1>
                            <button v-if="isSelfProfile && isMobile" class="btn-logout" @click="logout">
                                {{ $t('user.logout') }}
                            </button>
                            <button v-if="isSelfProfile" @click="editProfileModalVisible = true" class="btn-edit">
                                {{ $t('user.editProfile') }}
                            </button>
                            <FriendshipStatusComponent v-else :user="user" :onAddFriend="sendFriendRequest" />
                        </div>
                    </template>
                </div>
            </aside>

            <div class="content">
                <!-- BIOGRAPHY -->
                <Accordion value="0">
                    <AccordionPanel value="0" class="section">
                        <AccordionHeader class="section-header">
                            <i class="pi pi-book accent-icon" />
                            <h2 class="section-title">{{ t('user.biography') }}</h2>
                        </AccordionHeader>
                        <AccordionContent class="section-body">
                            <p v-if="user.bio" class="biography">{{ user.bio }}</p>
                            <p v-else class="empty-text">{{ t('user.no_biography') }}</p>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>

                <!-- REVIEWS -->
                <SectionAccordion icon="pi pi-file-word accent-icon" :title="t('user.reviews')"
                    :isEmpty="!reviews.results?.length" :emptyIcon="'pi pi-file-word'"
                    :emptyTitle="t('user.no_reviews')" :emptyDescription="t('user.no_reviews_description')"
                    :loading="loadingReviews" v-model:sentinelRef="reviewsSentinelRef" defaultOpen>
                    <ReviewOnUserComponent v-for="review in reviews.results" :key="review.id" :review="review" />

                </SectionAccordion>

                <!-- MOVIES LISTS -->
                <SectionAccordion icon="pi pi-folder accent-icon" :title="t('user.movies_lists')"
                    :isEmpty="!moviesLists.results?.length" :emptyIcon="'pi pi-folder'"
                    :emptyTitle="t('user.no_movies_lists')" :emptyDescription="t('user.no_movies_lists_description')"
                    :loading="loadingMoviesLists" v-model:sentinelRef="moviesListsSentinelRef">
                    <div class="movies-lists-grid">
                        <MoviesListComponent v-for="movieList in moviesLists.results" :key="movieList.id"
                            :movieList="movieList" />
                    </div>
                </SectionAccordion>
            </div>

            <!-- FRIENDS SECTION -->
            <div class="content friends-section">
                <!-- FRIEND REQUESTS -->
                <SectionAccordion v-if="isSelfProfile" icon="pi pi-bell" :title="t('user.friendsRequests')"
                    :isEmpty="!friendRequests.results?.length" :emptyIcon="'pi pi-users'"
                    :emptyTitle="t('user.no_friends_requests')"
                    :emptyDescription="t('user.no_friends_requests_description')" :loading="loadingRequests"
                    :panelHeight="'200px'" :defaultOpen="!!friendRequests.results?.length">
                    <FriendRequestComponent v-for="request in friendRequests.results" :key="request.id"
                        :request="request" @accept="acceptFriendRequest" @decline="rejectFriendRequest" />
                    <div :ref="(el) => { friendRequestsSentinelRef = el as HTMLElement }" class="sentinel" />
                </SectionAccordion>

                <!-- FRIENDS -->
                <SectionAccordion icon="pi pi-users" :title="t('user.friends')" :isEmpty="!friends.results?.length"
                    :emptyIcon="'pi pi-users'" :emptyTitle="t('user.no_friends')"
                    :emptyDescription="t('user.no_friends_description')" :loading="loadingFriends"
                    v-model:sentinelRef="friendsSentinelRef">
                    <FriendWithFollow v-for="friend in friends.results" :key="friend.id" :user="friend"
                        :isSelfUser="isSelfProfile" :onAddFriend="sendFriendRequest" />
                </SectionAccordion>

                <!-- SUGGESTED FRIENDS -->
                <SectionAccordion icon="pi pi-lightbulb" :title="t('user.suggested_friends')"
                    :isEmpty="!suggestedFriends.results?.length" :emptyIcon="'pi pi-users'"
                    :emptyTitle="t('user.no_suggested_friends')"
                    :emptyDescription="t('user.no_suggested_friends_description')" :loading="loadingSuggestedFriends"
                    v-model:sentinelRef="suggestedFriendsSentinelRef">
                    <FriendWithFollow v-for="friend in suggestedFriends.results" :key="friend.id" :user="friend"
                        :onAddFriend="sendFriendRequest" />
                </SectionAccordion>
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

.page {
    min-height: 100vh;
    background: var(--background);
    color: var(--text);
    font-family: 'Inter', sans-serif;
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

    :deep(.movies-lists-grid) {
        grid-template-columns: repeat(3, 1fr);
    }
}

.card {
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
}

.accent-icon {
    color: var(--accent);
}

.primary-icon {
    color: var(--primary);
}

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

:deep(.movies-lists-grid) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.sentinel {
    height: 1px;
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

.btn-logout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid var(--red);
    background: transparent;
    color: var(--red);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.1s;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-logout:hover {
    background: var(--red);
    color: var(--background);
}

.btn-logout:active {
    transform: scale(0.97);
}
</style>