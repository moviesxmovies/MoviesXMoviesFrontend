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
  getUserTranslations,
  removeFriend,
} from "@/repositories/userRepository";
import type { FriendRequest, MovieList, Review, User } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Skeleton,
  useToast,
  Dialog,
} from "primevue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useLangStore } from "@/stores/langStore";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationsStore } from "@/stores/notificationStore";
import { usePaginatedFetch } from "@/composables/usePaginatedFetch";
import { useInfinitePagination } from "@/composables/useInfinitePagination";
import FriendRequestComponent from "@/components/friendRequestComponent.vue";
import ReviewComponent from "@/components/reviewComponent.vue";
import FriendshipStatusComponent from "@/components/friendshipStatusComponent.vue";
import MoviesListComponent from "@/components/moviesListComponent.vue";
import SectionAccordion from "@/components/sectionAccordion.vue";
import EditProfileModal from "@/components/editProfileModal.vue";
import { refreshToken } from "@/repositories/auth/authRepository";
import { useProfileStore } from "@/stores/profileStore";
import ChoiceMovieListTypeModal from "@/components/choiceMovieListTypeModal.vue";
import { useTranslation } from "@/composables/useTranslation";
import TranslateButton from "@/components/translateButton.vue";
import HandleFriendshipComponent from "@/components/handleFriendshipComponent.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const langStore = useLangStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const profileStore = useProfileStore();

const user = ref<User>({} as User);
const loadingProfile = ref(false);
const isSelfProfile = ref(false);
const editProfileModalVisible = ref(false);
const choiceMovieListTypeModalVisible = ref(false);

const confirmLogoutVisible = ref(false);
const confirmRemoveFriendVisible = ref(false);
const pendingRemoveFriendUsername = ref<string | null>(null);

const isMobile = ref(window.innerWidth < 640);
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};
const renderedBiography = computed(() => {
  if (
    isTranslated.value &&
    translatedData.value &&
    "bio" in translatedData.value
  ) {
    return translatedData.value.bio;
  }
  return user.value.bio;
});

const {
  data: reviews,
  loading: loadingReviews,
  fetch: fetchReviews,
  reset: resetReviews,
} = usePaginatedFetch<Review>();
const {
  data: friendRequests,
  loading: loadingRequests,
  fetch: fetchRequests,
  reset: resetRequests,
} = usePaginatedFetch<FriendRequest>();
const {
  data: friends,
  loading: loadingFriends,
  fetch: fetchFriends,
  reset: resetFriends,
} = usePaginatedFetch<User>();
const {
  data: suggestedFriends,
  loading: loadingSuggestedFriends,
  fetch: fetchSuggestedData,
  reset: resetSuggestedFriends,
} = usePaginatedFetch<User>();
const {
  data: moviesLists,
  loading: loadingMoviesLists,
  fetch: fetchMoviesListsData,
  reset: resetMoviesLists,
} = usePaginatedFetch<MovieList>();
const {
  isTranslated,
  translatedData,
  translate,
  isLoading,
  error,
  reset: resetTranslation,
} = useTranslation(() => getUserTranslations(user.value.username));

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
      detail: error.response?.data?.message || t("user.error.fetchingProfile"),
    });
    router.push({ name: "NotFound" });
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
  fetchSuggestedData(
    (id) => getSuggestedFriends(user.value.username, id),
    lastId,
  );

const fetchMoviesLists = (lastId?: number) =>
  fetchMoviesListsData(
    (id) => getUserMoviesLists(user.value.username, id),
    lastId,
  );

const acceptFriendRequest = async (username: string) => {
  try {
    await completeFriendRequest(username, true);
    resetRequests();
    await fetchUserFriendRequests();
    resetFriends();
    fetchUserFriends();
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
      detail:
        error.response?.data?.message || t("user.error.acceptingFriendRequest"),
    });
  }
};

const rejectFriendRequest = async (username: string) => {
  try {
    await completeFriendRequest(username, false);
    resetRequests();
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
      detail:
        error.response?.data?.message || t("user.error.rejectingFriendRequest"),
    });
  }
};

const logout = () => {
  confirmLogoutVisible.value = true;
};

const logoutConfirm = () => {
  confirmLogoutVisible.value = false;
  authStore.logout();
  router.push({ name: "welcome" });
};

const openRemoveFriendDialog = async (username: string) => {
  pendingRemoveFriendUsername.value = username;
  confirmRemoveFriendVisible.value = true;
};

