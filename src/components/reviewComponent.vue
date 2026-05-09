<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import { type User, type Movie, type Review } from '@/types';
import { goToMovie } from '@/utils/goTo';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import ReactionsComponent from './reactionsComponent.vue';
import { Dialog, Skeleton } from 'primevue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import EditReviewDialog from './editReviewDialog.vue';
import { useI18n } from 'vue-i18n';
import { deleteReview } from '@/repositories/movieRepository';
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import CommentsDialog from './commentsDialog.vue';
import { useDate } from '@/composables/useDate';
import { useTranslation } from '@/composables/useTranslation';
import { getReviewTranslation } from '@/repositories/reviewRepository';
import TranslateButton from './translateButton.vue';
const props = defineProps<{
    review: Review;
}>();

const emit = defineEmits<{
    deleted: [id: number];
    reload: [];
}>();

const { t } = useI18n();
const movie = ref<Movie | null>(null);
const loading = ref(true);
const user = ref<User>();
const authStore = useAuthStore();
const { formatRelativeTime } = useDate();
const editModalVisible = ref(false);
const confirmDeleteVisible = ref(false);

const { isTranslated, translatedData, translate, isLoading, error } = useTranslation(
    () => getReviewTranslation(props.review.id,)
);

const isSelf = computed(() => {
    return authStore.isAuthenticated && Number(user.value?.id) === Number(authStore.user?.user_id);
});
const isExpanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const isLongContent = ref(false)
const commentModalVisible = ref(false)
const LINE_HEIGHT_THRESHOLD = 76
const renderedContent = computed(() => {
    const html = marked.parse(props.review.content) as string
    return DOMPurify.sanitize(html)
})

const fetchMovieData = async () => {
    try {
        const response = await api.get(props.review.movie);
        movie.value = response.data;
    } catch (error) {
        console.error('Error fetching movie data:', error);
    } finally {
        loading.value = false;
    }
};

