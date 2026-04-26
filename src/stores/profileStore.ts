import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProfileStore = defineStore('profile', () => {
  const picture = ref<string | null>(null);
  const refreshKey = ref(0);

  const refresh = () => {
    refreshKey.value++;
  };

  return { picture, refreshKey, refresh };
});