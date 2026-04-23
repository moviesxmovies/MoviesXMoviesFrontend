import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchPlatformsComponent from "@/components/searchPlatformsComponent.vue";
import { createPinia } from "pinia";
import { reactive } from "vue";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockFetchPlatforms = vi.fn();
const mockToastAdd = vi.fn();
const mockLangStore = reactive({ language: "en" });
const mockRoute = reactive({ query: {} as Record<string, any> });

vi.mock("@/repositories/platformRepository", () => ({
  fetchPlatforms: () => mockFetchPlatforms(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  MultiSelect: {
    name: "MultiSelect",
    template: `<div data-testid="multiselect"
      :data-loading="loading"
      :data-disabled="disabled"
      :data-placeholder="placeholder"
      @change="$emit('change')"
    />`,
    props: ["modelValue", "loading", "disabled", "options", "placeholder"],
    emits: ["update:modelValue", "change"],
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makePlatforms = () => [
  { id: "1", name: "Netflix", slug: "netflix" },
  { id: "2", name: "HBO", slug: "hbo" },
  { id: "3", name: "Amazon Prime", slug: "amazon-prime" },
];

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountComponent = () =>
  mount(SearchPlatformsComponent, {
    global: {
      plugins: [createPinia()],
    },
  });

describe("SearchPlatformsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockLangStore.language = "en";
    mockFetchPlatforms.mockResolvedValue(makePlatforms());
  });

  // ── Initial load ────────────────────────────────────────────────────────────
  describe("initial load", () => {
    it("calls fetchPlatforms on mount", async () => {
      mountComponent();
      await flushPromises();
      expect(mockFetchPlatforms).toHaveBeenCalledTimes(1);
    });

    it("renders the MultiSelect", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='multiselect']").exists()).toBe(true);
    });

    it("passes the fetched platforms as options", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("options")).toEqual(makePlatforms());
    });
  });

  // ── Loading state ───────────────────────────────────────────────────────────
  describe("loading state", () => {
    it("sets loading and disabled to true while fetching", async () => {
      mockFetchPlatforms.mockReturnValue(new Promise(() => {}));
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("loading")).toBe(true);
      expect(ms.props("disabled")).toBe(true);
    });

    it("shows the loading placeholder while fetching", async () => {
      mockFetchPlatforms.mockReturnValue(new Promise(() => {}));
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("placeholder")).toBe("loading");
    });

    it("sets loading to false after fetch resolves", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("loading")).toBe(false);
      expect(ms.props("disabled")).toBe(false);
    });

    it("shows the platforms placeholder after fetch resolves", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("placeholder")).toBe("components.searchPlatforms.platforms");
    });
  });

  // ── Query sync ──────────────────────────────────────────────────────────────
  describe("query sync", () => {
    it("pre-selects platforms matching route.query.genres on mount", async () => {
      mockRoute.query = { platforms: "netflix" };
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("modelValue")).toEqual([
        { id: "1", name: "Netflix", slug: "netflix" },
      ]);
    });

    it("pre-selects multiple platforms when route.query.platforms is an array", async () => {
      mockRoute.query = { platforms: ["hbo", "amazon-prime"] };
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("modelValue")).toEqual([
        { id: "2", name: "HBO", slug: "hbo" },
        { id: "3", name: "Amazon Prime", slug: "amazon-prime" },
      ]);
    });

    it("does not pre-select platforms when route.query.platforms is absent", async () => {
      mockRoute.query = {};
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("modelValue")).toBeFalsy();
    });

    it("re-fetches platforms when route.query.platforms changes", async () => {
      mountComponent();
      await flushPromises();
      const callsBefore = mockFetchPlatforms.mock.calls.length;

      mockRoute.query = { platforms: "netflix" };
      await flushPromises();

      expect(mockFetchPlatforms.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // ── Emit ────────────────────────────────────────────────────────────────────
  describe("filterPlatforms emit", () => {
    it("emits filterPlatforms with the selected slugs when MultiSelect changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedPlatforms: any[] };
      vm.selectedPlatforms = [
        { id: "1", name: "Netflix", slug: "netflix" },
        { id: "2", name: "HBO", slug: "hbo" },
      ];
      await wrapper.findComponent({ name: "MultiSelect" }).trigger("change");

      expect(wrapper.emitted("filterPlatforms")?.[0]).toEqual([
        ["netflix", "hbo"],
      ]);
    });

    it("emits filterPlatforms with empty array when nothing is selected", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedPlatforms: any[] };
      vm.selectedPlatforms = [];
      await wrapper.findComponent({ name: "MultiSelect" }).trigger("change");

      expect(wrapper.emitted("filterPlatforms")?.[0]).toEqual([[]]);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("shows an error toast when fetchGenres fails with server message", async () => {
      mockFetchPlatforms.mockRejectedValue({
        response: { data: { message: "Server error" } },
      });
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Server error",
        }),
      );
    });

    it("shows the i18n fallback when fetchPlatforms fails without server message", async () => {
      mockFetchPlatforms.mockRejectedValue(new Error("network"));
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.searchPlatforms.getPlatformsError",
        }),
      );
    });

    it("sets loading to false after a failed fetch", async () => {
      mockFetchPlatforms.mockRejectedValue(new Error("fail"));
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("loading")).toBe(false);
    });

    it("does not crash if genres is undefined after a failed fetch", async () => {
      mockFetchPlatforms.mockRejectedValue(new Error("fail"));
      mockRoute.query = { genres: "action" };
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='multiselect']").exists()).toBe(true);
    });
  });
});
