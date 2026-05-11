import { ref } from 'vue';

type TranslateFn = () => Promise<{ content: string } | { title: string; body: string }>;

export function useTranslation(fetchFn: TranslateFn) {
    const isTranslated = ref(false);
    const isLoading = ref(false);
    const translatedData = ref<{ content: string } | { title: string; body: string } | null>(null);
    const error = ref<string | null>(null);

    const translate = async () => {
        if (isTranslated.value) {
            isTranslated.value = false;
            return;
        }

        if (translatedData.value) {
            isTranslated.value = true;
            return;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const data = await fetchFn();
            translatedData.value = data;
            isTranslated.value = true;
        } catch (err: any) {
            error.value = err?.message ?? 'Translation failed';
        } finally {
            isLoading.value = false;
        }
    };

    const reset = () => {
        isTranslated.value = false;
        translatedData.value = null;
        error.value = null;
    };

    return {
        isTranslated,
        isLoading,
        translatedData,
        error,
        translate,
        reset,
    };
}