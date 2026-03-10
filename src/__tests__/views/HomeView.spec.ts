import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import HomeView from "@/views/HomeView.vue";
import i18n from "@/i18n";

describe("HomeView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.documentElement.className = "";
  });

  it("should call loadTheme on mount", async () => {
    mount(HomeView, {
      global: {
        plugins: [createPinia(), i18n],
      },
    });

    await flushPromises();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should apply dark theme on mount if stored", async () => {
    localStorage.setItem("theme", "dark");

    mount(HomeView, {
      global: {
        plugins: [createPinia(), i18n],
      },
    });

    await flushPromises();

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    localStorage.removeItem("theme");
  });
});
