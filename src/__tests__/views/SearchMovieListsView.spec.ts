import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import SearchMovieListsView from "@/views/SearchMovieListsView.vue"; 
import { listSearching } from "@/repositories/listRepository";
import type { Pagination, MovieList } from "@/types";

// -- Mocks --

vi.mock("@/components/moviesListComponent.vue", () => ({
  default: {
    template: '<div data-testid="movie-list-component" />',
    props: ["movieList"],
  },
}));

vi.mock("@/components/paginationComponent.vue", () => ({
  default: {
    template: '<div data-testid="pagination-component" />',
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
  },
}));

vi.mock("@/repositories/listRepository", () => ({
  listSearching: vi.fn(),
}));

const mockToastAdd = vi.fn();
vi.mock("primevue", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useToast: vi.fn(() => ({ add: mockToastAdd })),
    Skeleton: { template: '<div class="skeleton-mock" />' },
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockPush = vi.fn();
const mockRouteQuery: Record<string, any> = {};

vi.mock("vue-router", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useRouter: vi.fn(() => ({ push: mockPush })),
    useRoute: vi.fn(() => ({ query: mockRouteQuery, path: "/search/lists" })),
  };
});

// -- Helpers --

const emptyPagination: Pagination<MovieList> = {
  results: [],
  total_pages: 1,
  current_page: 1,
  count: 0,
};

const createWrapper = () =>
  mount(SearchMovieListsView, {
    global: {
      stubs: { teleport: true },
      mocks: { $t: (key: string) => key },
    },
  });

// -- Tests --

describe("SearchMovieListsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listSearching).mockResolvedValue(emptyPagination);
    Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
  });

  describe("initial render and states", () => {
    it("shows skeleton loaders while fetching", async () => {
      // Devolvemos una promesa que no se resuelve inmediatamente
      vi.mocked(listSearching).mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      
      expect(wrapper.findAll(".skeleton-card")).toHaveLength(10);
      expect(wrapper.find(".movielist-grid").exists()).toBe(true);
    });

    it("shows empty state when no results are found", async () => {
      vi.mocked(listSearching).mockResolvedValue(emptyPagination);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(".empty-title").text()).toBe("search.empty");
      expect(wrapper.find(".empty-sub").text()).toBe("search.help");
      expect(wrapper.find(".pi-search").exists()).toBe(true);
    });

    it("renders MoviesListComponent for each result", async () => {
      vi.mocked(listSearching).mockResolvedValue({
        ...emptyPagination,
        results: [
          { id: 1, name: "Action Hits", description: "Best action", movies_count: 5 } as any,
          { id: 2, name: "Drama Night", description: "Sad movies", movies_count: 2 } as any,
        ],
      });
      
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAll('[data-testid="movie-list-component"]')).toHaveLength(2);
    });
  });

  describe("listSearching logic", () => {
    it("calls listSearching with parameters from route", async () => {
      mockRouteQuery.name = "thriller";
      mockRouteQuery.page = "2";
      
      createWrapper();
      await flushPromises();

      expect(vi.mocked(listSearching)).toHaveBeenCalledWith("thriller", 2);
    });

    it("calls listSearching with empty string if name is missing in query", async () => {
      createWrapper();
      await flushPromises();

      expect(vi.mocked(listSearching)).toHaveBeenCalledWith("", expect.anything());
    });

    it("shows error toast when listSearching fails", async () => {
      const errorMessage = "API Error";
      vi.mocked(listSearching).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      createWrapper();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "toast.error",
        detail: errorMessage,
      });
    });

    it("uses fallback error message when exception has no response data", async () => {
      vi.mocked(listSearching).mockRejectedValue(new Error("Network Error"));

      createWrapper();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "search.searchMovieListsError",
        })
      );
    });
  });

  describe("navigation and pagination", () => {
    it("updates route query when change-page is emitted", async () => {
      vi.mocked(listSearching).mockResolvedValue({
        ...emptyPagination,
        results: [{ id: 1, name: "List" } as any],
        total_pages: 5,
        current_page: 1,
      });

      const wrapper = createWrapper();
      await flushPromises();

      const pagination = wrapper.getComponent('[data-testid="PaginationComponent"]');
      await pagination.vm.$emit("change-page", 3);

      expect(mockPush).toHaveBeenCalledWith({
        path: "/search/lists",
        query: expect.objectContaining({ page: 3 }),
      });
    });

    it("hides pagination component if there is only one page", async () => {
      vi.mocked(listSearching).mockResolvedValue({
        ...emptyPagination,
        total_pages: 1,
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="PaginationComponent"]').exists()).toBe(false);
    });
  });
});