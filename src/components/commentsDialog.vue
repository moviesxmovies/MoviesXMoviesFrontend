<script lang="ts" setup>
import { useInfinitePagination } from '@/composables/useInfinitePagination';
import { fetchComments, postComment, replyComment } from '@/repositories/reviewRepository';
import type { Comment, DynamicPagination } from '@/types';
import { Dialog, Skeleton, useToast } from 'primevue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentComponent from './commentComponent.vue';

const props = defineProps<{ visible: boolean; reviewId: number }>();
const emit = defineEmits<{ 'update:visible': [value: boolean] }>();

const commentsResponse = ref<DynamicPagination<Comment>>({} as DynamicPagination<Comment>);
const loading = ref(false);
const sending = ref(false);
const newComment = ref('');
const replyingTo = ref<{ comment: Comment; username: string } | null>(null);
const scrollAreaRef = ref<HTMLElement | null>(null);

const { t } = useI18n();
const toast = useToast();

const getUserLists = async (lastId?: number) => {
    loading.value = true;
    try {
        const response = await fetchComments(props.reviewId, lastId);
        if (lastId) {
            commentsResponse.value.results.push(...response.results);
            commentsResponse.value.next_last_id = response.next_last_id;
        } else {
            commentsResponse.value = response;
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: t('toast.error'),
            detail: error.response?.data?.message || t('components.addToList.fetchListsError'),
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const { sentinelRef } = useInfinitePagination(commentsResponse, loading, getUserLists);

const submitComment = async () => {
    const content = newComment.value.trim();
    if (!content) return;
    sending.value = true;
    try {
        if (replyingTo.value) {
            await replyComment(props.reviewId, replyingTo.value.comment.id, content);
        } else {
            await postComment(props.reviewId, content);
        }
        newComment.value = '';
        replyingTo.value = null;
        await getUserLists();
        if (scrollAreaRef.value) scrollAreaRef.value.scrollTop = 0;
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: t('toast.error'),
            detail: error.response?.data?.message || t('comment.postError'),
            life: 3000,
        });
    } finally {
        sending.value = false;
    }
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
    }
};

watch(() => props.visible, (val) => {
    if (val) getUserLists();
    else {
        replyingTo.value = null;
        newComment.value = '';
    }
}, { immediate: true });
</script>

<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :draggable="false"
        :dismissableMask="true" :closable="true" :style="{ width: '90vw', maxWidth: '500px' }" :pt="{
            root: { class: 'comments-root' },
            header: { class: 'comments-header' },
            content: { class: 'comments-content' },
            closeButton: { class: 'comments-close-btn' },
        }">
        <template #header>
            <div class="header-inner">
                <div class="header-icon">
                    <i class="pi pi-comments" />
                </div>
                <span class="header-text">{{ $t('commentsDialog.title') }}</span>
            </div>
        </template>

        <!-- SCROLL AREA -->
        <div class="scroll-area" ref="scrollAreaRef">
            <!-- EMPTY STATE -->
            <div v-if="!loading && !commentsResponse.results?.length" class="empty-state">
                <i class="pi pi-comment empty-icon" />
                <p>{{ $t('commentsDialog.empty') }}</p>
            </div>

            <!-- COMMENT LIST -->
            <template v-else>
                <CommentComponent v-for="comment in commentsResponse.results" :key="comment.id" :comment="comment"
                    :review-id="props.reviewId" @reply="(c, username) => replyingTo = { comment: c, username }" />
            </template>

            <!-- LOADING SKELETONS -->
            <div v-if="loading" v-for="i in 3" :key="i" class="comment">
                <div class="comment-avatar-col">
                    <Skeleton shape="circle" width="2rem" height="2rem" />
                    <div class="comment-thread-line" />
                </div>
                <div class="comment-body">
                    <div class="comment-header">
                        <Skeleton width="80px" height="10px" border-radius="4px" />
                        <Skeleton width="50px" height="10px" border-radius="4px" />
                    </div>
                    <Skeleton width="100%" height="36px" border-radius="0.75rem" style="margin-top: 0.15rem" />
                    <Skeleton width="60px" height="10px" border-radius="4px" style="margin-top: 0.1rem" />
                </div>
            </div>

            <!-- INFINITE SCROLL SENTINEL -->
            <div ref="sentinelRef" class="sentinel" />
        </div>

        <!-- INPUT AREA -->
        <div class="input-area">
            <!-- REPLYING TO BANNER -->
            <Transition name="slide-down">
                <div v-if="replyingTo" class="replying-banner">
                    <div class="replying-info">
                        <i class="pi pi-reply replying-icon" />
                        <span>{{ $t('comment.replyingTo') }}
                            <strong>{{ replyingTo.username }}</strong>
                        </span>
                    </div>
                    <button class="cancel-reply-btn" @click="replyingTo = null">
                        <i class="pi pi-times" />
                    </button>
                </div>
            </Transition>

            <div class="input-row">
                <textarea v-model="newComment" class="comment-input" :placeholder="$t('comment.placeholder')" rows="2"
                    :disabled="sending" @keydown="handleKeydown" />
                <button class="send-btn" :disabled="!newComment.trim() || sending" @click="submitComment">
                    <i v-if="sending" class="pi pi-spin pi-spinner" />
                    <i v-else class="pi pi-send" />
                </button>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.comment {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.comment-avatar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
}

