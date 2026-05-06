import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { userSearching } from "@/repositories/userRepository";
import SearchUsersView from "@/views/SearchUsersView.vue";
import type { Pagination, User } from "@/types";

// -- Mocks --

vi.mock("@/components/friendWithFollow.vue", () => ({
  default: {
    template: '<div data-testid="friend-component" />',
    props: ["user"],
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
    useRoute: vi.fn(() => ({ query: mockRouteQuery, path: "/search/users" })),
  };
});

// -- Helpers --

const emptyPagination: Pagination<User> = {
  results: [],
  total_pages: 1,
  current_page: 1,
  count: 0,
};

const createWrapper = () =>
  mount(SearchUsersView, {
    global: {
      stubs: { teleport: true },
      mocks: { $t: (key: string) => key },
    },
  });

// -- Tests --

describe("SearchUsersView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userSearching).mockResolvedValue(emptyPagination);
    Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
  });

  describe("initial render and states", () => {
    it("shows loading state while fetching", async () => {
      vi.mocked(userSearching).mockReturnValue(new Promise(() => {}));
      const wrapper = createWrapper();

      expect(wrapper.findAll(".skeleton-card")).toHaveLength(10);
    });

    it("shows empty state when no users are found", async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(".empty-title").exists()).toBe(true);
      expect(wrapper.find(".empty-icon").exists()).toBe(true);
      expect(wrapper.find(".empty-title").text()).toBe("search.empty");
    });

    it("renders a FriendComponent for each user result", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [
          { id: 1, username: "alice", email: "a@a.com" } as any,
          { id: 2, username: "bob", email: "b@b.com" } as any,
        ],
      });
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.findAll('[data-testid="friend-component"]')).toHaveLength(
        2,
      );
    });
  });

  describe("search logic (userSearching)", () => {
    it("calls userSearching with params from the route query", async () => {
      mockRouteQuery.name = "alice";
      mockRouteQuery.page = "1";

      createWrapper();
      await flushPromises();

      expect(vi.mocked(userSearching)).toHaveBeenCalledWith({
        name: "alice",
        page: "1",
      });
    });

    it("displays error toast on repository rejection", async () => {
      vi.mocked(userSearching).mockRejectedValue({
        response: { data: { message: "Error de red" } },
      });

      createWrapper();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "toast.error",
          detail: "Error de red",
        }),
      );
    });

    it("uses fallback translation error when no specific message is provided", async () => {
      vi.mocked(userSearching).mockRejectedValue({});

      createWrapper();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "search.searchUsersError",
        }),
      );
    });
  });

  describe("navigation and pagination", () => {
    it("hides pagination when results fit in one page", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        total_pages: 1,
      });
      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.find('[data-testid="PaginationComponent"]').exists(),
      ).toBe(false);
    });

    it("shows pagination and triggers route update on page change", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [{ id: 1, username: "alice" } as any],
        total_pages: 5,
        current_page: 1,
      });

      const wrapper = createWrapper();
      await flushPromises();

      expect(
        wrapper.find('[data-testid="PaginationComponent"]').exists(),
      ).toBe(true);

      const pagination = wrapper.getComponent(
        '[data-testid="PaginationComponent"]',
      );
      await pagination.vm.$emit("change-page", 2);

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ page: 2 }),
        }),
      );
    });
  });
});
