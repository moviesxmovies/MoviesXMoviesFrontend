import i18n from '@/i18n';
import { defineStore } from 'pinia';

export const useLangStore = defineStore('lang', {
    state: () => ({
        language: localStorage.getItem('language') || 'en'
    }),
    actions: {
        setLanguage(lang: string) {
            this.language = lang;
            // TODO: send to backend
            (i18n.global.locale.value as any) = lang;
            localStorage.setItem('language', lang);
        }
    }
});