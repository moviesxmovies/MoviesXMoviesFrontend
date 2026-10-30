<script lang="ts" setup>
import type { FriendRequest } from '@/types';
import FriendComponent from './friendComponent.vue';

const props = defineProps<{
    request: FriendRequest;
}>();

const emit = defineEmits(['accept', 'decline']);
</script>

<template>
    <FriendComponent :from-user="request.from_user">
        <template #default="{ username }">
            <div class="request-actions">
                <button class="btn btn-accept" @click="$emit('accept', username)" :aria-label="$t('common.accept')" :title="$t('common.accept')">
                    <i class="pi pi-check" />
                </button>
                <button class="btn btn-decline" @click="$emit('decline', username)" :aria-label="$t('common.decline')" :title="$t('common.decline')">
                    <i class="pi pi-times" />
                </button>
            </div>
        </template>
    </FriendComponent>
</template>

<style scoped>
.request-actions {
    display: flex;
    gap: 0.5rem;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color 0.15s var(--ease), border-color 0.15s var(--ease);
}

.btn-accept {
    background: var(--primary);
    color: var(--on-primary);
}

.btn-accept:hover {
    background: var(--primary-hover);
}

.btn-decline {
    background: transparent;
    color: var(--text-muted);
    border-color: var(--border-strong);
}

.btn-decline:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: var(--danger-soft);
}

@container (max-width: 280px) {
    .request-actions {
        flex-direction: column;
    }
}
</style>