const fetchUserData = async () => {
    try {
        const response = await api.get(props.review.user);
        user.value = response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const confirmDelete = () => {
    confirmDeleteVisible.value = true;
};


const deleteReviewConfirm = () => {
    confirmDeleteVisible.value = false;
    deleteReview(props.review.id)
        .then(() => {
            emit('deleted', props.review.id);
        })
        .catch((error) => {
            console.error('Error deleting review:', error);
        });
};

onMounted(() => {
    fetchMovieData();
    fetchUserData();

});
watch(loading, async (newVal) => {
    if (!newVal) {
        await nextTick()
        if (contentRef.value) {
            isLongContent.value = contentRef.value.scrollHeight > LINE_HEIGHT_THRESHOLD
        }
    }
})

</script>

<template>
    <EditReviewDialog v-if="isSelf" :reviewId="props.review.id" v-model:visible="editModalVisible"
        @reload="emit('reload')" />
    <CommentsDialog v-if="commentModalVisible" :reviewId="props.review.id" v-model:visible="commentModalVisible" />

    <!-- CONFIRM DELETE DIALOG -->
    <Dialog v-model:visible="confirmDeleteVisible" modal :draggable="false" :dismissableMask="true"
        :style="{ width: '90vw', maxWidth: '380px' }" :pt="{
            root: { class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden' },
            header: { class: 'bg-[var(--background)] pb-0' },
            title: { class: 'text-xl font-bold text-[var(--primary)]' },
            content: { class: 'bg-[var(--background)]' },
            footer: { class: 'bg-[var(--background)] border-t border-[var(--secondary)]' },
            closeButton: { class: 'hover:bg-[var(--secondary)]/20 transition-colors' },
        }">
        <template #header>
            <div class="confirm-header">
                <div class="confirm-icon">
                    <i class="pi pi-trash" />
                </div>
                <div>
                    <p class="confirm-title">{{ t('review.deleteConfirmTitle') }}</p>
                </div>
            </div>
        </template>

        <p class="confirm-body">{{ t('review.deleteConfirmBody') }}</p>

        <template #footer>
            <div class="footer-actions">
                <button class="btn-cancel" @click="confirmDeleteVisible = false">
                    {{ t('common.cancel') }}
                </button>
                <button class="btn-delete" @click="deleteReviewConfirm">
                    <i class="pi pi-trash" />
                    <span>{{ t('common.delete') }}</span>
                </button>
            </div>
        </template>
    </Dialog>

    <div class="review">
        <!-- SKELETON -->
        <template v-if="loading">
            <div class="review-main">
                <div class="cover-col">
                    <Skeleton width="4rem" height="6rem" border-radius="0.5rem" />
                    <Skeleton width="4rem" height="2rem" border-radius="0.5rem" />
                </div>
                <div class="review-body">
                    <div class="review-header">
                        <div class="review-meta">
                            <Skeleton width="120px" height="14px" border-radius="4px" />
                            <Skeleton width="70px" height="11px" border-radius="4px" style="margin-top: 4px" />
                        </div>
                        <div class="review-header-right">
                            <Skeleton width="1.75rem" height="1.75rem" border-radius="50%" />
                            <Skeleton width="2rem" height="2rem" border-radius="50%" />
                        </div>
                    </div>
                    <Skeleton width="55%" height="15px" border-radius="4px" style="margin-top: 4px" />
                    <Skeleton width="100%" height="11px" border-radius="4px" style="margin-top: 8px" />
                    <Skeleton width="80%" height="11px" border-radius="4px" style="margin-top: 4px" />
                    <Skeleton width="65%" height="11px" border-radius="4px" style="margin-top: 4px" />
                </div>
            </div>
            <div class="reactions-skeleton">
                <Skeleton v-for="i in 3" :key="i" width="48px" height="28px" border-radius="999px" />
            </div>
        </template>

        <!-- CONTENT -->
        <template v-else>
            <div class="review-main">
                <div class="cover-col">
                    <img class="movie-cover" :src="movie?.cover" :alt="movie?.title" @click="goToMovie(movie?.slug)" />
                    <button class="action-btn action-btn--comment" @click="commentModalVisible = true">
                        <i class="pi pi-comment" />
                    </button>
                    <div v-if="isSelf" class="review-actions">
                        <button class="action-btn action-btn--edit" @click="editModalVisible = true">
                            <i class="pi pi-pencil" />
                        </button>
                        <button class="action-btn action-btn--delete" @click="confirmDelete">
                            <i class="pi pi-trash" />
                        </button>
                    </div>
                </div>
                <div class="review-body">
                    <div class="review-header">
                        <div class="review-meta">
                            <span class="movie-name" @click="goToMovie(movie?.slug)">{{ movie?.title }}</span>
                            <span class="review-date">{{ formatRelativeTime(review.created_at) }}</span>
                        </div>

                    </div>
                    <h3 class="review-title">{{ isTranslated && translatedData?.title ? translatedData.title :
                        review.title }}</h3>
                    <div :class="{ expanded: isExpanded, 'review-content-wrapper': isLongContent }">
                        <p class="review-content" ref="contentRef"
                            v-html="isTranslated && translatedData?.content ? translatedData.content : review.content">
                        </p>
                    </div>
                    <button v-if="isLongContent" class="expand-btn" @click="isExpanded = !isExpanded">
                        {{ isExpanded ? t('common.seeLess') : t('common.seeMore') }}
                    </button>
                    <TranslateButton :is-translated="isTranslated" :is-loading="isLoading" :error="error"
                        @translate="translate" />
                </div>
                <div class="review-header-right">
                    <RouterLink v-if="user" :to="`/users/${user.username}`" class="user-avatar-link">
                        <img class="user-avatar" :src="user.picture" :alt="user.username" />
                    </RouterLink>
                    <span class="badge" :class="review.is_positive ? 'badge-positive' : 'badge-negative'">
                        <i :class="review.is_positive ? 'pi pi-thumbs-up' : 'pi pi-thumbs-down'" />
                    </span>
                </div>
            </div>


            <ReactionsComponent :reviewId="review.id" type="review" />
        </template>
    </div>
</template>

<style scoped>
.review {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    --review-bg: var(--background);
    transition: background 0.2s;
    margin-bottom: 0.75rem;
}

.review-main {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.review:hover {
    --review-bg: var(--accent);
}

.movie-cover {
    width: 4rem;
    min-width: 4rem;
    height: 6rem;
    object-fit: cover;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
}

.movie-cover:hover {
    opacity: 0.85;
    transform: scale(1.03);
}

.review-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.review-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
}

.review-meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
}

.movie-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    line-height: 1.3;
}

.movie-name:hover {
    opacity: 0.75;
}

.review-date {
    font-size: 0.7rem;
    color: var(--gray);
}

/* RIGHT COLUMN */
.review-header-right {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-self: flex-start;
    flex-shrink: 0;
}


.review-actions {
    display: flex;
    gap: 0.3rem;
}


.right-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.right-actions {
    display: flex;
    gap: 0.3rem;
}

.user-avatar-link {
    display: flex;
    flex-shrink: 0;
}

.user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--secondary);
    transition: border-color 0.2s, transform 0.2s;
}

.user-avatar-link:hover .user-avatar {
    border-color: var(--primary);
    transform: scale(1.08);
}

.badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.8rem;
    flex-shrink: 0;
}