const removeFriendConfirm = async () => {
  if (!pendingRemoveFriendUsername.value) return;
  confirmRemoveFriendVisible.value = false;
  try {
    await removeFriend(pendingRemoveFriendUsername.value);
    resetFriends();
    fetchUserFriends();
    user.value.friendship = { is_friend: false, status: null };
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("user.error.removingFriend"),
    });
  } finally {
    pendingRemoveFriendUsername.value = null;
  }
};

const { sentinelRef: reviewsSentinelRef } = useInfinitePagination(
  reviews,
  loadingReviews,
  fetchUserReviews,
);
const { sentinelRef: friendRequestsSentinelRef } = useInfinitePagination(
  friendRequests,
  loadingRequests,
  fetchUserFriendRequests,
);
const { sentinelRef: friendsSentinelRef } = useInfinitePagination(
  friends,
  loadingFriends,
  fetchUserFriends,
);
const { sentinelRef: suggestedFriendsSentinelRef } = useInfinitePagination(
  suggestedFriends,
  loadingSuggestedFriends,
  fetchUserSuggestedFriends,
);
const { sentinelRef: moviesListsSentinelRef } = useInfinitePagination(
  moviesLists,
  loadingMoviesLists,
  fetchMoviesLists,
);

const emailChanged = async () => {
  router.push("/verify-email");
};

const onUpdated = async (userUpdated: User) => {
  user.value = userUpdated;
  await refreshToken();
  profileStore.refresh();
};

const createNormalList = () => {};

const createIntelligentList = () => {};

const movieListDialogConfig = {
  icon: "pi pi-plus",
  label: t("user.addMoviesList"),
  onClick: () => {
    choiceMovieListTypeModalVisible.value = true;
  },
};

const reloadLists = async () => {
  resetMoviesLists();
  fetchMoviesLists();
};

onMounted(() => {
  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
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
      resetTranslation(),
    ]);
  },
  { immediate: true },
);
</script>

