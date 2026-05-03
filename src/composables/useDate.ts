import { useLangStore } from "@/stores/langStore";

export function useDate() {
    const langStore = useLangStore();

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const currentLang = langStore.language || 'es';
        const rtf = new Intl.RelativeTimeFormat(currentLang, { numeric: 'auto' });

        if (diffInSeconds < 60) {
            return rtf.format(-diffInSeconds, 'second');
        }

        if (diffInSeconds < 3600) {
            return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
        }

        if (diffInSeconds < 86400) {
            return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
        }

        if (diffInSeconds < 2592000) {
            return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
        }

        return date.toLocaleDateString(currentLang);
    };

    return { formatRelativeTime };
}