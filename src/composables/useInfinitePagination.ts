import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import type { Ref } from 'vue';
import type { DynamicPagination } from '@/types';

export function useInfinitePagination<T>(
    data: Ref<DynamicPagination<T>>,
    loading: Ref<boolean>,
    fetchFn: (lastId?: number) => Promise<void>
) {
    const { sentinelRef } = useInfiniteScroll(async () => {
        if (loading.value) return;
        loading.value = true;
        const lastId = data.value.next_last_id;
        if (lastId) await fetchFn(lastId);
        loading.value = false;
    });

    return { sentinelRef };
}