<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import { getUserProfile } from '@/repositories/userRepository';
import type { User } from '@/types';
import { goToUser } from '@/utils/goTo';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    fromUser?: string;
    username?: string;
}>();

const user = ref<User | null>(null);

const fetchUserData = async () => {
    if (!props.fromUser && !props.username) {
        console.warn('No user identifier provided to FriendComponent');
        return;
    }
    try {
        if (props.username) {
            const profile: User = await getUserProfile(props.username);
            user.value = profile;
            return;
        }
        if (props.fromUser) {
            const profile: User = (await api.get(props.fromUser)).data;
            user.value = profile;
            return;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

onMounted(() => {
    fetchUserData();
});
</script>

<template>
    <div class="friend-card">
        <div class="user-info">
            <img :src="user?.picture" :alt="user?.username" class="profile-image cursor-pointer"
                @click="goToUser(user?.username)" />
            <span class="username cursor-pointer" @click="goToUser(user?.username)">{{ user?.username }}</span>
        </div>

        <div class="actions-slot">
            <slot :username="user?.username" />
        </div>
    </div>
</template>

<style scoped>
.friend-card {
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

.user-info {
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
}
</style>