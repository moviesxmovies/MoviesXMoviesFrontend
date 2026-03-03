import i18n from '@/i18n';
import type { Lang } from '@/types/Langs';
import { defineStore } from 'pinia';

export const useLangStore = defineStore('lang', {
    state: () => ({
        language: localStorage.getItem('language') || 'en'
    }),
    actions: {
        setLanguage(lang: Lang) {
            this.language = lang;
            // TODO: send to backend
            i18n.global.locale.value = lang;
            localStorage.setItem('language', lang);
        }
    }
});