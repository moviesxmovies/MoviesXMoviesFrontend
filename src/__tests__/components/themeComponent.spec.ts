import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ThemeToggle from "@/components/themeComponent.vue";
import i18n from "@/i18n";

const mockStore = {
  theme: "light",
  loadTheme: vi.fn(),
  toggleTheme: vi.fn(),
};

vi.mock("@/stores/themeStore", () => ({
  useThemeStore: vi.fn(() => mockStore),
}));

describe("ThemeToggle", () => {
  const factory = () => {
    return mount(ThemeToggle, {
      global: {
        plugins: [i18n],
      },
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.theme = "light";
  });

  it("Should call loadTheme on mount", () => {
    factory();
    expect(mockStore.loadTheme).toHaveBeenCalledOnce();
  });

  it("Should call toggleTheme when clicked", async () => {
    const wrapper = factory();
    await wrapper.find("button").trigger("click");
    expect(mockStore.toggleTheme).toHaveBeenCalledOnce();
  });

  describe("light mode", () => {
    it("Should show the sun", () => {
      const wrapper = factory();
      const [sun] = wrapper.findAll("svg");
      expect(sun.attributes("style")).toContain("opacity: 1");
    });

    it("Should not rotate the sun", () => {
      const wrapper = factory();
      const [sun] = wrapper.findAll("svg");
      expect(sun.attributes("style")).toContain("rotate: 0deg");
    });

    it("Should hide the moon", () => {
      const wrapper = factory();
      const [, moon] = wrapper.findAll("svg");
      expect(moon.attributes("style")).toContain("opacity: 0");
    });

    it("Should rotate the moon to -90deg", () => {
      const wrapper = factory();
      const [, moon] = wrapper.findAll("svg");
      expect(moon.attributes("style")).toContain("rotate: -90deg");
    });
  });

  describe("dark mode", () => {
    beforeEach(() => {
      mockStore.theme = "dark";
    });

    it("Should hide the sun", () => {
      const wrapper = factory();
      const [sun] = wrapper.findAll("svg");
      expect(sun.attributes("style")).toContain("opacity: 0");
    });

    it("Should rotate the sun to 90deg", () => {
      const wrapper = factory();
      const [sun] = wrapper.findAll("svg");
      expect(sun.attributes("style")).toContain("rotate: 90deg");
    });

    it("Should show the moon", () => {
      const wrapper = factory();
      const [, moon] = wrapper.findAll("svg");
      expect(moon.attributes("style")).toContain("opacity: 1");
    });

    it("Should not rotate the moon", () => {
      const wrapper = factory();
      const [, moon] = wrapper.findAll("svg");
      expect(moon.attributes("style")).toContain("rotate: 0deg");
    });
  });
});
