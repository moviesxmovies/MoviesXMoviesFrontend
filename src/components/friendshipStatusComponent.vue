<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { User } from '@/types';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    user: User;
    onAddFriend?: (username: string) => Promise<void>;
}>();

const { t } = useI18n();
const hasFailed = ref(false);
const sentFriendRequest = ref(false);

const statusConfig = computed(() => {
    if (!props.user.friendship) {
        return {
            icon: 'pi pi-user',
            class: 'status-self',
            label: t('components.friendWithFollow.status.self'),
            canAction: false
        };
    }
    if (props.user.friendship.is_friend) {
        return {
            icon: 'pi pi-check-circle',
            class: 'status-friend',
            label: t('components.friendWithFollow.status.friend'),
            canAction: false
        };
    }
    if (props.user.friendship.status === 'P' || sentFriendRequest.value) {
        return {
            icon: 'pi pi-clock',
            class: 'status-pending',
            label: t('components.friendWithFollow.status.pending'),
            canAction: false
        };
    }
    if (hasFailed.value) {
        return {
            icon: 'pi pi-exclamation-triangle',
            class: 'status-failed',
            label: t('components.friendWithFollow.status.failed'),
            canAction: true
        };
    }
    return {
        icon: 'pi pi-user-plus',
        class: 'status-add',
        label: t('components.friendWithFollow.status.add'),
        canAction: true
    };
});

const sendFriendRequest = async () => {
    try {
        if (props.onAddFriend) {
            await props.onAddFriend(props.user.username);
        }
        sentFriendRequest.value = true;
    } catch (error) {
        hasFailed.value = true;
        console.error('Error sending friend request:', error);
    }
};
</script>

<template>
    <button v-if="statusConfig.canAction" class="btn-action" :class="statusConfig.class" @click="sendFriendRequest"
        :title="statusConfig.label" :aria-label="statusConfig.label">
        <i :class="statusConfig.icon"></i>
    </button>
    <div v-else :class="['status-info', statusConfig.class]" :title="statusConfig.label"
        :aria-label="statusConfig.label">
        <i :class="statusConfig.icon"></i>
    </div>
</template>

<style scoped>
.btn-action {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 999px;
    width: 2rem;
    height: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    transition: background 0.2s, color 0.2s, transform 0.1s;
    line-height: 1;
}

.btn-action:hover {
    background: var(--accent);
    color: var(--text);
}

.btn-action:active {
    transform: scale(0.97);
}

.status-info {
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
}

.status-friend {
    color: var(--primary);
}

.status-pending {
    color: var(--yellow);
    animation: pulse 2s infinite;
}

.status-self {
    color: var(--secondary);
}

.status-failed {
    color: var(--red);
    border-color: var(--red);
}

.btn-action.status-failed {
    color: var(--red);
    border-color: var(--red);
}

.btn-action.status-failed:hover {
    background: var(--red);
    color: white;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}
</style>