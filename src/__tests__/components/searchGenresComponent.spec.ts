import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchGenresComponent from "@/components/searchGenresComponent.vue";
import { createPinia } from "pinia";
import { reactive } from "vue";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockFetchGenres = vi.fn();
const mockToastAdd = vi.fn();
const mockLangStore = reactive({ language: "en" });
const mockRoute = reactive({ query: {} as Record<string, any> });

vi.mock("@/repositories/genreRepository", () => ({
  fetchGenres: () => mockFetchGenres(),
}));

vi.mock("@/stores/langStore", () => ({
  useLangStore: () => mockLangStore,
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
const makeGenres = () => [
  { id: 1, name: "Action", slug: "action" },
  { id: 2, name: "Drama", slug: "drama" },
  { id: 3, name: "Comedy", slug: "comedy" },
];

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountComponent = () =>
  mount(SearchGenresComponent, {
    global: {
      plugins: [createPinia()],
    },
  });

describe("SearchGenresComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockLangStore.language = "en";
    mockFetchGenres.mockResolvedValue(makeGenres());
  });

  // ── Initial load ────────────────────────────────────────────────────────────
  describe("initial load", () => {
    it("calls fetchGenres on mount", async () => {
      mountComponent();
      await flushPromises();
      expect(mockFetchGenres).toHaveBeenCalledTimes(1);
    });

    it("renders the MultiSelect", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='multiselect']").exists()).toBe(true);
    });

    it("passes the fetched genres as options", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("options")).toEqual(makeGenres());
    });
  });

  // ── Loading state ───────────────────────────────────────────────────────────
  describe("loading state", () => {
    it("sets loading and disabled to true while fetching", async () => {
      mockFetchGenres.mockReturnValue(new Promise(() => {}));
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("loading")).toBe(true);
      expect(ms.props("disabled")).toBe(true);
    });

    it("shows the loading placeholder while fetching", async () => {
      mockFetchGenres.mockReturnValue(new Promise(() => {}));
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

    it("shows the genres placeholder after fetch resolves", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("placeholder")).toBe("components.searchGenres.genres");
    });
  });

  // ── Query sync ──────────────────────────────────────────────────────────────
  describe("query sync", () => {
    it("pre-selects genres matching route.query.genres on mount", async () => {
      mockRoute.query = { genres: "action" };
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("modelValue")).toEqual([
        { id: 1, name: "Action", slug: "action" },
      ]);
    });

    it("pre-selects multiple genres when route.query.genres is an array", async () => {
      mockRoute.query = { genres: ["action", "drama"] };
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("modelValue")).toEqual([
        { id: 1, name: "Action", slug: "action" },
        { id: 2, name: "Drama", slug: "drama" },
      ]);
    });

    it("does not pre-select genres when route.query.genres is absent", async () => {
      mockRoute.query = {};
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      // selectedGenres queda undefined cuando no hay query
      expect(ms.props("modelValue")).toBeFalsy();
    });

    it("re-fetches genres when route.query.genres changes", async () => {
      mountComponent();
      await flushPromises();
      const callsBefore = mockFetchGenres.mock.calls.length;

      mockRoute.query = { genres: "drama" };
      await flushPromises();

      expect(mockFetchGenres.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("re-fetches genres when language changes", async () => {
      mountComponent();
      await flushPromises();
      const callsBefore = mockFetchGenres.mock.calls.length;

      mockLangStore.language = "es";
      await flushPromises();

      expect(mockFetchGenres.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // ── Emit ────────────────────────────────────────────────────────────────────
  describe("filterGenres emit", () => {
    it("emits filterGenres with the selected slugs when MultiSelect changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      // simula selección manual poniendo selectedGenres en el vm
      const vm = wrapper.vm as unknown as { selectedGenres: any[] };
      vm.selectedGenres = [
        { id: 1, name: "Action", slug: "action" },
        { id: 2, name: "Drama", slug: "drama" },
      ];
      await wrapper.findComponent({ name: "MultiSelect" }).trigger("change");

      expect(wrapper.emitted("filterGenres")?.[0]).toEqual([
        ["action", "drama"],
      ]);
    });

    it("emits filterGenres with empty array when nothing is selected", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedGenres: any[] };
      vm.selectedGenres = [];
      await wrapper.findComponent({ name: "MultiSelect" }).trigger("change");

      expect(wrapper.emitted("filterGenres")?.[0]).toEqual([[]]);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("shows an error toast when fetchGenres fails with server message", async () => {
      mockFetchGenres.mockRejectedValue({
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

    it("shows the i18n fallback when fetchGenres fails without server message", async () => {
      mockFetchGenres.mockRejectedValue(new Error("network"));
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.searchGenres.getGenresError",
        }),
      );
    });

    it("sets loading to false after a failed fetch", async () => {
      mockFetchGenres.mockRejectedValue(new Error("fail"));
      const wrapper = mountComponent();
      await flushPromises();
      const ms = wrapper.findComponent({ name: "MultiSelect" });
      expect(ms.props("loading")).toBe(false);
    });

    it("does not crash if genres is undefined after a failed fetch", async () => {
      mockFetchGenres.mockRejectedValue(new Error("fail"));
      mockRoute.query = { genres: "action" };
      const wrapper = mountComponent();
      await flushPromises();
      // no debe lanzar error aunque genres.value sea undefined
      expect(wrapper.find("[data-testid='multiselect']").exists()).toBe(true);
    });
  });
});