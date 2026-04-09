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
      const token = localStorage.getItem("access_token");
      if (token) {
        await api.post("/users/preferred-language/", {
          preferred_language: lang,
        });
      }
      this.setLanguage(lang);
    },

    async fetchLanguage() {
      try {
        const token = localStorage.getItem("access_token");

        if (token) {
          const { data } = await api.get("/users/preferred-language/");
          if (data?.preferred_language) {
            this.setLanguage(data.preferred_language);
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
      this.setLanguage(this.language ?? DEFAULT_LANGUAGE);
    },
  },
});
