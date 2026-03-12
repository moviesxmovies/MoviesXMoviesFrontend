import { api } from "@/composables/useAPI";
import i18n from "@/i18n";
import {
  DEFAULT_LANGUAGE,
  getValidLocale,
} from "@/repositories/i18n/i18nRepository";
import { defineStore } from "pinia";

export const useLangStore = defineStore("lang", {
  state: () => ({
    language: getValidLocale(),
  }),
  actions: {
    setLanguage(lang: string) {
      this.language = lang;
      (i18n.global.locale.value as any) = lang;
      localStorage.setItem("language", lang);
    },

    async changeLanguage(lang: string) {
      api.post("/users/preferred-language/", {
        preferred_language: lang,
      });
      this.setLanguage(lang);
    },

    async fetchLanguage() {
      try {
        const { data, status } = await api.get("/users/preferred-language/");

        if (status === 200 && data.preferred_language) {
          this.setLanguage(data.preferred_language);
        } else {
          await this.changeLanguage(this.language ?? DEFAULT_LANGUAGE);
        }
      } catch (error) {
        console.error(error);
        this.setLanguage(this.language ?? DEFAULT_LANGUAGE);
      }
    },
  },
});
