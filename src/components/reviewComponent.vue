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
    const translation = isTranslated.value && translatedData.value && 'content' in translatedData.value
        ? translatedData.value.content
        : props.review.content
    const html = marked.parse(translation) as string
    return DOMPurify.sanitize(html)
})
const renderedTitle = computed(() => {
    if (isTranslated.value && translatedData.value && 'title' in translatedData.value) {
        return translatedData.value.title
    }
    return props.review.title
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
                <div class="confirm-icon" aria-hidden="true">
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
                    <img class="movie-cover" :src="movie?.cover" :alt="movie?.title" role="link" tabindex="0"
                        @click="goToMovie(movie?.slug)" @keydown.enter="goToMovie(movie?.slug)" />
                </div>
                <div class="review-body">
                    <div class="review-header">
                        <div class="review-meta">
                            <a class="movie-name" :href="`/movies/${movie?.slug}`"
                                @click.prevent="goToMovie(movie?.slug)">{{ movie?.title }}</a>
                            <span class="review-byline">
                                <template v-if="user">
                                    <RouterLink :to="`/users/${user.username}`" class="review-author">@{{ user.username }}</RouterLink>
                                    <span aria-hidden="true"> · </span>
                                </template><span class="review-date">{{ formatRelativeTime(review.created_at) }}</span>
                            </span>
                        </div>

                    </div>
                    <h3 class="review-title">{{ renderedTitle }}</h3>
                    <div :class="{ expanded: isExpanded, 'review-content-wrapper': isLongContent }">
                        <p class="review-content" ref="contentRef" v-html="renderedContent">
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
                    <span class="badge" :class="review.is_positive ? 'badge-positive' : 'badge-negative'"
                        :title="review.is_positive ? t('review.positive') : t('review.negative')"
                        :aria-label="review.is_positive ? t('review.positive') : t('review.negative')">
                        <i :class="review.is_positive ? 'pi pi-thumbs-up' : 'pi pi-thumbs-down'" aria-hidden="true" />
                    </span>
                </div>
            </div>

            <div class="review-footer">
                <ReactionsComponent :reviewId="review.id" type="review" />
                <div class="review-actions">
                    <button class="action-btn action-btn--comment" @click="commentModalVisible = true">
                        <i class="pi pi-comment" aria-hidden="true" />
                        <span>{{ t('commentsDialog.title') }}</span>
                    </button>
                    <template v-if="isSelf">
                        <button class="action-btn action-btn--icon action-btn--edit" @click="editModalVisible = true"
                            :aria-label="t('common.edit')" :title="t('common.edit')">
                            <i class="pi pi-pencil" aria-hidden="true" />
                        </button>
                        <button class="action-btn action-btn--icon action-btn--delete" @click="confirmDelete"
                            :aria-label="t('common.delete')" :title="t('common.delete')">
                            <i class="pi pi-trash" aria-hidden="true" />
                        </button>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.review {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1rem 1.1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--surface);
    transition: border-color 0.2s;
}

.review:hover {
    border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
}

.review-main {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.cover-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
}

.movie-cover {
    width: 4.25rem;
    min-width: 4.25rem;
    height: 6.375rem;
    object-fit: cover;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: transform 0.2s;
}

.movie-cover:hover {
    transform: scale(1.03);
}

.review-body {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
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
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--primary);
    cursor: pointer;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    line-height: 1.3;
}

.movie-name:hover {
    text-decoration: underline;
}

.review-byline,
.review-date {
    font-size: 0.8125rem;
    color: var(--text-subtle);
}

.review-author {
    color: var(--text-muted);
    font-weight: 600;
    text-decoration: none;
}

.review-author:hover {
    color: var(--primary);
    text-decoration: underline;
}

.review-header-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    flex-shrink: 0;
}

.user-avatar-link {
    display: flex;
    flex-shrink: 0;
    border-radius: 999px;
}

.user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border);
    transition: box-shadow 0.15s;
}

.user-avatar-link:hover .user-avatar {
    box-shadow: 0 0 0 2px var(--primary);
}

.badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.85rem;
    flex-shrink: 0;
}

.badge-positive {
    background: var(--success-soft);
    color: var(--success);
}

.badge-negative {
    background: var(--danger-soft);
    color: var(--danger);
}

.review-title {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text);
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

.review-content {
    font-size: 0.9375rem;
    line-height: 1.65;
    font-weight: 400;
    color: var(--text-muted);
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

/* FOOTER */
.review-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}

.review-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-left: auto;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    height: 2.125rem;
    padding: 0 0.85rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border-strong);
    color: var(--text-muted);
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.action-btn--icon {
    width: 2.125rem;
    padding: 0;
}

.action-btn--comment:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-soft);
}

.action-btn--edit:hover {
    border-color: var(--text);
    color: var(--text);
    background: var(--surface-hover);
}

.action-btn--delete:hover {
    border-color: var(--danger);
    color: var(--danger);
    background: var(--danger-soft);
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

.btn-delete {
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

.btn-delete:hover {
    background: #a51b1b;
}

/* CONTENIDO LARGO */
.review-content-wrapper {
    max-height: 5rem;
    overflow: hidden;
    transition: max-height 0.3s ease;
    position: relative;
}

.review-content-wrapper.expanded {
    max-height: 1000px;
}

.review-content-wrapper::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2.5rem;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent 0%, var(--surface) 100%);
    transition: opacity 0.3s ease;
}

.review-content-wrapper.expanded::after {
    opacity: 0;
}

.expand-btn {
    align-self: flex-start;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
}

.expand-btn:hover {
    text-decoration: underline;
}

.review-content :deep(p) {
    margin: 0 0 0.5rem;
}

.review-content :deep(strong) {
    font-weight: 600;
    color: var(--text);
}

.review-content :deep(em) {
    font-style: italic;
}

.review-content :deep(ol) {
    list-style-type: decimal;
    margin: 0.75rem 0;
    padding-left: 1.5rem;
}

.review-content :deep(ul) {
    list-style-type: disc;
    margin: 0.75rem 0;
    padding-left: 1.5rem;
}

.review-content :deep(code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    background: var(--surface-2);
    color: var(--text);
    padding: 0.1rem 0.35rem;
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
    font-size: 1.15rem;
}

.review-content :deep(h2) {
    font-size: 1.05rem;
}

.review-content :deep(h3) {
    font-size: 1rem;
}

.review-content :deep(h4) {
    font-size: 0.95rem;
}

.review-content :deep(li) {
    display: list-item;
    margin-bottom: 0.25rem;
}

.review-content :deep(a) {
    color: var(--primary);
    text-decoration: underline;
    font-weight: 500;
}

.review-content :deep(ul ul),
.review-content :deep(ol ol),
.review-content :deep(ul ol),
.review-content :deep(ol ul) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
}

.review-content :deep(pre) {
    background: #15141f;
    color: #ecebf5;
    padding: 1rem;
    border-radius: var(--radius-sm);
    overflow-x: auto;
    margin: 0.75rem 0;
    border: 1px solid var(--border);
    display: block;
    width: 0;
    min-width: 100%;
    box-sizing: border-box;
    line-height: 1.45;
}

.review-content :deep(pre code) {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: 0.85rem;
    white-space: pre;
}

@media (max-width: 480px) {
    .review {
        padding: 0.875rem;
    }

    .review-main {
        gap: 0.65rem;
    }

    .movie-cover {
        width: 3.5rem;
        min-width: 3.5rem;
        height: 5.25rem;
    }
}
</style>
