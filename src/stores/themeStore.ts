import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => {
    let theme = "light";
    try {
      theme = localStorage.getItem("theme") || "light";
    } catch {
      // Testing environment without localStorage, or SSR. Default to light theme, which is fine.
    }
    return { theme };
  },

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