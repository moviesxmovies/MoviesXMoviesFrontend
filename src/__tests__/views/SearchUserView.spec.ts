import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { userSearching } from "@/repositories/userRepository";
import SearchUsersView from "@/views/SearchUsersView.vue";
import type { Pagination, User } from "@/types";

// -- Mocks --

vi.mock("@/components/friendComponent.vue", () => ({
  default: {
    template: '<div data-testid="friend-component" />',
    props: ["username"],
  },
}));

vi.mock("@/components/paginationComponent.vue", () => ({
  default: {
    template: '<div data-testid="pagination-component" />',
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
  },
}));

vi.mock("@/repositories/userRepository", () => ({
  userSearching: vi.fn(),
}));

vi.mock("primevue", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: vi.fn(() => ({ add: mockToastAdd })),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockRouteQuery: Record<string, any> = {};

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRoute: vi.fn(() => ({ query: mockRouteQuery })),
  };
});

// -- Helpers --

const mockToastAdd = vi.fn();

const emptyPagination: Pagination<User> = {
  results: [],
  total_pages: 1,
  current_page: 1,
};

const createWrapper = () =>
  mount(SearchUsersView, {
    global: {
      stubs: { teleport: true },
      mocks: { $t: (key: string) => key },
    },
  });

beforeEach(() => {
  mockToastAdd.mockClear();
  vi.mocked(userSearching).mockClear();
  vi.mocked(userSearching).mockResolvedValue(emptyPagination);
  Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
});

// -- Tests --

describe("SearchUsersView", () => {
  describe("initial render", () => {
    it("shows loading state while fetching", async () => {
      vi.mocked(userSearching).mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();
      expect(wrapper.find(".skeleton-card").exists()).toBe(true);
    });

    it("shows empty state when no results", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find(".empty-title").exists()).toBe(true);
      expect(wrapper.find(".empty-icon").exists()).toBe(true);
    });

    it("renders a FriendComponent for each user", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [
          { id: 1, username: "alice" },
          { id: 2, username: "bob" },
        ],
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.findAll('[data-testid="friend-component"]')).toHaveLength(2);
    });
  });

  describe("userSearching", () => {
    it("calls userSearching on mount", async () => {
      createWrapper();
      await flushPromises();
      expect(vi.mocked(userSearching)).toHaveBeenCalledTimes(1);
    });

    it("passes route query params to userSearching", async () => {
      mockRouteQuery.search_query = "alice";
      mockRouteQuery.page = "1";
      createWrapper();
      await flushPromises();
      expect(vi.mocked(userSearching)).toHaveBeenCalledWith(
        expect.objectContaining({ search_query: "alice", page: "1" }),
      );
    });

    it("shows toast on search error", async () => {
      vi.mocked(userSearching).mockRejectedValue({
        response: { data: { message: "Server error" } },
      });
      createWrapper();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" }),
      );
    });

    it("shows toast with fallback message when error has no response", async () => {
      vi.mocked(userSearching).mockRejectedValue({});
      createWrapper();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "search.searchUsersError",
        }),
      );
    });
  });

  describe("pagination", () => {
    it("hides pagination when only one page", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find('[data-testid="PaginationComponent"]').exists()).toBe(false);
    });

    it("shows pagination when more than one page", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        results: [{ id: 1, username: "alice" }],
        total_pages: 3,
        current_page: 1,
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find('[data-testid="PaginationComponent"]').exists()).toBe(true);
    });
  });
});