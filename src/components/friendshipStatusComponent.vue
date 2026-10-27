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
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 999px;
  width: 2.25rem;
  height: 2.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition:
    background-color 0.15s,
    color 0.15s,
    transform 0.1s;
  line-height: 1;
}

.btn-action:hover {
  background: var(--primary);
  color: var(--on-primary);
}

.btn-action:active {
  transform: scale(0.96);
}

.status-info {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
}

/* Añadir: acción principal, relleno */
.btn-action.status-add {
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}

.btn-action.status-add:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* Ya sois amigos: verde, al pasar indica que se puede quitar */
.status-friend {
  border: 1px solid var(--success);
  color: var(--success);
  background: var(--success-soft);
}

.btn-action.status-friend:hover {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}

.status-pending {
  border: 1px solid var(--warning);
  color: var(--warning);
  background: var(--warning-soft);
}

.btn-action.status-pending:hover {
  background: var(--warning);
  color: var(--background);
}

.status-self {
  border: none;
  color: var(--text-subtle);
}

.status-failed,
.btn-action.status-failed {
  color: var(--danger);
  border-color: var(--danger);
}

.btn-action.status-failed:hover {
  background: var(--danger);
  color: var(--background);
}
</style>
