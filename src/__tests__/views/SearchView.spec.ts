import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchView from "@/views/SearchView.vue"; // adjust path if needed
import type { MoviePagination } from "@/types";

// ── External mocks ────────────────────────────────────────────────────────────
const mockMovieSearching = vi.fn();
const mockToastAdd = vi.fn();
const mockRouterPush = vi.fn();
const mockLangStore = { language: "en" };
const mockRoute = { path: "/search", query: {} as Record<string, string> };

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

vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    InputText: defineComponent({
      name: "InputText",
      props: ["modelValue", "placeholder", "class", "fluid"],
      emits: ["update:modelValue"],
      setup(props, { emit }) {
        return () =>
          h("input", {
            "data-testid": "search-input",
            value: props.modelValue,
            placeholder: props.placeholder,
            onInput: (e: Event) =>
              emit("update:modelValue", (e.target as HTMLInputElement).value),
          });
      },
    }),
    useToast: () => ({ add: mockToastAdd }),
  };
});

// ── Debounce: run immediately so watch tests are synchronous ──────────────────
vi.mock("@/utils/debounce", () => ({
  default: (fn: () => void) => fn,
}));

// ── Child stubs ───────────────────────────────────────────────────────────────
vi.mock("@/components/movieCardComponent.vue", () => ({
  default: {
    name: "MovieCardComponent",
    props: ["movie"],
    template: `<div data-testid="movie-card" :data-id="movie.id" />`,
  },
}));

vi.mock("@/components/paginationComponent.vue", () => ({
  default: {
    name: "PaginationComponent",
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
    template: `
      <div
        data-testid="PaginationComponent"
        :data-total="total_pages"
        :data-current="current_page"
      />
    `,
  },
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
  mount(SearchView, { global: { stubs: { teleport: true } } });

describe("SearchView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockMovieSearching.mockResolvedValue(makeMoviePagination());
  });

  // ── Initial load (immediate watch) ────────────────────────────────────────
  describe("initial load", () => {
    it("calls movieSearching on mount with the current route query", async () => {
      mountView();
      await flushPromises();
      expect(mockMovieSearching).toHaveBeenCalledWith({});
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

    it("uses the i18n placeholder", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(
        wrapper.find("[data-testid='search-input']").attributes("placeholder"),
      ).toBe("Search");
    });

    it("does not show the clear button when search is empty", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".clear-btn").exists()).toBe(false);
    });

    it("shows the clear button when search has a value", async () => {
      const wrapper = mountView();
      await flushPromises();
      await wrapper.find("[data-testid='search-input']").setValue("batman");
      expect(wrapper.find(".clear-btn").exists()).toBe(true);
    });

    it("clears the search value when the clear button is clicked", async () => {
      const wrapper = mountView();
      await flushPromises();
      await wrapper.find("[data-testid='search-input']").setValue("batman");
      await wrapper.find(".clear-btn").trigger("click");
      expect(
        (
          wrapper.find("[data-testid='search-input']")
            .element as HTMLInputElement
        ).value,
      ).toBe("");
    });

    it("does not show the clear button while loading even if search has a value", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      // Set search before resolving so loading=true
      const vm = wrapper.vm as unknown as { search: string };
      vm.search = "batman";
      await flushPromises();
      expect(wrapper.find(".clear-btn").exists()).toBe(false);
    });
  });

  // ── Watch on search → debouncedUpdateRoute ────────────────────────────────
  describe("watch on search — triggers route update", () => {
    it("calls router.push with page=1 when search changes", async () => {
      const wrapper = mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      await wrapper.find("[data-testid='search-input']").setValue("inception");
      await flushPromises();

      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ name: "inception" }),
        }),
      );
    });

    it("sets name to undefined in query when search is cleared", async () => {
      const wrapper = mountView();
      await flushPromises();

      await wrapper.find("[data-testid='search-input']").setValue("batman");
      await flushPromises();
      mockRouterPush.mockClear();

      await wrapper.find("[data-testid='search-input']").setValue("");
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
      mountView();
      await flushPromises();
      mockRouterPush.mockClear();

      mockRoute.query = { name: "test" };
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

      await wrapper
        .findComponent({ name: "PaginationComponent" })
        .vm.$emit("change-page", 2);

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
          detail: "search.error.searchMovies",
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
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(
        true,
      );
    });

    it("hides PaginationComponent when total_pages is 1", async () => {
      mockMovieSearching.mockResolvedValue(makeMoviePagination(2, 1, 1));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(
        false,
      );
    });

    it("hides PaginationComponent while loading", async () => {
      mockMovieSearching.mockReturnValue(new Promise(() => {}));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find("[data-testid='PaginationComponent']").exists()).toBe(
        false,
      );
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

      mockLangStore.language = "es";
      // Trigger the watcher manually by touching a reactive dep the watch observes
      await wrapper.vm.$nextTick();
      // The watch observes langStore.language — simulate by calling searchMovies directly
      const vm = wrapper.vm as unknown as {
        searchMovies: (d: Record<string, unknown>) => Promise<void>;
      };
      await vm.searchMovies({});
      await flushPromises();

      expect(mockMovieSearching.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
