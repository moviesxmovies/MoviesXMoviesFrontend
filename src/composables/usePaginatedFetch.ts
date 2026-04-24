import { ref } from 'vue';
import type { DynamicPagination } from '@/types';

export function usePaginatedFetch<T extends object>() {
    const data = ref<DynamicPagination<T>>({} as DynamicPagination<T>);
    const loading = ref(false);

    const fetch = async (fetchFn: (lastId?: number) => Promise<DynamicPagination<T>>, lastId?: number) => {
        loading.value = true;
        try {
            const result = await fetchFn(lastId);
            if (!data.value.results) {
                data.value = result;
                return;
            }
            (data.value.results as T[]).push(...(result.results));
            data.value.next_last_id = result.next_last_id;
        } finally {
            loading.value = false;
        }
    };

    const reset = () => {
        data.value = {} as DynamicPagination<T>;
    };

    return { data, loading, fetch, reset };
}