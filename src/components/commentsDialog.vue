<script lang="ts" setup>
import { useInfinitePagination } from '@/composables/useInfinitePagination';
import { fetchComments, postComment, replyComment } from '@/repositories/reviewRepository';
import type { Comment, DynamicPagination } from '@/types';
import { Dialog, useToast, ProgressSpinner } from 'primevue';
import { ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentComponent from './commentComponent.vue';

const props = defineProps<{ visible: boolean; reviewId: number }>();
const emit = defineEmits<{ 'update:visible': [value: boolean] }>();

const commentsResponse = ref<DynamicPagination<Comment>>({} as DynamicPagination<Comment>);
const initialLoading = ref(false);
const progressiveLoading = ref(false);
const sending = ref(false);
const newComment = ref('');
const replyingTo = ref<{ comment: Comment; username: string } | null>(null);
const scrollAreaRef = ref<HTMLElement | null>(null);

const highlightTarget = ref<{ id: number; ts: number } | null>(null);
const forceOpenRepliesId = ref<number | null>(null);

const { t } = useI18n();
const toast = useToast();

const getComments = async (lastId?: number) => {
    if (lastId) progressiveLoading.value = true;
    else
        initialLoading.value = true;
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
        initialLoading.value = false;
        progressiveLoading.value = false;
    }
};

const { sentinelRef } = useInfinitePagination(commentsResponse, progressiveLoading, getComments);

const scrollToReplyingTo = async () => {
    if (!replyingTo.value) return;
    const targetId = replyingTo.value.comment.id;

    forceOpenRepliesId.value = targetId;
    await nextTick();
    forceOpenRepliesId.value = null;

    highlightTarget.value = { id: targetId, ts: Date.now() };
};

const submitComment = async () => {
    const content = newComment.value.trim();
    if (!content) return;
    sending.value = true;

    const parentCommentId = replyingTo.value?.comment.id ?? null;

    try {
        let newId: number | null = null;

        if (replyingTo.value) {
            const created = await replyComment(props.reviewId, replyingTo.value.comment.id, content);
            newId = created?.id ?? null;
        } else {
            const created = await postComment(props.reviewId, content);
            newId = created?.id ?? null;
        }

        newComment.value = '';
        replyingTo.value = null;

        await getComments();

        if (parentCommentId !== null) {
            forceOpenRepliesId.value = parentCommentId;
            await nextTick();
            forceOpenRepliesId.value = null;
        }

        if (newId !== null) {
            highlightTarget.value = { id: newId, ts: Date.now() };
        } else if (parentCommentId === null && scrollAreaRef.value) {
            scrollAreaRef.value.scrollTop = 0;
        }

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
    if (val) getComments();
    else {
        replyingTo.value = null;
        newComment.value = '';
        highlightTarget.value = null;
        forceOpenRepliesId.value = null;
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
                <div class="header-icon" aria-hidden="true">
                    <i class="pi pi-comments" />
                </div>
                <span class="header-text">{{ $t('commentsDialog.title') }}</span>
            </div>
        </template>

        <!-- SCROLL AREA -->
        <div class="scroll-area" ref="scrollAreaRef">
            <div v-if="!initialLoading && !commentsResponse.results?.length" class="empty-state">
                <i class="pi pi-comment empty-icon" />
                <p>{{ $t('commentsDialog.empty') }}</p>
            </div>

            <template v-else>
                <CommentComponent v-for="comment in commentsResponse.results" :key="comment.id" :comment="comment"
                    :review-id="props.reviewId" :highlight-target="highlightTarget"
                    :force-open-replies-id="forceOpenRepliesId"
                    @reply="(c, username) => replyingTo = { comment: c, username }" />
            </template>

            <div v-if="initialLoading" class="loading-container">
                <ProgressSpinner class="app-spinner" style="width: 40px; height: 40px" strokeWidth="4" animationDuration=".8s" />
            </div>
            <div v-if="progressiveLoading" class="loading-progressive-container">
                <ProgressSpinner class="app-spinner" style="width: 40px; height: 40px" strokeWidth="4" animationDuration=".8s" />
            </div>

            <div ref="sentinelRef" class="sentinel" />
        </div>

        <!-- INPUT AREA -->
        <div class="input-area">
            <Transition name="slide-down">
                <div v-if="replyingTo" class="replying-banner" @click="scrollToReplyingTo">
                    <div class="replying-info">
                        <i class="pi pi-reply replying-icon" />
                        <span>{{ $t('comment.replyingTo') }}
                            <strong>{{ replyingTo.username }}</strong>
                        </span>
                    </div>
                    <button class="cancel-reply-btn" @click.stop="replyingTo = null" :aria-label="$t('common.cancel')">
                        <i class="pi pi-times" />
                    </button>
                </div>
            </Transition>

            <div class="input-row">
                <textarea v-model="newComment" class="comment-input" :placeholder="$t('comment.placeholder')"
                    :aria-label="$t('comment.placeholder')" rows="2"
                    :disabled="sending" @keydown="handleKeydown" />
                <button class="send-btn" :disabled="!newComment.trim() || sending" @click="submitComment"
                    :aria-label="$t('common.submit')" :title="$t('common.submit')">
                    <i v-if="sending" class="pi pi-spin pi-spinner" />
                    <i v-else class="pi pi-send" />
                </button>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
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
    border-radius: var(--radius-sm);
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 0.95rem;
    flex-shrink: 0;
}

.header-text {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text);
}

.scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    min-height: 200px;
    max-height: 420px;
    display: flex;
    flex-direction: column;
}

