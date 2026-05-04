<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import { type User, type Comment, type DynamicPagination } from '@/types';
import { Skeleton } from 'primevue';
import { ref, watch, nextTick } from 'vue';
import ReactionsComponent from './reactionsComponent.vue';
import { getCommentReplies } from '@/repositories/reviewRepository';
import { useDate } from '@/composables/useDate';

const props = defineProps<{
    comment: Comment;
    reviewId: number;
    highlightTarget?: { id: number; ts: number } | null;
    forceOpenRepliesId?: number | null;
}>();

const emit = defineEmits<{
    reply: [comment: Comment, username: string];
}>();

const user = ref<User>();
const commentEl = ref<HTMLElement | null>(null);
const isHighlighted = ref(false);
const { formatRelativeTime } = useDate();

// ── Replies ──────────────────────────────────────────────────
const repliesResponse = ref<DynamicPagination<Comment> | null>(null);
const repliesVisible = ref(false);
const repliesLoading = ref(false);

const loadReplies = async () => {
    repliesLoading.value = true;
    try {
        const lastId = repliesResponse.value?.next_last_id ?? undefined;
        const response = await getCommentReplies(props.reviewId, props.comment.id, lastId);
        if (repliesResponse.value?.results?.length) {
            repliesResponse.value.results.push(...response.results);
            repliesResponse.value.next_last_id = response.next_last_id;
        } else {
            repliesResponse.value = response;
        }
        repliesVisible.value = true;
    } catch (error) {
        console.error('Error fetching replies:', error);
    } finally {
        repliesLoading.value = false;
    }
};

const reloadReplies = async () => {
    repliesLoading.value = true;
    try {
        const response = await getCommentReplies(props.reviewId, props.comment.id, undefined);
        repliesResponse.value = response;
        repliesVisible.value = true;
    } catch (error) {
        console.error('Error reloading replies:', error);
    } finally {
        repliesLoading.value = false;
    }
};

const toggleReplies = () => {
    if (repliesVisible.value) {
        repliesVisible.value = false;
        repliesResponse.value = null;
    } else {
        loadReplies();
    }
};

const hasMore = () => !!repliesResponse.value?.next_last_id;