<template>
  <ChoiceMovieListTypeModal
    v-model:visible="choiceMovieListTypeModalVisible"
    @create-normal-list="createNormalList"
    @create-intelligent-list="createIntelligentList"
    @reload-lists="reloadLists"
  />
  <EditProfileModal
    v-model:visible="editProfileModalVisible"
    @updated="onUpdated"
    @emailChanged="emailChanged"
  />

  <!-- CONFIRM LOGOUT DIALOG -->
  <Dialog
    v-model:visible="confirmLogoutVisible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :style="{ width: '90vw', maxWidth: '380px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)] pb-0' },
      title: { class: 'text-xl font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      footer: {
        class: 'bg-[var(--background)] border-t border-[var(--secondary)]',
      },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <template #header>
      <div class="confirm-header">
        <div class="confirm-icon" aria-hidden="true">
          <i class="pi pi-sign-out" />
        </div>
        <div>
          <p class="confirm-title">{{ t("user.logoutConfirmTitle") }}</p>
        </div>
      </div>
    </template>
    <p class="confirm-body">{{ t("user.logoutConfirmBody") }}</p>
    <template #footer>
      <div class="footer-actions">
        <button class="btn-cancel" @click="confirmLogoutVisible = false">
          {{ t("common.cancel") }}
        </button>
        <button class="btn-danger" @click="logoutConfirm">
          <i class="pi pi-sign-out" />
          <span>{{ t("user.logout") }}</span>
        </button>
      </div>
    </template>
  </Dialog>

  <!-- CONFIRM REMOVE FRIEND DIALOG -->
  <Dialog
    v-model:visible="confirmRemoveFriendVisible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :style="{ width: '90vw', maxWidth: '380px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)] pb-0' },
      title: { class: 'text-xl font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      footer: {
        class: 'bg-[var(--background)] border-t border-[var(--secondary)]',
      },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <template #header>
      <div class="confirm-header">
        <div class="confirm-icon" aria-hidden="true">
          <i class="pi pi-user-minus" />
        </div>
        <div>
          <p class="confirm-title">{{ t("user.confirmation") }}</p>
        </div>
      </div>
    </template>
    <p class="confirm-body">
      {{ t("user.confirmRemoveFriend") }}
    </p>
    <template #footer>
      <div class="footer-actions">
        <button class="btn-cancel" @click="confirmRemoveFriendVisible = false">
          {{ t("common.cancel") }}
        </button>
        <button class="btn-danger" @click="removeFriendConfirm">
          <i class="pi pi-user-minus" />
          <span>{{ t("common.confirm") }}</span>
        </button>
      </div>
    </template>
  </Dialog>

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
              <div class="user-heading">
                <h1 class="user-name">{{ user.username }}</h1>
                <p v-if="isSelfProfile" class="user-handle">{{ $t("home.profile") }}</p>
              </div>
              <button
                v-if="isSelfProfile && isMobile"
                class="btn-logout"
                @click="logout"
              >
                {{ $t("user.logout") }}
              </button>
              <button
                v-if="isSelfProfile"
                @click="editProfileModalVisible = true"
                class="btn-edit"
              >
                <i class="pi pi-user-edit" aria-hidden="true" />
                {{ $t("user.editProfile") }}
              </button>
              <FriendshipStatusComponent
                v-else
                :user="user"
                @add-friend="
                  (username) => completeFriendRequest(username, true)
                "
                @remove-friend="(username) => openRemoveFriendDialog(username)"
                @remove-pending="
                  (username) => completeFriendRequest(username, false)
                "
              />
            </div>
          </template>
        </div>
      </aside>

      <div class="content">
        <!-- BIOGRAPHY -->
        <Accordion value="0">
          <AccordionPanel value="0" class="section">
            <AccordionHeader class="section-header">
              <span class="section-icon" aria-hidden="true"><i class="pi pi-book" /></span>
              <h2 class="section-title">{{ t("user.biography") }}</h2>
            </AccordionHeader>
            <AccordionContent class="section-body">
              <div v-if="user.bio" class="biography-container">
                <p class="biography">{{ renderedBiography }}</p>
                <TranslateButton
                  v-if="!isSelfProfile"
                  :is-translated="isTranslated"
                  :is-loading="isLoading"
                  :error="error"
                  @translate="translate"
                />
              </div>
              <p v-else class="empty-text">{{ t("user.no_biography") }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>

        <!-- REVIEWS -->
        <SectionAccordion
          icon="pi pi-file-word accent-icon"
          :title="t('user.reviews')"
          :isEmpty="!reviews.results?.length"
          :emptyIcon="'pi pi-file-word'"
          :emptyTitle="t('user.no_reviews')"
          :emptyDescription="t('user.no_reviews_description')"
          :loading="loadingReviews"
          v-model:sentinelRef="reviewsSentinelRef"
          defaultOpen
        >
          <ReviewComponent
            v-for="review in reviews.results"
            :key="review.id"
            :review="review"
            @deleted="
              () => {
                resetReviews();
                fetchUserReviews();
              }
            "
            @reload="
              () => {
                resetReviews();
                fetchUserReviews();
              }
            "
          />
        </SectionAccordion>

        <!-- MOVIES LISTS -->
        <SectionAccordion
          icon="pi pi-folder accent-icon"
          :title="t('user.movies_lists')"
          :isEmpty="!moviesLists.results?.length"
          :emptyIcon="'pi pi-folder'"
          :emptyTitle="t('user.no_movies_lists')"
          :emptyDescription="t('user.no_movies_lists_description')"
          :loading="loadingMoviesLists"
          v-model:sentinelRef="moviesListsSentinelRef"
          :dialogOptions="isSelfProfile ? movieListDialogConfig : undefined"
        >
          <div class="movies-lists-grid">
            <MoviesListComponent
              v-for="movieList in moviesLists.results"
              :key="movieList.id"
              :movieList="movieList"
            />
          </div>
        </SectionAccordion>
      </div>

      <!-- FRIENDS SECTION -->
      <div class="content friends-section">
        <!-- FRIEND REQUESTS -->
        <SectionAccordion
          v-if="isSelfProfile"
          icon="pi pi-bell"
          :title="t('user.friendsRequests')"
          :isEmpty="!friendRequests.results?.length"
          :emptyIcon="'pi pi-users'"
          :emptyTitle="t('user.no_friends_requests')"
          :emptyDescription="t('user.no_friends_requests_description')"
          :loading="loadingRequests"
          :panelHeight="'200px'"
          :defaultOpen="!!friendRequests.results?.length"
        >
          <FriendRequestComponent
            v-for="request in friendRequests.results"
            :key="request.id"
            :request="request"
            @accept="acceptFriendRequest"
            @decline="rejectFriendRequest"
          />
          <div
            :ref="
              (el) => {
                friendRequestsSentinelRef = el as HTMLElement;
              }
            "
            class="sentinel"
          />
        </SectionAccordion>

        <!-- FRIENDS -->
        <SectionAccordion
          icon="pi pi-users"
          :title="t('user.friends')"
          :isEmpty="!friends.results?.length"
          :emptyIcon="'pi pi-users'"
          :emptyTitle="t('user.no_friends')"
          :emptyDescription="t('user.no_friends_description')"
          :loading="loadingFriends"
          v-model:sentinelRef="friendsSentinelRef"
        >
          <HandleFriendshipComponent :users="friends.results" />
        </SectionAccordion>

        <!-- SUGGESTED FRIENDS -->
        <SectionAccordion
          icon="pi pi-lightbulb"
          :title="t('user.suggested_friends')"
          :isEmpty="!suggestedFriends.results?.length"
          :emptyIcon="'pi pi-users'"
          :emptyTitle="t('user.no_suggested_friends')"
          :emptyDescription="t('user.no_suggested_friends_description')"
          :loading="loadingSuggestedFriends"
          v-model:sentinelRef="suggestedFriendsSentinelRef"
        >
          <HandleFriendshipComponent :users="suggestedFriends.results" />
        </SectionAccordion>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-accordionheader) {
  color: var(--text);
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
}

