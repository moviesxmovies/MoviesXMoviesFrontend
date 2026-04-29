<script lang="ts" setup>
import { getReview, updateReview } from '@/repositories/movieRepository';
import { ref, watch } from 'vue';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';
import ReviewFormDialog from './reviewFormDialog.vue';
import { useReviewForm } from '@/composables/useReviewForm';
import { handleApiError } from '@/utils/handleApiError';

const props = defineProps<{ visible: boolean; reviewId: number }>();
const emit = defineEmits<{ 'update:visible': [value: boolean]; 'reload': [] }>();

const { t } = useI18n();
const toast = useToast();
const loadingFetch = ref(false);
const loadingSubmit = ref(false);
const { form, fieldErrors, serverErrors, clearError, validate } = useReviewForm();

const fetchReview = async () => {
    loadingFetch.value = true;
    fieldErrors.value = {};
    serverErrors.value = [];
    try {
        const review = await getReview(props.reviewId);
        form.value = { title: review.title, content: review.content, isPositive: review.is_positive };
    } catch {
        toast.add({ severity: 'error', summary: t('toast.error'), detail: t('review.error.fetching'), life: 3000 });
        emit('update:visible', false);
    } finally {
        loadingFetch.value = false;
    }
};

const reset = () => {
    fetchReview();
    fieldErrors.value = {};
    serverErrors.value = [];
};

const submit = async () => {
    if (!validate()) return;
    loadingSubmit.value = true;
    try {
        await updateReview(props.reviewId, form.value);
        emit('reload');
        emit('update:visible', false);
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('review.updated'), life: 3000 });
    } catch (error: any) {
        fieldErrors.value = {};
        serverErrors.value = [];
        handleApiError(error, fieldErrors, serverErrors, toast, t);
    } finally {
        loadingSubmit.value = false;
    }
};

watch(() => props.visible, (val) => { if (val) fetchReview(); });
</script>

<template>
    <ReviewFormDialog v-model:form="form" :visible="visible" :header="t('review.editReview')" :loading="loadingSubmit"
        :loading-fetch="loadingFetch" :field-errors="fieldErrors" :server-errors="serverErrors"
        :save-label="t('common.edit')" @update:visible="emit('update:visible', $event)" @submit="submit"
        @clear-error="clearError" @reset="reset" :reset="true" />
</template>