import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export function useReviewForm() {
    const { t } = useI18n();

    const form = ref({ title: '', content: '', isPositive: true });
    const fieldErrors = ref<Record<string, string[]>>({});
    const serverErrors = ref<string[]>([]);

    const clearError = (field: string) => {
        if (fieldErrors.value[field]?.length) {
            fieldErrors.value = { ...fieldErrors.value, [field]: [] };
        }
        serverErrors.value = [];
    };

    const resetForm = () => {
        form.value = { title: '', content: '', isPositive: true };
        fieldErrors.value = {};
        serverErrors.value = [];
    };

    const validate = () => {
        fieldErrors.value = {};
        if (!form.value.title.trim()) fieldErrors.value.title = [t('review.error.titleRequired')];
        if (!form.value.content.trim()) fieldErrors.value.content = [t('review.error.contentRequired')];
        return !Object.keys(fieldErrors.value).length;
    };

    return { form, fieldErrors, serverErrors, clearError, resetForm, validate };
}