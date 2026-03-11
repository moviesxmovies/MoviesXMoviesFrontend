import { api } from "@/composables/useAPI";
import i18n from "@/i18n";
import { defineStore } from "pinia";

export const useLangStore = defineStore("lang", {
  state: () => ({
    language: localStorage.getItem("language") || "en",
  }),
  getters: {
    getLanguage: (state) => state.language,
  },
  actions: {
    async setLanguage(lang: string) {
      this.language = lang;
      const { status } = await api.post("/user/preferred-language", {
        preferred_language: lang,
      });
      if (status !== 200) {
        return;
      }
      (i18n.global.locale.value as any) = lang.toLowerCase();
      localStorage.setItem("language", lang);
    },
  },
});
