import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import SearchMovieView from "@/views/SearchMovieView.vue";
import type { Movie, Pagination } from "@/types";
import { movieSearching } from "@/repositories/movieRepository";

// -- Mocks --

vi.mock("@/components/filterComponent.vue", () => ({
  default: { template: '<div data-testid="filter-component" />' },
}));
vi.mock("@/components/movieCardComponent.vue", () => ({
  default: {
    template: `
      <div v-if="loading" data-testid="movie-card-skeleton" />
      <div v-else data-testid="movie-card" />
    `,
    props: ["movie", "loading"],
  },
}));
vi.mock("@/components/paginationComponent.vue", () => ({
  default: {
    template: '<div data-testid="pagination-component" />',
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
  },
}));

vi.mock("@/repositories/movieRepository", () => ({
  movieSearching: vi.fn(),
}));

const mockToastAdd = vi.fn();
vi.mock("primevue", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: vi.fn(() => ({ add: mockToastAdd })),
    Drawer: { template: "<div><slot /></div>" },
  };
});

const mockLangStore = { language: "en" };
vi.mock("@/stores/langStore", () => ({
  useLangStore: () => mockLangStore,
}));

const mockPush = vi.fn();
const mockRouteQuery: Record<string, any> = {};

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: vi.fn(() => ({ push: mockPush })),
    useRoute: vi.fn(() => ({ query: mockRouteQuery, path: "/search" })),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// -- Helpers --

const emptyPagination: Pagination<Movie> = {
  results: [],
  total_pages: 1,
  current_page: 1,
};

const createWrapper = () =>
  mount(SearchMovieView, {
    global: {
      stubs: { teleport: true },
      mocks: { $t: (key: string) => key },
    },
  });

// -- Tests --
describe("SearchMovieView", () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockToastAdd.mockClear();
    vi.mocked(movieSearching).mockClear();
    vi.mocked(movieSearching).mockResolvedValue(emptyPagination);
    Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
  });

  describe("initial render", () => {
    it("shows skeleton cards while fetching", async () => {
      vi.mocked(movieSearching).mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[data-testid="movie-card"]').exists()).toBe(false);
    });

    it("shows empty state when no results", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find(".empty-state").exists()).toBe(true);
    });

    it("renders movie cards when results exist", async () => {
      vi.mocked(movieSearching).mockResolvedValue({
        ...emptyPagination,
        results: [
          { id: 1, title: "Inception" },
          { id: 2, title: "Tenet" },
        ],
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.findAll('[data-testid="movie-card"]')).toHaveLength(2);
    });

    it("renders filter component in sidebar", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find('[data-testid="filter-component"]').exists()).toBe(
        true,
      );
    });
  });

  describe("pagination", () => {
    it("hides pagination when only one page", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(
        wrapper.find('[data-testid="pagination-component"]').exists(),
      ).toBe(false);
    });
  });

  describe("movieSearching", () => {
    it("calls movieSearching on mount", async () => {
      createWrapper();
      await vi.waitFor(() =>
        expect(vi.mocked(movieSearching)).toHaveBeenCalledTimes(1),
      );
    });

    it("passes normalized query params to movieSearching", async () => {
      mockRouteQuery.genres = "action";
      mockRouteQuery.stars = "5";
      createWrapper();

      await vi.waitFor(() =>
        expect(vi.mocked(movieSearching)).toHaveBeenCalledWith(
          expect.objectContaining({
            genres: ["action"],
            stars: ["5"],
          }),
        ),
      );
    });

    it("shows toast on search error", async () => {
      vi.mocked(movieSearching).mockRejectedValue({
        response: { data: { message: "Server error" } },
      });
      createWrapper();

      await vi.waitFor(() =>
        expect(mockToastAdd).toHaveBeenCalledWith(
          expect.objectContaining({ severity: "error" }),
        ),
      );
    });
  });

  describe("filters", () => {
    it("updates route when genre filter is applied", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const filter = wrapper.findComponent({ name: "FilterComponent" });
      await filter.vm.$emit("filter-genres", ["action", "drama"]);

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ genres: ["action", "drama"] }),
        }),
      );
    });

    it("updates route when platform filter is applied", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const filter = wrapper.findComponent({ name: "FilterComponent" });
      await filter.vm.$emit("filter-platforms", ["netflix"]);

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ platforms: ["netflix"] }),
        }),
      );
    });

    it("toggles marked_unseen to true when not set", async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const filter = wrapper.findComponent({ name: "FilterComponent" });
      await filter.vm.$emit("filter-unseen", "true");

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ marked_unseen: "true" }),
        }),
      );
    });

    it("removes marked_unseen from route when toggled off", async () => {
      mockRouteQuery.marked_unseen = "true";
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      const filter = wrapper.findComponent({ name: "FilterComponent" });
      await filter.vm.$emit("filter-unseen", "false");

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ marked_unseen: undefined }),
        }),
      );
    });
  });

  describe("activeFiltersCount", () => {
    it("returns 0 when no filters are active", async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).activeFiltersCount).toBe(0);
    });

    it("counts each active filter correctly", async () => {
      mockRouteQuery.genres = ["action", "drama"];
      mockRouteQuery.stars = "5";
      mockRouteQuery.marked_unseen = "true";

      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      // 2 genres + 1 star + 1 marked_unseen = 4
      expect((wrapper.vm as any).activeFiltersCount).toBe(4);
    });

    it("shows filters badge when filters are active", async () => {
      mockRouteQuery.genres = "action";
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".filters-badge").exists()).toBe(true);
    });

    it("hides filters badge when no filters are active", async () => {
      const wrapper = createWrapper();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".filters-badge").exists()).toBe(false);
    });
  });
});
