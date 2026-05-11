<script lang="ts" setup>
import { completeFriendRequest, removeFriend } from '@/repositories/userRepository';
import type { User } from '@/types';
import { Dialog, useToast } from 'primevue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FriendWithFollow from './friendWithFollow.vue';

const { t } = useI18n();
const toast = useToast();
const props = defineProps<{
  users: User[];
}>();

const confirmVisible = ref(false);
const pendingUser = ref<User | null>(null);
const pendingAlreadyFriends = ref(false);

const handleFriendRequest = async (user: User, accept: boolean) => {
  try {
    await completeFriendRequest(user.username, accept);
    if (accept) {
      user.friendship = { is_friend: false, status: "P" };
    } else {
      user.friendship = { is_friend: false, status: null };
    }

  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.translatedMessage,
    });
  }
};

const removeFriendRequest = async (user: User) => {
  try {
    await removeFriend(user.username);
    user.friendship = { is_friend: false, status: null };
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.translatedMessage,
    });
  }
};

const removeFrienshipModal = (user: User, already_friends: boolean) => {
  pendingUser.value = user;
  pendingAlreadyFriends.value = already_friends;
  confirmVisible.value = true;
};

const confirmAction = () => {
  confirmVisible.value = false;
  if (!pendingUser.value) return;
  if (pendingAlreadyFriends.value) {
    removeFriendRequest(pendingUser.value);
  } else {
    handleFriendRequest(pendingUser.value, false);
  }
  pendingUser.value = null;
};
</script>

<template>
  <!-- CONFIRM DIALOG -->
  <Dialog v-model:visible="confirmVisible" modal :draggable="false" :dismissableMask="true"
    :style="{ width: '90vw', maxWidth: '380px' }" :pt="{
      root: { class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden' },
      header: { class: 'bg-[var(--background)] pb-0' },
      title: { class: 'text-xl font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      footer: { class: 'bg-[var(--background)] border-t border-[var(--secondary)]' },
      closeButton: { class: 'hover:bg-[var(--secondary)]/20 transition-colors' },
    }">
    <template #header>
      <div class="confirm-header">
        <div class="confirm-icon">
          <i class="pi pi-user-minus" />
        </div>
        <div>
          <p class="confirm-title">{{ t('search.confirmation') }}</p>
        </div>
      </div>
    </template>

    <p class="confirm-body">{{ t('search.confirmRemoveFriend') }}</p>

    <template #footer>
      <div class="footer-actions">
        <button class="btn-cancel" @click="confirmVisible = false">
          {{ t('common.cancel') }}
        </button>
        <button class="btn-remove" @click="confirmAction">
          <i class="pi pi-user-minus" />
          <span>{{ t('common.remove') }}</span>
        </button>
      </div>
    </template>
  </Dialog>

  <FriendWithFollow v-for="user in users" :key="user.id" :user="user"
    :onAddFriend="() => handleFriendRequest(user, true)" :onRemoveFriend="() => removeFrienshipModal(user, true)"
    :onRemovePending="() => removeFrienshipModal(user, false)" />
</template>

<style scoped>
.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--red) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
  color: var(--red);
  font-size: 1rem;
  flex-shrink: 0;
}

.confirm-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.confirm-body {
  font-size: 0.875rem;
  color: var(--gray);
  line-height: 1.6;
  margin: 0;
  padding: 0.25rem 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  width: 100%;
}

.btn-cancel {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--secondary) 60%, transparent);
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: color-mix(in srgb, var(--secondary) 15%, transparent);
}

.btn-remove {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: var(--red);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}

.btn-remove:hover {
  opacity: 0.85;
}
</style>