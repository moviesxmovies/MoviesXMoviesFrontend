import type { Ref } from "vue";

export function handleApiError(error: any, fieldErrors: Ref, serverErrors: Ref, toast: any, t: any) {
    const data = error.response?.data;
    if (data) {
        Object.entries(data).forEach(([key, value]) => {
            const messages = Array.isArray(value) ? value as string[] : [value as string];
            if (key === 'error' || key === '__all__') serverErrors.value.push(...messages);
            else fieldErrors.value[key] = messages;
        });
    } else {
        toast.add({ severity: 'error', summary: t('toast.error'), detail: t('errors.generic'), life: 3000 });
    }
}