.badge-positive {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.badge-negative {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

/* ACTIONS */
.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.action-btn--edit {
    border: 1px solid color-mix(in srgb, var(--orange) 50%, transparent);
    color: var(--orange);
}

.action-btn--edit:hover {
    background: color-mix(in srgb, var(--orange) 12%, transparent);
    border-color: var(--orange);
}

.action-btn--delete {
    border: 1px solid color-mix(in srgb, var(--red) 50%, transparent);
    color: var(--red);
}

.action-btn--delete:hover {
    background: color-mix(in srgb, var(--red) 12%, transparent);
    border-color: var(--red);
}

.review-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

.review-content {
    font-size: 0.85rem;
    line-height: 1.6;
    font-weight: 300;
    color: var(--text);
    opacity: 0.8;
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

.reactions-skeleton {
    display: flex;
    gap: 8px;
}

/* CONFIRM DIALOG */
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
    background: color-mix(in srgb, var(--red) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
    color: var(--red);
    font-size: 1rem;
    flex-shrink: 0;
}

.confirm-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.confirm-body {
    font-size: 0.875rem;
    color: var(--gray);
    line-height: 1.6;
    margin: 0;
    padding: 0.25rem 0;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    width: 100%;
}

.btn-cancel {
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--secondary) 60%, transparent);
    background: transparent;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
}

.btn-cancel:hover {
    background: color-mix(in srgb, var(--secondary) 15%, transparent);
}

.btn-delete {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.4rem;
    border-radius: 999px;
    border: none;
    background: var(--red);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
}

.btn-delete:hover {
    opacity: 0.85;
}

.review-content-wrapper {
    max-height: 4.8rem;
    overflow: hidden;
    transition: max-height 0.3s ease;
    position: relative;
}

.review-content-wrapper.expanded {
    max-height: 1000px;
}

.review-content-wrapper::after,
.review-content-wrapper::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4rem;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.review-content-wrapper::after {
    background: linear-gradient(to bottom,
            transparent 0%,
            color-mix(in srgb, var(--background) 60%, transparent) 40%,
            var(--background) 100%);
    opacity: 1;
}

.review-content-wrapper::before {
    background: linear-gradient(to bottom,
            transparent 0%,
            color-mix(in srgb, var(--background) 50%, transparent) 40%,
            color-mix(in srgb, var(--background) 95%, transparent) 100%);
    opacity: 0;
}

.review:hover .review-content-wrapper::after {
    opacity: 0;
}

.review:hover .review-content-wrapper::before {
    opacity: 1;
}

.review-content-wrapper.expanded::after,
.review-content-wrapper.expanded::before {
    opacity: 0 !important;
}

.expand-btn {
    font-size: 0.75rem;
    color: var(--primary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    opacity: 0.8;
}

.expand-btn:hover {
    opacity: 1;
}

.review-content :deep(p) {
    margin: 0 0 0.5rem;
}

.review-content :deep(strong) {
    font-weight: 600;
}

.review-content :deep(em) {
    font-style: italic;
}

.review-content :deep(ol) {
    list-style-type: decimal;
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.review-content :deep(ul) {
    list-style-type: disc;
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.review-content :deep(code) {
    font-family: monospace;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.08);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
}

.review-content :deep(h1),
.review-content :deep(h2),
.review-content :deep(h3),
.review-content :deep(h4) {
    font-weight: 600;
    line-height: 1.3;
    margin: 0.75rem 0 0.25rem;
    color: var(--text);
}

.review-content :deep(h1) {
    font-size: 1.1rem;
}

.review-content :deep(h2) {
    font-size: 1rem;
}

.review-content :deep(h3) {
    font-size: 0.95rem;
}

.review-content :deep(h4) {
    font-size: 0.9rem;
}

.review-content-wrapper.expanded::after {
    opacity: 0;
}

.review-content :deep(li) {
    display: list-item;
    margin-bottom: 0.25rem;
}

.review-content :deep(a) {
    color: var(--accent);
    text-decoration: underline;
    font-weight: 500;
}

.review-content :deep(a:hover) {
    opacity: 0.8;
}

.review-content :deep(ul ul),
.review-content :deep(ol ol),
.review-content :deep(ul ol),
.review-content :deep(ol ul) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
}

.review-content :deep(pre) {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: block;
    width: 0;
    min-width: 100%;
    box-sizing: border-box;
    line-height: 1.4;
}

.review-content :deep(pre code) {
    background: transparent;
    padding: 0;
    font-size: 0.85rem;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    white-space: pre;
}

.cover-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
}

.action-btn--comment {
    border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
    color: var(--primary);
    width: 100%;
    border-radius: 0.5rem;
}

.action-btn--comment:hover {
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    border-color: var(--primary);
}
</style>