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
        <i class="pi pi-search" style="font-size: 1rem" />
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

.skeleton-card {
  width: 100%;
  height: 80px;
  padding: 0.5rem 1rem;
}

:deep(.p-confirmdialog) {
  background: color-mix(in srgb, var(--secondary) 80%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  max-width: 300px;
}

@media (min-width: 640px) {
  :deep(.p-confirmdialog) {
    max-width: 450px;
  }
}

@media (min-width: 1024px) {
  :deep(.p-confirmdialog) {
    max-width: 600px;
  }
}

/* Dialog Header */
:deep(.p-dialog-header) {
  background: transparent;
  padding: 1.5rem 1.5rem 0.5rem;
  color: var(--text);
}

:deep(.p-dialog-title) {
  font-weight: 800;
  font-size: 1.25rem;
}

/* Dialog message and icon */
:deep(.p-dialog-content) {
  background: transparent;
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

:deep(.p-confirmdialog-icon) {
  font-size: 2rem;
  color: #b73b3b;
}

:deep(.p-confirmdialog-message) {
  color: var(--text);
  line-height: 1.5;
  font-size: 1rem;
}

:deep(.p-dialog-footer) {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.p-dialog-footer button) {
  border-radius: 0.75rem;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

/* Cancel button */
:deep(.p-button-secondary.p-button-outlined) {
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: var(--text) !important;
}

:deep(.p-button-secondary.p-button-outlined:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Close button (x) */
:deep(.p-dialog-header-icons .p-dialog-header-close) {
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transition: all 0.2s;
}
</style>
