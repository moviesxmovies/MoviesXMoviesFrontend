<script lang="ts" setup>
import FriendComponent from "@/components/friendComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  userSearching,
  type userSearchingData,
} from "@/repositories/userRepository";
import type { Pagination, User } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const route = useRoute();
const toast = useToast();
const users = ref<Pagination<User>>({} as Pagination<User>);
const { t } = useI18n();
const loading = ref<boolean>(false);

const searchUsers = async (data: userSearchingData) => {
  try {
    loading.value = true;
    users.value = await userSearching(data);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("search.searchUsersError"),
    });
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.query,
  async () => {
    console.log(route.query);
    await searchUsers(route.query);
  },
  { immediate: true },
);
</script>

<template>
  <div class="users-list">
    <div v-if="loading" class="state-box">
      <i class="pi pi-spin pi-spinner" style="font-size: 1.25rem;" />
      <span>{{ t("loading") }}</span>
    </div>

    <div v-else-if="!users.results?.length" class="state-box">
      <div class="empty-icon">
        <i class="pi pi-search" style="font-size: 1rem;" />
      </div>
      <p class="empty-title">{{ t("search.empty") }}</p>
      <span class="empty-sub">{{ t("search.help") }}</span>
    </div>

    <template v-else>
      <FriendComponent
        v-for="user in users.results"
        :key="user.id"
        :username="user.username"
      />
    </template>

    <PaginationComponent
      v-if="!loading && users.total_pages > 1"
      data-testid="PaginationComponent"
      :total_pages="users.total_pages"
      :current_page="users.current_page"
      style="margin-top: 1.5rem;"
    />
  </div>
</template>

<style scoped>
.users-list {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 8px;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}
</style>
