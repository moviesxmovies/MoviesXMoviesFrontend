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
                <button class="btn btn-accept" @click="$emit('accept', username)">
                    <i class="pi pi-check" />
                </button>
                <button class="btn btn-decline" @click="$emit('decline', username)">
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
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-accept {
    background: var(--accent);
    color: white;
}

.btn-decline {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--secondary);
}

@container (max-width: 280px) {
    .request-actions {
        flex-direction: column;
    }
}
</style>