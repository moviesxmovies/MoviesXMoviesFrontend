<script lang="ts" setup>
import { computed, ref } from "vue";
import type { User } from "@/types";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  user: User;
  onAddFriend?: (username: string) => Promise<void>;
  onRemoveFriend?: (username: string) => Promise<void>;
  onRemovePending?: (username: string) => Promise<void>;
}>();

const { t } = useI18n();
const hasFailed = ref(false);
const sentFriendRequest = ref(false);

const statusConfig = computed(() => {
  if (!props.user.friendship) {
    return {
      icon: "pi pi-user",
      class: "status-self",
      label: t("components.friendWithFollow.status.self"),
      action: false,
    };
  }
  if (props.user.friendship.is_friend) {
    return {
      icon: "pi pi-check-circle",
      class: "status-friend",
      label: t("components.friendWithFollow.status.friend"),
      action: true,
    };
  }
  if (props.user.friendship.status === "P" || sentFriendRequest.value) {
    return {
      icon: "pi pi-clock",
      class: "status-pending",
      label: t("components.friendWithFollow.status.pending"),
      action: true,
    };
  }
  if (hasFailed.value) {
    return {
      icon: "pi pi-exclamation-triangle",
      class: "status-failed",
      label: t("components.friendWithFollow.status.failed"),
      action: false,
    };
  }
  return {
    icon: "pi pi-user-plus",
    class: "status-add",
    label: t("components.friendWithFollow.status.add"),
    action: true,
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
    console.error("Error sending friend request:", error);
  }
};

const removeFriendRequest = async () => {
  try {
    if (props.onRemoveFriend) {
      await props.onRemoveFriend(props.user.username);
    }
    sentFriendRequest.value = false;
  } catch (error) {
    hasFailed.value = true;
    console.error("Error sending friend request:", error);
  }
};

const removePendingState = async () => {
  try {
    if (props.onRemovePending) {
      await props.onRemovePending(props.user.username);
    }
    sentFriendRequest.value = false;
  } catch (error) {
    hasFailed.value = true;
    console.error("Error sending friend request:", error);
  }
};

const handleFriends = () => {
  if (props.user.friendship.is_friend) {
    removeFriendRequest();
  } else if (props.user.friendship.status === "P" || sentFriendRequest.value) {
    removePendingState();
  } else {
    sendFriendRequest();
  }
};
</script>

<template>
  <button
    v-if="statusConfig.action"
    class="btn-action"
    :class="statusConfig.class"
    @click="handleFriends"
    :title="statusConfig.label"
    :aria-label="statusConfig.label"
  >
    <i :class="statusConfig.icon"></i>
  </button>
  <div
    v-else
    :class="['status-info', statusConfig.class]"
    :title="statusConfig.label"
    :aria-label="statusConfig.label"
  >
    <i :class="statusConfig.icon"></i>
  </div>
</template>

<style scoped>
.btn-action {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.1s;
  line-height: 1;
}

.btn-action:hover {
  background: var(--accent);
  color: #e0e0e0;
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
  border: 1px solid var(--primary);
  color: var(--primary);
}

.status-friend:hover {
  background: var(--primary);
  color: #e0e0e0;
}

.status-pending {
  border: 1px solid var(--yellow);
  color: var(--yellow);
  animation: pulse 2s infinite;
}

.status-pending:hover {
  background: var(--yellow);
  color: var(--background);
}

.status-self {
  border: none;
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
