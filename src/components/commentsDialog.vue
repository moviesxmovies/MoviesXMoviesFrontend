<script lang="ts" setup>
import { useInfinitePagination } from '@/composables/useInfinitePagination';
import { fetchComments } from '@/repositories/reviewRepository';
import type { Comment, DynamicPagination } from '@/types';
import { Dialog, useToast } from 'primevue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps<{ visible: boolean; reviewId: number }>();
const emit = defineEmits<{ 'update:visible': [value: boolean] }>();
const commentsResponse = ref<DynamicPagination<Comment>>({} as DynamicPagination<Comment>);
const loading = ref(false);
const { t } = useI18n();
const toast = useToast();
const getUserLists = async (lastId?: number) => {
    loading.value = true;
    try {
        const response = await fetchComments(props.reviewId, lastId);
        if (lastId) {
            commentsResponse.value.results.push(...response.results);
            commentsResponse.value.next_last_id = response.next_last_id;
        } else {
            commentsResponse.value = response;
        }

    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail:
                error.response?.data?.message ||
                t("components.addToList.fetchListsError"),
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};
const { sentinelRef } = useInfinitePagination(
    commentsResponse,
    loading,
    getUserLists,
);

watch(() => props.visible, (val) => {
    if (val) getUserLists();
}, { immediate: true });
</script>

<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :draggable="false"
        :dismissableMask="true" :closable="true" :style="{ width: '90vw', maxWidth: '500px' }" :pt="{
            root: { class: 'comments-root' },
            header: { class: 'comments-header' },
            title: { class: 'comments-title' },
            content: { class: 'comments-content' },
            closeButton: { class: 'comments-close-btn' },
        }">
        <template #header>
            <div class="header-inner">
                <div class="header-icon">
                    <i class="pi pi-comments" />
                </div>
                <span class="header-text">{{ $t('commentsDialog.title') }}</span>
            </div>
        </template>

    </Dialog>
</template>