.sentinel {
    height: 1px;
    flex-shrink: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex: 1;
    padding: 2rem 0;
    color: var(--text-muted);
}

.empty-icon {
    font-size: 1.75rem;
    color: var(--primary);
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 999px;
    background: var(--primary-soft);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-state p {
    font-size: 0.9375rem;
    margin: 0;
}

.input-area {
    border-top: 1px solid var(--border);
    padding: 0.75rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-shrink: 0;
    background: var(--surface);
}

.replying-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--primary-soft);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    font-size: 0.875rem;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.15s;
}

.replying-banner:hover {
    border-color: var(--primary);
}

.replying-info {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.replying-icon {
    color: var(--primary);
    font-size: 0.8rem;
}

.replying-banner strong {
    color: var(--primary);
    font-weight: 700;
}

.cancel-reply-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.75rem;
    border-radius: 50%;
    transition: color 0.15s, background-color 0.15s;
}

.cancel-reply-btn:hover {
    color: var(--text);
    background: var(--surface-hover);
}

.input-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
}

.comment-input {
    flex: 1;
    background: var(--background);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.9rem;
    font-size: 0.9375rem;
    color: var(--text);
    font-family: inherit;
    outline: none;
    resize: none;
    line-height: 1.5;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.comment-input:focus {
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
}

.comment-input:disabled {
    opacity: 0.55;
}

.send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-md);
    border: none;
    background: var(--primary);
    color: var(--on-primary);
    font-size: 0.95rem;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s, transform 0.15s;
}

.send-btn:hover:not(:disabled) {
    background: var(--primary-hover);
}

.send-btn:disabled {
    background: var(--surface-2);
    color: var(--text-subtle);
    cursor: not-allowed;
}

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
.p-dialog.comments-root {
    display: flex;
    flex-direction: column;
}

.comments-header {
    border-bottom: 1px solid var(--border) !important;
    padding-bottom: 0.875rem !important;
    flex-shrink: 0;
}

.comments-content {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: 2rem 0;
}

.loading-progressive-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
}

.app-spinner .p-progressspinner-circle {
    stroke: var(--primary) !important;
    stroke-linecap: round;
}
</style>
