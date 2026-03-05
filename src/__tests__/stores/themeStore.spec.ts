import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, it, expect } from "vitest";
import { useThemeStore } from "@/stores/themeStore";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("useThemeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    document.documentElement.classList.remove("dark");
  });

  describe("initial state", () => {
    it('if no theme is saved in localStorage, uses "light" by default', () => {
      const store = useThemeStore();
      expect(store.theme).toBe("light");
    });

    it("reads the saved theme from localStorage", () => {
      localStorageMock.setItem("theme", "dark");
      const store = useThemeStore();
      expect(store.theme).toBe("dark");
    });
  });
  describe("toggleTheme", () => {
    it("changes from light to dark", () => {
      const store = useThemeStore();
      store.toggleTheme();
      expect(store.theme).toBe("dark");
    });

    it("changes from dark to light", () => {
      localStorageMock.setItem("theme", "dark");
      const store = useThemeStore();
      store.toggleTheme();
      expect(store.theme).toBe("light");
    });

    it("persists the theme in localStorage", () => {
      const store = useThemeStore();
      store.toggleTheme();
      expect(localStorageMock.getItem("theme")).toBe("dark");
    });
  });

  describe("loadTheme", () => {
    it("loads the saved theme from localStorage", () => {
      localStorageMock.setItem("theme", "dark");
      const store = useThemeStore();
      store.loadTheme();
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it('does not add the "dark" class if the theme is light', () => {
      const store = useThemeStore();
      store.loadTheme();
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
