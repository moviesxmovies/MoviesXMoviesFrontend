<script lang="ts" setup>
import CelebrityCardComponent from "@/components/celebrityCardComponent.vue";
import PaginationComponent from "@/components/paginationComponent.vue";
import { celebritySearching } from "@/repositories/personRepository";
import { useAuthStore } from "@/stores/authStore";
import type { Pagination, Person } from "@/types";
import { Skeleton, useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const celebrities = ref<Pagination<Person>>({} as Pagination<Person>);
const { t } = useI18n();
const loading = ref<boolean>(false);
const authStore = useAuthStore();

const searchCelebrities = async () => {
    try {
        loading.value = true;
        celebrities.value = await celebritySearching(
            String(route.query.name || ""),
            Number(route.query.page || 1),
        );
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: error.response?.data?.message || t("search.searchCelebritiesError"),
        });
    } finally {
        loading.value = false;
    }
};

const updateRoute = (page: number) => {
    router.push({
        path: route.path,
        query: { ...route.query, page },
    });
};

watch(
    () => route.query,
    async () => { await searchCelebrities(); },
    { immediate: true },
);
</script>

<template>
    <div class="users-list">

        <!-- ── SKELETON GRID ────────────────────────────────── -->
        <div v-if="loading" class="celebs-grid">
            <div v-for="n in 10" :key="n" class="skeleton-card">
                <!-- Imagen -->
                <Skeleton width="100%" height="100%" class="skeleton-img" />
                <!-- Badge género -->
                <Skeleton width="22px" height="22px" border-radius="6px" class="skeleton-badge-gender" />
                <!-- Footer -->
                <div class="skeleton-footer">
                    <Skeleton width="70%" height="12px" border-radius="4px" />
                    <Skeleton width="50%" height="10px" border-radius="4px" />
                </div>
            </div>
        </div>

        <!-- ── EMPTY STATE ─────────────────────────────────── -->
        <div v-else-if="!celebrities.results?.length" class="state-box">
            <div class="empty-icon">
                <i class="pi pi-search" style="font-size: 1rem" />
            </div>
            <p class="empty-title">{{ t("search.empty") }}</p>
            <span class="empty-sub">{{ t("search.help") }}</span>
        </div>

        <!-- ── RESULTS GRID ────────────────────────────────── -->
        <div v-else class="celebs-grid">
            <CelebrityCardComponent v-for="celebrity in celebrities.results" :key="celebrity.id"
                :celebrity="celebrity" />
        </div>


    </div>
    <PaginationComponent v-if="!loading && celebrities.total_pages > 1" data-testid="PaginationComponent"
        :total_pages="celebrities.total_pages" :current_page="celebrities.current_page" @change-page="updateRoute"
        style="margin-top: 1.5rem" />
</template>
<style scoped>
.users-list {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

@media (min-width: 768px) {
    .users-list {
        max-width: 800px;
    }
}

@media (min-width: 1024px) {
    .users-list {
        max-width: 1200px;
    }
}

/* ── Grid ────────────────────────────────────── */
.celebs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.85rem;
    width: 100%;
}

@media (min-width: 768px) {
    .celebs-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

/* ── Skeleton card ──────────────────────────────────────── */
.skeleton-card {
    position: relative;
    aspect-ratio: 2 / 3;
    border-radius: 1.25rem;
    overflow: hidden;
    border: 1px solid var(--secondary);
}

:deep(.skeleton-img) {
    position: absolute;
    inset: 0;
    border-radius: 0 !important;
}

.skeleton-badge-gender {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
}

.skeleton-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem 0.75rem 0.75rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    z-index: 2;
}

/* ── Empty state ────────────────────────────────────────── */
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