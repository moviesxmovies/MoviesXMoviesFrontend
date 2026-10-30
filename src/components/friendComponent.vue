<script lang="ts" setup>
import { api } from '@/composables/useAPI';
import { getUserProfile } from '@/repositories/userRepository';
import type { User } from '@/types';
import { goToUser } from '@/utils/goTo';
import { Skeleton } from 'primevue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    fromUser?: string;
    username?: string;
}>();

const user = ref<User | null>(null);
const loading = ref(true);
const loadingImage = ref(true);
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
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUserData();
});
</script>

<template>
    <div class="friend-card">
        <template v-if="loading">
            <div class="user-info">
                <skeleton shape="circle" width="2.5rem" height="2.5rem" />
                <Skeleton width="100px" height="14px" border-radius="6px" />
            </div>
            <Skeleton width="80px" height="32px" border-radius="8px" />
        </template>
        <template v-else>
            <div class="user-info">
                <div class="profile-image-wrapper">
                    <Skeleton v-if="loadingImage" shape="circle" width="2.5rem" height="2.5rem" class="absolute" />
                    <img v-show="!loadingImage" :src="user?.picture" :alt="user?.username"
                        class="profile-image cursor-pointer" @click="goToUser(user?.username)"
                        @load="loadingImage = false" />
                </div>
                <a class="username cursor-pointer" :href="`/users/${user?.username}`" @click.prevent="goToUser(user?.username)">{{ user?.username }}</a>
            </div>

            <div class="actions-slot">
                <slot :username="user?.username" />
            </div>
        </template>
    </div>
</template>

<style scoped>
.friend-card {
    container-type: inline-size;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--surface);
    transition: border-color 0.15s var(--ease), background-color 0.15s var(--ease);
}

.friend-card:hover {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
}

.profile-image-wrapper {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.absolute {
    position: absolute;
    top: 0;
    left: 0;
}

.profile-image {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    display: block;
}

.username {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.username:hover {
    color: var(--primary);
}
</style>
