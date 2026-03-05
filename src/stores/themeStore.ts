import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: localStorage.getItem("theme") || "light",
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
      applyTheme(this.theme);
    },
    loadTheme() {
        applyTheme(this.theme);
    }
  },
});

function applyTheme(theme: string) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}