<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import type { FriendRequest, User } from '@/types';
import { goToUser } from '@/utils/goTo';
import { Button } from 'primevue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    request: FriendRequest;
}>();
const emit = defineEmits(['accept', 'decline']);
const user = ref<User | null>(null);


const fetchUserData = async () => {
    try {
        const profile: User = (await api.get(props.request.from_user)).data;
        user.value = profile;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};
onMounted(() => {
    fetchUserData();
});


</script>

<template>

    <div class="friend-request">
        <div class="request-info">
            <img :src="user?.picture" :alt="user?.username" class="profile-image cursor-pointer" @click="goToUser(user?.username)" />
            <span class="username cursor-pointer" @click="goToUser(user?.username)">{{ user?.username }}</span>
        </div>
        <div class="request-actions">
            <button class="btn btn-accept" @click="$emit('accept', user?.username)">
                <i class="pi pi-check" />
            </button>
            <button class="btn btn-decline" @click="$emit('decline', user?.username)">
                <i class="pi pi-times" />
            </button>
        </div>
    </div>
</template>
<style scoped>
.friend-request {
    container-type: inline-size;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    transition: background 0.2s;
}

.friend-request:hover {
    background: rgba(255, 255, 255, 0.05);
}

.request-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
}

.profile-image {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary);
}

.username {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    text-overflow: ellipsis;
}

.request-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}

.btn:hover {
    opacity: 0.85;
    transform: scale(1.03);
}

.btn:active {
    transform: scale(0.97);
}

.btn-accept {
    background: var(--accent);
    color: var(--white);
}

.btn-decline {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--secondary);
}

@container (max-width: 280px) {
    .request-actions {
        flex-direction: column;
        gap: 0.25rem;
    }

    .btn {
        padding: 0.25rem;
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 50%;
        font-size: 0.65rem;
        justify-content: center;
    }
}
</style>