const fetchUser = async () => {
    try {
        const response = await api.get(props.comment.user);
        user.value = response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
};

const triggerHighlight = async () => {
    await nextTick();
    if (!commentEl.value) return;
    commentEl.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
    isHighlighted.value = true;
    setTimeout(() => {
        isHighlighted.value = false;
    }, 1800);
};

watch(user, async (loadedUser) => {
    if (loadedUser && props.highlightTarget?.id === props.comment.id) {
        await triggerHighlight();
    }
});

watch(() => props.highlightTarget, async (target) => {
    if (target?.id === props.comment.id && user.value) {
        await triggerHighlight();
    }
}, { deep: true });

watch(() => props.comment.user, () => {
    if (props.comment.user) fetchUser();
}, { immediate: true });

watch(() => props.forceOpenRepliesId, (id) => {
    if (id === props.comment.id) {
        reloadReplies();
    }
});
</script>

<template>
    <!-- SKELETON -->
    <div v-if="!user" class="comment">
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

    <!-- CONTENT -->
    <div v-else ref="commentEl" class="comment" :class="{ 'comment--highlight': isHighlighted }">
        <div class="comment-avatar-col">
            <img class="comment-avatar" :src="user.picture" :alt="user.username" />
            <div class="comment-thread-line" />
        </div>
        <div class="comment-body">
            <div class="comment-header">
                <span class="comment-username">{{ user.username }}</span>
                <span class="comment-date">{{ formatRelativeTime(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>

            <div class="actions">
                <button class="reply-btn" @click="emit('reply', comment, user.username)">
                    <i class="pi pi-reply" />
                    <span>{{ $t('comment.reply') }}</span>
                </button>
                <ReactionsComponent :comment-id="comment.id" :review-id="reviewId" :picker-up="false" />
            </div>

            <!-- TOGGLE REPLIES BUTTON -->
            <button v-if="comment.has_replies" class="toggle-replies-btn" @click="toggleReplies">
                <i :class="repliesVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
                <span v-if="!repliesVisible">{{ $t('comment.showReplies') }}</span>
                <span v-else>{{ $t('comment.hideReplies') }}</span>
            </button>

            <!-- REPLIES -->
            <div v-if="repliesVisible" class="replies">

                <!-- REPLY SKELETONS (initial load) -->
                <template v-if="repliesLoading && !repliesResponse?.results?.length">
                    <div v-for="i in 3" :key="i" class="comment reply-indent">
                        <div class="comment-avatar-col">
                            <Skeleton shape="circle" width="1.6rem" height="1.6rem" />
                            <div class="comment-thread-line" />
                        </div>
                        <div class="comment-body">
                            <div class="comment-header">
                                <Skeleton width="70px" height="9px" border-radius="4px" />
                                <Skeleton width="45px" height="9px" border-radius="4px" />
                            </div>
                            <Skeleton width="100%" height="28px" border-radius="0.75rem" style="margin-top: 0.1rem" />
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="reply-indent" v-for="reply in repliesResponse?.results" :key="reply.id">
                        <CommentComponent
                            :comment="reply"
                            :review-id="reviewId"
                            :highlight-target="highlightTarget"
                            :force-open-replies-id="forceOpenRepliesId"
                            @reply="(c, username) => emit('reply', c, username)"
                        />
                    </div>

                    <!-- LOAD MORE SKELETON -->
                    <template v-if="repliesLoading">
                        <div v-for="i in 3" :key="`load-${i}`" class="comment reply-indent">
                            <div class="comment-avatar-col">
                                <Skeleton shape="circle" width="1.6rem" height="1.6rem" />
                                <div class="comment-thread-line" />
                            </div>
                            <div class="comment-body">
                                <Skeleton width="70px" height="9px" border-radius="4px" />
                                <Skeleton width="100%" height="28px" border-radius="0.75rem"
                                    style="margin-top: 0.1rem" />
                            </div>
                        </div>
                    </template>

                    <!-- LOAD MORE BUTTON -->
                    <button v-if="hasMore() && !repliesLoading" class="load-more-btn" @click="loadReplies">
                        <i class="pi pi-plus" />
                        <span>{{ $t('comment.loadMoreReplies') }}</span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
    position: relative;
    overflow: visible;
}

.comment {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-radius: 0.75rem;
}

@keyframes comment-flash {
    0%   { background: color-mix(in srgb, var(--primary) 20%, transparent); }
    50%  { background: color-mix(in srgb, var(--primary) 12%, transparent); }
    100% { background: transparent; }
}

.comment--highlight {
    animation: comment-flash 1.8s ease-out forwards;
}

.comment-avatar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
}

.comment-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid color-mix(in srgb, var(--secondary) 60%, transparent);
    flex-shrink: 0;
}

.reply-avatar {
    width: 1.6rem;
    height: 1.6rem;
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
    overflow: visible;
}

.comment-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.comment-username {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--primary);
}

.comment-date {
    font-size: 0.68rem;
    color: var(--gray);
}

.comment-content {
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--text);
    opacity: 0.85;
    margin: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

.reply-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--gray);
    opacity: 0.7;
    transition: opacity 0.2s, color 0.2s;
    align-self: flex-start;
    margin-top: 0.15rem;
}

.reply-btn:hover {
    opacity: 1;
    color: var(--primary);
}

.reply-btn i {
    font-size: 0.68rem;
}

.toggle-replies-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--primary);
    opacity: 0.75;
    transition: opacity 0.2s;
    margin-top: 0.1rem;
    align-self: flex-start;
}

.toggle-replies-btn:hover {
    opacity: 1;
}

.toggle-replies-btn i {
    font-size: 0.65rem;
}

.replies {
    display: flex;
    flex-direction: column;
    margin-top: 0.25rem;
    border-left: 1.5px solid color-mix(in srgb, var(--secondary) 35%, transparent);
    padding-left: 0.75rem;
}

.reply-indent {
    padding: 0.3rem 0;
}

.load-more-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent);
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text);
    opacity: 0.6;
    transition: opacity 0.2s, border-color 0.2s;
    align-self: flex-start;
    margin-top: 0.25rem;
}

.load-more-btn:hover {
    opacity: 1;
    border-color: var(--primary);
    color: var(--primary);
}

.load-more-btn i {
    font-size: 0.65rem;
}
</style>