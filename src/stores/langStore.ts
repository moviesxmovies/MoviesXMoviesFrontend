import { api } from "@/composables/useAPI";
import i18n from "@/i18n";
import { defineStore } from "pinia";

export const useLangStore = defineStore("lang", {
  state: () => ({
    language: localStorage.getItem("language") || "en",
  }),
  actions: {
    setLanguage(lang: string) {
      this.language = lang;
      (i18n.global.locale.value as any) = lang.toLowerCase();
      localStorage.setItem("language", lang);
    },

    async changeLanguage(lang: string) {
      const { status } = await api.post("/users/preferred-language/", {
        preferred_language: lang,
      });
      if (status !== 200) return;
      this.setLanguage(lang);
    },

    async fetchLanguage() {
      const { data, status } = await api.get("/users/preferred-language/");
      const lang =
        status === 200
          ? data.preferred_language
          : localStorage.getItem("language") || "en";

      this.setLanguage(lang);
    },
  },
});
