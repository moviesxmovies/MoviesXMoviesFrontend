<script lang="ts" setup>
import { submitReview } from '@/repositories/movieRepository';
import { ref, watch } from 'vue';
import { useToast } from 'primevue';
import { useI18n } from 'vue-i18n';
import ReviewFormDialog from './reviewFormDialog.vue';
import { useReviewForm } from '@/composables/useReviewForm';
import { handleApiError } from '@/utils/handleApiError';

const props = defineProps<{ visible: boolean; movieSlug: string }>();
const emit = defineEmits<{ 'update:visible': [value: boolean]; 'reload': [] }>();

const { t } = useI18n();
const toast = useToast();
const loading = ref(false);
const { form, fieldErrors, serverErrors, clearError, resetForm, validate } = useReviewForm();

const submit = async () => {
    if (!validate()) return;
    loading.value = true;
    try {
        await submitReview(props.movieSlug, form.value);
        emit('reload');
        emit('update:visible', false);
        toast.add({ severity: 'success', summary: t('toast.success'), detail: t('review.submitted'), life: 3000 });
    } catch (error: any) {
        fieldErrors.value = {};
        serverErrors.value = [];
        handleApiError(error, fieldErrors, serverErrors, toast, t);
    } finally {
        loading.value = false;
    }
};

watch(() => props.visible, (val) => { if (val) resetForm(); });
</script>

<template>
    <ReviewFormDialog v-model:form="form" :visible="visible" :header="t('review.addReview')" :loading="loading"
        :field-errors="fieldErrors" :server-errors="serverErrors" @update:visible="emit('update:visible', $event)"
        @submit="submit" @clear-error="clearError" />
</template>