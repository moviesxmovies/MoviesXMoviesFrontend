<script lang="ts" setup>
import { deleteReactionApi, getCommentReactions, getReviewReactions, postReactionApi } from '@/repositories/reviewRepository';
import type { ReactionResponse } from '@/types';
import { Skeleton } from 'primevue';
import { ref, watch } from 'vue';

const props = defineProps<{
    reviewId: number;
    commentId?: number;

}>();

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
            }finally {
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
                :class="{ 'reacted': hasReacted(emoji) }" @click="toggleReaction(emoji)">
                <span class="reaction-emoji">{{ emoji }}</span>
                <span class="reaction-count">{{ count }}</span>
            </button>

            <!-- Picker Open -->
            <button class="add-reaction-btn" @click="showPicker = !showPicker">
                <span>＋</span>
            </button>
        </div>

        <!-- Emoji picker -->
        <div v-if="showPicker" class="emoji-picker">
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
    gap: 0.35rem;
}

.reaction-pill {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--secondary);
    background: transparent;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.reaction-pill:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.05);
}

.reaction-pill.reacted {
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    border-color: var(--primary);
}

.reaction-emoji {
    font-size: 0.9rem;
    line-height: 1;
}

.reaction-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text);
    opacity: 0.8;
}

.add-reaction-btn {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    border: 1px dashed var(--secondary);
    background: transparent;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.5;
    transition: opacity 0.15s, border-color 0.15s;
}

.add-reaction-btn:hover {
    opacity: 1;
    border-color: var(--primary);
}

.emoji-hint {
    font-size: 0.85rem;
}

.emoji-picker {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.6rem;
    background: var(--background);
    border: 1px solid var(--secondary);
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 10;
    max-width: 280px;
}

.emoji-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background 0.15s, transform 0.1s;
}

.emoji-option:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.2);
}

.emoji-option.reacted {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
}
</style>