:deep(.p-accordionheader:hover) {
  background: var(--surface-2) !important;
}

:deep(.p-accordionheader[aria-expanded="true"]) {
  border-bottom: 1px solid var(--border) !important;
}

:deep(.p-accordionheader-toggle-icon) {
  color: var(--text-subtle);
}

:deep(.p-accordionpanel) {
  border: none;
}

:deep(.p-accordioncontent-content) {
  all: unset;
}

.page {
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  padding: 5rem 1rem 2rem;
}

@media (min-width: 768px) {
  .page {
    padding: 5.25rem 1.5rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .page {
    padding: 5.5rem 2rem 3rem;
  }
}

.layout {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar {
  width: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: minmax(280px, 340px) 1fr;
  }

  .sidebar {
    order: 1;
    grid-row: span 2;
  }

  .content {
    order: 2;
  }

  .content.cast-section {
    order: 3;
  }
}

@media (min-width: 1280px) {
  .layout {
    grid-template-columns: minmax(300px, 340px) minmax(0, 1fr) minmax(260px, 320px);
  }

  .sidebar {
    grid-row: auto;
    position: sticky;
    top: 5rem;
  }
}

/* CARD */
.card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.card-image {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--surface-2);
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
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
}

.card-section {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  border-bottom: 1px solid var(--border);
}

.card-section:last-child {
  border-bottom: none;
}

.card-section__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.movie-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.movie-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  text-wrap: balance;
}

.movie-year {
  font-size: 0.875rem;
  color: var(--text-subtle);
}

.btn-add-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  border: 1px solid transparent;
  background: var(--primary);
  color: var(--on-primary);
  cursor: pointer;
  transition:
    background-color 0.15s,
    transform 0.1s;
  white-space: nowrap;
}

.btn-add-list:hover {
  background: var(--primary-hover);
}

.btn-add-list:active {
  transform: scale(0.98);
}

.rating-stars {
  justify-content: flex-start !important;
}

.rating-stars :deep(.star-icon) {
  font-size: 2rem !important;
  margin: 0 0.3rem 0 0 !important;
}

/* SECTION */
.section {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem !important;
  min-height: 3.5rem;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.95rem;
}

.section-title {
  flex: 1;
  text-align: left;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0;
}

.section-body {
  padding: 1.25rem;
}

/* PROFILE */
.user-heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.user-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text);
  margin: 0;
  overflow-wrap: anywhere;
}

.user-handle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-subtle);
}

.biography {
  font-size: 1rem;
  line-height: 1.7;
  white-space: pre-line;
  color: var(--text-muted);
  margin: 0;
}

.biography-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-text {
  font-size: 0.9375rem;
  color: var(--text-subtle);
  font-style: italic;
  margin: 0;
}

.sentinel {
  height: 1px;
}

.movies-lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.btn-edit,
.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.btn-edit {
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}

.btn-edit:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}

.btn-logout {
  border: 1px solid var(--danger);
  background: transparent;
  color: var(--danger);
}

.btn-logout:hover {
  background: var(--danger-soft);
}

/* CONFIRM DIALOGS */
.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 1rem;
  flex-shrink: 0;
}

.confirm-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.confirm-body {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  padding: 0.25rem 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  padding-top: 0.5rem;
  width: 100%;
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: var(--surface-hover);
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.3rem;
  border-radius: var(--radius-md);
  border: none;
  background: #c42020;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
  font-family: inherit;
}

.btn-danger:hover {
  background: #a51b1b;
}
</style>