.comment-thread-line {
    flex: 1;
    width: 1.5px;
    margin-top: 0.35rem;
    background: color-mix(in srgb, var(--secondary) 30%, transparent);
    min-height: 0.5rem;
}

.comment-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
    padding-bottom: 0.75rem;
}

.comment-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

:deep(.comments-root) {
    border-radius: 2rem;
    border: none;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    background: var(--background);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

:deep(.comments-header) {
    background: var(--background);
    padding-bottom: 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--secondary) 40%, transparent);
    flex-shrink: 0;
}

:deep(.comments-content) {
    background: var(--background);
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

:deep(.comments-close-btn) {
    transition: background 0.2s;
    border-radius: 50%;
}

:deep(.comments-close-btn:hover) {
    background: color-mix(in srgb, var(--secondary) 20%, transparent);
}

/* HEADER */
.header-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
    color: var(--primary);
    font-size: 0.9rem;
    flex-shrink: 0;
}

.header-text {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
}

/* SCROLL AREA */
.scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1.25rem;
    min-height: 200px;
    max-height: 400px;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--secondary) 40%, transparent) transparent;
}

.scroll-area::-webkit-scrollbar {
    width: 4px;
}

.scroll-area::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--secondary) 40%, transparent);
    border-radius: 999px;
}

.sentinel {
    height: 1px;
    flex-shrink: 0;
}

/* EMPTY STATE */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex: 1;
    padding: 2rem 0;
    color: var(--gray);
    opacity: 0.6;
}

.empty-icon {
    font-size: 2rem;
}

.empty-state p {
    font-size: 0.85rem;
    margin: 0;
}

/* LOADING SKELETONS */

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

.skeleton-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    flex-shrink: 0;
}

.skeleton-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 0.1rem;
}

.skeleton-name {
    width: 80px;
    height: 10px;
}

.skeleton-text {
    width: 100%;
    height: 10px;
}

.skeleton-text.short {
    width: 60%;
}

/* INPUT AREA */
.input-area {
    border-top: 1px solid color-mix(in srgb, var(--secondary) 40%, transparent);
    padding: 0.75rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex-shrink: 0;
    background: var(--background);
}

/* REPLYING BANNER */
.replying-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    border-radius: 0.6rem;
    background: color-mix(in srgb, var(--primary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
    font-size: 0.78rem;
    color: var(--text);
    opacity: 0.9;
}

.replying-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.replying-icon {
    color: var(--primary);
    font-size: 0.7rem;
}

.replying-banner strong {
    color: var(--primary);
    font-weight: 700;
}

.cancel-reply-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray);
    font-size: 0.7rem;
    padding: 0.15rem;
    border-radius: 50%;
    transition: color 0.2s, background 0.2s;
}

.cancel-reply-btn:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--secondary) 20%, transparent);
}

/* INPUT ROW */
.input-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
}

.comment-input {
    flex: 1;
    background: color-mix(in srgb, var(--text) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent);
    border-radius: 0.85rem;
    padding: 0.6rem 0.9rem;
    font-size: 0.875rem;
    color: var(--text);
    font-family: inherit;
    outline: none;
    resize: none;
    line-height: 1.5;
    transition: border-color 0.2s;
}

.comment-input:focus {
    border-color: var(--primary);
}

.comment-input:disabled {
    opacity: 0.5;
}

.send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    border: none;
    background: var(--primary);
    color: var(--background);
    font-size: 0.85rem;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.2s, transform 0.15s;
}

.send-btn:hover:not(:disabled) {
    opacity: 0.85;
    transform: scale(1.05);
}

.send-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.input-hint {
    font-size: 0.68rem;
    color: var(--gray);
    opacity: 0.6;
    padding-left: 0.2rem;
}

/* REPLY TRANSITION */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
<style>
.comments-root {
    border-radius: 2rem !important;
    border: none !important;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35) !important;
    background: var(--background) !important;
    overflow: hidden !important;
}

.comments-header {
    background: var(--background) !important;
    border-bottom: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent) !important;
}

.comments-content {
    background: var(--background) !important;
    padding: 0 !important;
}

.comments-close-btn {
    border-radius: 50% !important;
}

.comments-close-btn:hover {
    background: color-mix(in srgb, var(--secondary) 20%, transparent) !important;
}
</style>