<script lang="ts" setup>
import HandleFriendshipComponent from "@/components/handleFriendshipComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import {
  userSearching,
  type userSearchingData,
} from "@/repositories/userRepository";
import type { Pagination, User } from "@/types";
import { Skeleton, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
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

const updateRoute = (page: number) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      page,
    },
  });
};

watch(
  () => route.query,
  async () => {
    await searchUsers(route.query);
  },
  { immediate: true },
);
</script>

<template>
  <div class="users-list">
    <div v-if="loading">
      <div v-for="n in 10" :key="n" class="skeleton-card">
        <Skeleton height="100%" border-radius="1rem" />
      </div>
    </div>

    <div v-else-if="!users.results?.length" class="state-box">
      <div class="empty-icon">
        <i class="pi pi-search" aria-hidden="true" />
      </div>
      <p class="empty-title">{{ t("search.empty") }}</p>
      <span class="empty-sub">{{ t("search.help") }}</span>
    </div>

    <HandleFriendshipComponent v-else :users="users.results" />

    <PaginationComponent
      v-if="!loading && users.total_pages > 1"
      data-testid="PaginationComponent"
      :total_pages="users.total_pages"
      :current_page="users.current_page"
      @change-page="updateRoute"
      style="margin-top: 1.5rem"
    />
  </div>
</template>

<style scoped>
.users-list {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 0.5rem;
  text-align: center;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-xl);
  background: var(--surface);
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.empty-sub {
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.skeleton-card {
  width: 100%;
  height: 80px;
  padding: 0.5rem 1rem;
}
</style>
