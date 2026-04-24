import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationsStore = defineStore('notifications', () => {
    const pendingFriendRequests = ref(0);

    const refresh = () => {
        pendingFriendRequests.value++;
    };

    const set = (count: number) => {
        pendingFriendRequests.value = count;
    };

    return { pendingFriendRequests, refresh, set };
});