import i18n from '@/i18n';
import { defineStore } from 'pinia';

export const useLangStore = defineStore('lang', {
    state: () => ({
        language: localStorage.getItem('language') || 'en'
    }),
    actions: {
        setLanguage(lang: string) {
            this.language = lang;
            // Method for sending to backend soon
            (i18n.global.locale.value as any) = lang.toLowerCase();
            localStorage.setItem('language', lang);
        }
    }
});