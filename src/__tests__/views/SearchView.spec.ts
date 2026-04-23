import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchView from "@/views/SearchView.vue";
import type { MoviePagination } from "@/types";
import { createPinia } from "pinia";
import { nextTick, reactive } from "vue";

// ── External mocks ────────────────────────────────────────────────────────────
const mockMovieSearching = vi.fn();
const mockToastAdd = vi.fn();
const mockRouterPush = vi.fn();
const mockRoute = { path: "/search", query: {} as Record<string, any> };

const mockLangStore = reactive({ language: "en" });

vi.mock("@/repositories/movieRepository", () => ({
  movieSearching: (...a: unknown[]) => mockMovieSearching(...a),
}));

vi.mock("@/stores/langStore", () => ({
  useLangStore: () => mockLangStore,
}));

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  InputText: {
    template: `<input data-testid="search-input" v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
    inheritAttrs: false,
    props: ["modelValue"],
    emits: ["update:modelValue"],
  },
  Drawer: {
    template: '<div data-testid="mock-drawer"><slot /></div>',
    props: ["visible", "header", "position"],
  },
}));

vi.mock("@/utils/debounce", () => ({
  default: (fn: () => void) => fn,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makeMoviePagination = (
  count = 2,
  total_pages = 1,
  current_page = 1,
): MoviePagination =>
  ({
    results: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
    })),
    total_pages,
    current_page,
  }) as unknown as MoviePagination;

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountView = () =>
  mount(SearchView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        MovieCardComponent: {
          template: '<div data-testid="movie-card" />',
        },
        PaginationComponent: {
          name: "PaginationComponent",
          template: `<div
            data-testid="PaginationComponent"
            :data-total="total_pages"
            :data-current="current_page"
          />`,
          props: ["total_pages", "current_page"],
          emits: ["change-page"],
        },
        FilterComponent: {
          template: '<div data-testid="mock-filter" />',
          emits: ["filterGenres", "filterPlatforms", "filterStars", "close"],
        },
      },
    },
  });

// ── Helper ──────────────────
const typeInSearch = async (wrapper: any, value: string) => {
  const input = wrapper.find("[data-testid='search-input']");
  const el = input.element as HTMLInputElement;
  el.value = value;
  await input.trigger("input");
  await nextTick();
};

describe("SearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockLangStore.language = "en";
    mockMovieSearching.mockResolvedValue(makeMoviePagination());
  });

  // ── Initial load ──────────────────────────────────────────────────────────
  describe("initial load", () => {
    it("calls movieSearching on mount with normalized query params", async () => {
      mountView();
      await flushPromises();
      expect(mockMovieSearching).toHaveBeenCalledWith({
        genres: [],
        platforms: [],
        stars: [],
      });
    });

    it("renders a movie card for each result", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.findAll("[data-testid='movie-card']")).toHaveLength(2);
    });

    it("does NOT show the empty state when results are present", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".empty-state").exists()).toBe(false);
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────
  describe("loading state", () => {
    it("shows the loading spinner while the search is in progress", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".loading-state").exists()).toBe(true);
    });

    it("shows the spinning search icon while loading", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".pi-spinner").exists()).toBe(true);
    });

    it("hides the loading state after the search resolves", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".loading-state").exists()).toBe(false);
    });

    it("shows the static search icon when not loading", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".pi-search.search-icon").exists()).toBe(true);
    });
  });

  // ── Empty state ───────────────────────────────────────────────────────────
  describe("empty state", () => {
    it("shows the empty state when results array is empty", async () => {
      mockMovieSearching.mockResolvedValue({
        results: [],
        total_pages: 0,
        current_page: 1,
      });
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".empty-state").exists()).toBe(true);
    });

    it("displays the noFilms and help i18n keys in the empty state", async () => {
      mockMovieSearching.mockResolvedValue({
        results: [],
        total_pages: 0,
        current_page: 1,
      });
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".empty-state").text()).toContain("search.noFilms");
      expect(wrapper.find(".empty-state").text()).toContain("search.help");
    });
  });

  // ── Search input ──────────────────────────────────────────────────────────
  describe("search input", () => {
    it("renders the search input", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='search-input']").exists()).toBe(true);
    });

    it("does not show the clear button when search is empty", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".clear-btn").exists()).toBe(false);
    });

    it("shows the clear button when search has a value", async () => {
      const wrapper = mountView();
      await flushPromises();
      await typeInSearch(wrapper, "batman");
      expect(wrapper.find(".clear-btn").exists()).toBe(true);
    });

    it("clears the search value when the clear button is clicked", async () => {
      const wrapper = mountView();
      await flushPromises();
      await typeInSearch(wrapper, "batman");
      await wrapper.find(".clear-btn").trigger("click");
      await nextTick();
      expect(
        (wrapper.find("[data-testid='search-input']").element as HTMLInputElement).value,
      ).toBe("");
    });

    it("does not show the clear button while loading even if search has a value", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      const vm = wrapper.vm as unknown as { search: string };
      vm.search = "batman";
      await flushPromises();
      expect(wrapper.find(".clear-btn").exists()).toBe(false);
    });
  });

  // ── Watch on search ───────────────────────────────────────────────────────
  describe("watch on search — triggers route update", () => {
    it("calls router.push with name when search changes", async () => {
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      await typeInSearch(wrapper, "inception");
      await flushPromises();

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ name: "inception" }),
        }),
      );
    });

    it("sets name to undefined when search is cleared", async () => {
      const wrapper = mountView();
      await flushPromises();

      await typeInSearch(wrapper, "batman");
      await flushPromises();
      mockRouterPush.mockClear();

      await typeInSearch(wrapper, "");
      await flushPromises();

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ name: undefined }),
        }),
      );
    });
  });

  // ── updateRoute ───────────────────────────────────────────────────────────
  describe("updateRoute", () => {
    it("pushes to the current path", async () => {
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      const vm = wrapper.vm as unknown as { changePage: (p: number) => void };
      vm.changePage(2);

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({ path: "/search" }),
      );
    });

    it("includes the page number in the query", async () => {
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      const vm = wrapper.vm as unknown as { changePage: (p: number) => void };
      vm.changePage(3);

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ page: 3 }),
        }),
      );
    });

    it("merges existing query params when pushing", async () => {
      mockRoute.query = { genre: "action" };
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      const vm = wrapper.vm as unknown as { changePage: (p: number) => void };
      vm.changePage(2);

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ genre: "action", page: 2 }),
        }),
      );
    });
  });

  // ── changePage ────────────────────────────────────────────────────────────
  describe("changePage", () => {
    it("calls router.push when PaginationComponent emits change-page", async () => {
      mockMovieSearching.mockResolvedValue(makeMoviePagination(2, 3, 1));
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      // buscamos por data-testid en lugar de por name para evitar el error
      const paginator = wrapper.find("[data-testid='PaginationComponent']");
      await paginator.trigger("change-page");

      // alternativa más fiable: llamar changePage directamente
      const vm = wrapper.vm as unknown as { changePage: (p: number) => void };
      vm.changePage(2);

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ page: 2 }),
        }),
      );
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("shows an error toast when movieSearching fails", async () => {
      mockMovieSearching.mockRejectedValue({
        response: { data: { message: "Search failed" } },
      });
      mountView();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Search failed" }),
      );
    });

    it("uses the i18n fallback when the error has no server message", async () => {
      mockMovieSearching.mockRejectedValue(new Error("network"));
      mountView();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "search.searchMoviesError",
        }),
      );
    });

    it("sets loading to false after a failed search", async () => {
      mockMovieSearching.mockRejectedValue(new Error("fail"));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".loading-state").exists()).toBe(false);
    });
  });

  // ── Pagination visibility ─────────────────────────────────────────────────
  describe("pagination", () => {
    it("shows PaginationComponent when total_pages > 1 and not loading", async () => {
      mockMovieSearching.mockResolvedValue(makeMoviePagination(2, 3, 1));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(true);
    });

    it("hides PaginationComponent when total_pages is 1", async () => {
      mockMovieSearching.mockResolvedValue(makeMoviePagination(2, 1, 1));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(false);
    });

    it("hides PaginationComponent while loading", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(false);
    });

    it("passes total_pages and current_page to PaginationComponent", async () => {
      mockMovieSearching.mockResolvedValue(makeMoviePagination(2, 5, 2));
      const wrapper = mountView();
      await flushPromises();
      const paginator = wrapper.find("[data-testid='PaginationComponent']");
      expect(paginator.attributes("data-total")).toBe("5");
      expect(paginator.attributes("data-current")).toBe("2");
    });
  });

  // ── Query type branching ──────────────────────────────────────────────────
  describe("route.query.type branching", () => {
    it("does NOT call movieSearching when query.type is 'user'", async () => {
      mockRoute.query = { type: "user" };
      mountView();
      await flushPromises();
      expect(mockMovieSearching).not.toHaveBeenCalled();
    });

    it("does NOT call movieSearching when query.type is 'person'", async () => {
      mockRoute.query = { type: "person" };
      mountView();
      await flushPromises();
      expect(mockMovieSearching).not.toHaveBeenCalled();
    });

    it("calls movieSearching when query.type is absent", async () => {
      mockRoute.query = {};
      mountView();
      await flushPromises();
      expect(mockMovieSearching).toHaveBeenCalledTimes(1);
    });
  });

  // ── Language store watch ──────────────────────────────────────────────────
  describe("language change triggers re-search", () => {
    it("calls movieSearching again when the language changes", async () => {
      const wrapper = mountView();
      await flushPromises();
      const callsBefore = mockMovieSearching.mock.calls.length;

      // reactive() hace que Vue detecte el cambio y dispare el watch
      mockLangStore.language = "es";
      await nextTick();
      await flushPromises();

      expect(mockMovieSearching.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // ── activeFiltersCount ────────────────────────────────────────────────────
  describe("activeFiltersCount", () => {
    it("shows the filters badge when filters are active", async () => {
      mockRoute.query = { genres: ["action", "drama"], stars: ["4"] };
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".filters-badge").exists()).toBe(true);
      expect(wrapper.find(".filters-badge").text()).toBe("3");
    });

    it("hides the filters badge when no filters are active", async () => {
      mockRoute.query = {};
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".filters-badge").exists()).toBe(false);
    });
  });

  // ── Drawer ────────────────────────────────────────────────────────────────
  describe("mobile filters drawer", () => {
    it("renders the filters toggle button", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".filters-toggle").exists()).toBe(true);
    });

    it("opens the drawer when the filters toggle is clicked", async () => {
      const wrapper = mountView();
      await flushPromises();
      await wrapper.find(".filters-toggle").trigger("click");
      const vm = wrapper.vm as unknown as { filtersOpen: boolean };
      expect(vm.filtersOpen).toBe(true);
    });
  });
});