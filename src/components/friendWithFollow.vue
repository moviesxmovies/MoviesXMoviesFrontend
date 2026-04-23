<script lang="ts" setup>
import FriendComponent from './friendComponent.vue';
import FriendshipStatusComponent from './friendshipStatusComponent.vue';
import type { User } from '@/types';

const props = defineProps<{
    user: User;
    isSelfUser?: boolean;
    onAddFriend?: (username: string) => Promise<void>;
}>();

</script>

<template>
    <FriendComponent :username="props.user.username">
        <template #default v-if="!isSelfUser">
            <FriendshipStatusComponent :user="props.user" :onAddFriend="props.onAddFriend" />
        </template>
    </FriendComponent>
</template>