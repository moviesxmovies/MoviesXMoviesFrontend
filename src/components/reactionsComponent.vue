<script lang="ts" setup>
import { deleteReactionApi, getCommentReactions, getReviewReactions, postReactionApi } from '@/repositories/reviewRepository';
import type { ReactionResponse } from '@/types';
import { Skeleton } from 'primevue';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    reviewId: number;
    commentId?: number;
    pickerUp?: boolean;
}>(), {
    pickerUp: true
})

const reactionResponse = ref<ReactionResponse>();
const showPicker = ref(false);
const loading = ref(false);

const EMOJI_MAP: Record<string, string> = {
    LIKE: '👍',
    LOVE: '❤️',
    LAUGH: '😂',
    SAD: '😢',
    FIRE: '🔥',
    EYES: '👀',
    POOP: '💩',
    SKULL: '💀',
    CLOWN: '🤡',
    MIND_BLOWN: '🤯',
    PARTY: '🎉',
    THINKING: '🤔',
    POPCORN: '🍿',
    STAR: '⭐',
    TOP: '🔝',
    TRASH: '🗑️',
};
const EMOJI_TO_TYPE = Object.fromEntries(
    Object.entries(EMOJI_MAP).map(([type, emoji]) => [emoji, type])
);
const activeReactions = () => {
    const r = reactionResponse.value?.reactions ?? {};
    return Object.entries(r);
};

const hasReacted = (emoji: string): boolean => {
    return !!(reactionResponse.value?.your_reactions?.[emoji]);
};

const sendReaction = async (emoji: string) => {
    showPicker.value = false;
    const type = EMOJI_TO_TYPE[emoji];
    if (!type) return;
    try {
        reactionResponse.value = {
            reactions: {
                ...reactionResponse.value?.reactions,
                [emoji]: (reactionResponse.value?.reactions?.[emoji] ?? 0) + 1,
            },
            your_reactions: {
                ...reactionResponse.value?.your_reactions,
                [emoji]: -1,
            },
        };

        const reaction = await postReactionApi(props.reviewId, type, props.commentId);

        reactionResponse.value = {
            ...reactionResponse.value,
            your_reactions: {
                ...reactionResponse.value?.your_reactions,
                [emoji]: reaction.id,
            },
        };
    } catch (error) {
        const newReactions = { ...reactionResponse.value?.reactions };
        const newCount = (newReactions[emoji] ?? 1) - 1;
        if (newCount <= 0) delete newReactions[emoji];
        else newReactions[emoji] = newCount;

        const newYourReactions = { ...reactionResponse.value?.your_reactions };
        delete newYourReactions[emoji];

        reactionResponse.value = {
            reactions: newReactions,
            your_reactions: newYourReactions,
        };
        console.error('Error sending reaction:', error);
    }
};
const deleteReaction = async (emoji: string) => {
    const id = reactionResponse.value?.your_reactions?.[emoji];
    if (!id) return;
    try {
        await deleteReactionApi(props.reviewId, id, props.commentId);
        const newReactions = { ...reactionResponse.value?.reactions };
        const newCount = (newReactions[emoji] ?? 1) - 1;
        if (newCount <= 0) {
            delete newReactions[emoji];
        } else {
            newReactions[emoji] = newCount;
        }
        const newYourReactions = { ...reactionResponse.value?.your_reactions };
        delete newYourReactions[emoji];
        reactionResponse.value = {
            reactions: newReactions,
            your_reactions: newYourReactions,
        };
    } catch (error) {
        console.error('Error deleting reaction:', error);
    }
};


const toggleReaction = (emoji: string) => {
    if (hasReacted(emoji)) {
        deleteReaction(emoji);
    } else {
        sendReaction(emoji);
    }
};

watch(
    () => [props.reviewId, props.commentId],
    async (newObjectId) => {
        if (newObjectId) {
            loading.value = true;
            let response;
            try {
                if (props.commentId) {
                    response = await getCommentReactions(props.reviewId, props.commentId);

                } else {
                    response = await getReviewReactions(props.reviewId);

                }
                reactionResponse.value = response;
            } catch (error) {
                console.error('Error fetching reactions:', error);
            } finally {
                loading.value = false;
            }
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="reactions-wrapper">
        <!-- SKELETON -->
        <div v-if="loading" class="reactions-bar">
            <Skeleton v-for="i in 3" :key="i" height="26px" :width="`${40 + i * 10}px`" border-radius="999px" />
            <Skeleton width="32px" height="26px" border-radius="999px" />
        </div>
        <template v-else>
            <!-- Active Reactions -->

            <div class="reactions-bar">
                <button v-for="[emoji, count] in activeReactions()" :key="emoji" class="reaction-pill"
                    :class="{ 'reacted': hasReacted(emoji) }" :aria-pressed="hasReacted(emoji)" @click="toggleReaction(emoji)">
                    <span class="reaction-emoji" aria-hidden="true">{{ emoji }}</span>
                    <span class="reaction-count">{{ count }}</span>
                </button>

                <!-- Picker Open -->
                <button class="add-reaction-btn" @click="showPicker = !showPicker" :aria-expanded="showPicker"
                    :title="$t('reactions.add')" :aria-label="$t('reactions.add')">
                    <i class="pi pi-face-smile" aria-hidden="true" />
                    <span aria-hidden="true">+</span>
                </button>
            </div>

            <!-- Emoji picker -->
            <div v-if="showPicker" class="emoji-picker" :class="pickerUp != false ? 'picker-up' : 'picker-down'">
                <button v-for="emoji in Object.values(EMOJI_MAP)" :key="emoji" class="emoji-option"
                    :class="{ 'reacted': hasReacted(emoji) }" @click="toggleReaction(emoji)">
                    {{ emoji }}
                </button>
            </div>
        </template>
    </div>

</template>

<style scoped>
.reactions-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.reactions-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
}

.reaction-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    height: 1.9rem;
    padding: 0 0.65rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.15s, border-color 0.15s, transform 0.1s;
}

.reaction-pill:hover {
    border-color: var(--border-strong);
    background: var(--surface-hover);
}

.reaction-pill:active {
    transform: scale(0.96);
}

.reaction-pill.reacted {
    background: var(--primary-soft);
    border-color: var(--primary);
}

.reaction-pill.reacted .reaction-count {
    color: var(--primary);
}

.reaction-emoji {
    font-size: 0.95rem;
    line-height: 1;
}

.reaction-count {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-muted);
}

.add-reaction-btn {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    height: 1.9rem;
    padding: 0 0.6rem;
    border-radius: 999px;
    border: 1px dashed var(--border-strong);
    background: transparent;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-subtle);
    transition: color 0.15s, border-color 0.15s;
}

.add-reaction-btn i {
    font-size: 0.85rem;
}

.add-reaction-btn:hover {
    color: var(--primary);
    border-color: var(--primary);
}

.emoji-picker {
    position: absolute;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.6rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10;
    width: 288px;
    max-width: 288px;
}

.picker-up {
    bottom: calc(100% + 0.5rem);
}

.picker-down {
    top: calc(100% + 0.5rem);
}

.emoji-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1.15rem;
    transition: background-color 0.15s, transform 0.1s;
}

.emoji-option:hover {
    background: var(--surface-hover);
    transform: scale(1.15);
}

.emoji-option.reacted {
    background: var(--primary-soft);
}
</style>
