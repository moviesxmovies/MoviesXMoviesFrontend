import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import {
  completeFriendRequest,
  removeFriend,
  userSearching,
} from "@/repositories/userRepository";
import SearchUsersView from "@/views/SearchUsersView.vue";
import type { Pagination, User } from "@/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/components/friendWithFollow.vue", () => ({
  default: {
    name: "FriendWithFollow",
    template: '<div data-testid="friend-component" />',
    props: ["user", "isSelfUser", "onAddFriend", "onRemoveFriend", "onRemovePending"],
  },
}));

vi.mock("@/components/paginationComponent.vue", () => ({
  default: {
    name: "PaginationComponent",
    template: '<div data-testid="pagination-component" />',
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
  },
}));

vi.mock("@/repositories/userRepository", () => ({
  userSearching: vi.fn(),
  completeFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
}));

const mockToastAdd = vi.fn();
const mockConfirmRequire = vi.fn();

vi.mock("primevue", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useToast: vi.fn(() => ({ add: mockToastAdd })),
    useConfirm: vi.fn(() => ({ require: mockConfirmRequire })),
    Skeleton: { template: '<div class="skeleton-mock" />' },
    ConfirmDialog: { template: '<div data-testid="ConfirmDialog" />' },
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

// ── Fixtures ──────────────────────────────────────────────────────────────────

const emptyPagination: Pagination<User> = {
  results: [],
  total_pages: 1,
  current_page: 1,
  count: 0,
};

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: "alice",
  email: "alice@example.com",
  friendship: { is_friend: false, status: null },
  ...overrides,
} as User);

const createWrapper = () =>
  mount(SearchUsersView, {
    global: {
      stubs: { teleport: true },
      mocks: { $t: (key: string) => key },
    },
  });

// Helper: get the props passed to the nth FriendWithFollow instance
const getFriendProps = (wrapper: ReturnType<typeof createWrapper>, index = 0) =>
  wrapper.findAllComponents({ name: "FriendWithFollow" })[index].props();

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SearchUsersView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userSearching).mockResolvedValue(emptyPagination);
    Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
  });

  // ── initial render and states ───────────────────────────────────────────────

  describe("initial render and states", () => {
    it("shows loading state while fetching", () => {
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

    it("renders a FriendWithFollow for each user result", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [makeUser({ id: 1, username: "alice" }), makeUser({ id: 2, username: "bob" })],
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.findAll('[data-testid="friend-component"]')).toHaveLength(2);
    });

    it("renders ConfirmDialog when there are results", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [makeUser()],
      });
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find('[data-testid="ConfirmDialog"]').exists()).toBe(true);
    });
  });

  // ── search logic ────────────────────────────────────────────────────────────

  describe("search logic (userSearching)", () => {
    it("calls userSearching with params from the route query", async () => {
      mockRouteQuery.name = "alice";
      mockRouteQuery.page = "1";
      createWrapper();
      await flushPromises();
      expect(vi.mocked(userSearching)).toHaveBeenCalledWith({ name: "alice", page: "1" });
    });

    it("displays error toast on repository rejection", async () => {
      vi.mocked(userSearching).mockRejectedValue({
        response: { data: { message: "Error de red" } },
      });
      createWrapper();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Error de red" }),
      );
    });

    it("uses fallback translation when no specific message is provided", async () => {
      vi.mocked(userSearching).mockRejectedValue({});
      createWrapper();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ detail: "search.searchUsersError" }),
      );
    });
  });

  // ── navigation and pagination ───────────────────────────────────────────────

  describe("navigation and pagination", () => {
    it("hides pagination when results fit in one page", async () => {
      const wrapper = createWrapper();
      await flushPromises();
      expect(wrapper.find('[data-testid="pagination-component"]').exists()).toBe(false);
    });

    it("shows pagination and triggers route update on page change", async () => {
      vi.mocked(userSearching).mockResolvedValue({
        ...emptyPagination,
        results: [makeUser()],
        total_pages: 5,
        current_page: 1,
      });
      const wrapper = createWrapper();
      await flushPromises();

      const pagination = wrapper.getComponent('[data-testid="PaginationComponent"]');
      await pagination.vm.$emit("change-page", 2);

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ page: 2 }) }),
      );
    });
  });

  // ── handleFriendRequest (accept) ────────────────────────────────────────────

  describe("handleFriendRequest — accept", () => {
    it("calls completeFriendRequest with username and accept=true", async () => {
      const user = makeUser();
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onAddFriend();
      await flushPromises();

      expect(completeFriendRequest).toHaveBeenCalledWith(user.username, true);
    });

    it("updates friendship to pending after accepting", async () => {
      const user = makeUser();
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onAddFriend();
      await flushPromises();

      expect(user.friendship).toEqual({ is_friend: false, status: "P" });
    });

    it("shows success toast after accepting", async () => {
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [makeUser()] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onAddFriend();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", detail: "user.friendRequestSent" }),
      );
    });

    it("shows error toast when completeFriendRequest throws", async () => {
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [makeUser()] });
      vi.mocked(completeFriendRequest).mockRejectedValue({ translatedMessage: "Network error" });

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onAddFriend();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Network error" }),
      );
    });
  });

  // ── removeFrienshipModal ────────────────────────────────────────────────────

  describe("removeFrienshipModal", () => {
    it("calls confirm.require when onRemoveFriend is triggered", async () => {
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [makeUser()] });

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();

      expect(mockConfirmRequire).toHaveBeenCalledOnce();
      expect(mockConfirmRequire).toHaveBeenCalledWith(
        expect.objectContaining({ message: "search.confirmRemoveFriend" }),
      );
    });

    it("calls confirm.require when onRemovePending is triggered", async () => {
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [makeUser()] });

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemovePending();

      expect(mockConfirmRequire).toHaveBeenCalledOnce();
    });

    // accept callback — already_friends: true → removeFriend
    it("calls removeFriend when confirmed on an existing friend", async () => {
      const user = makeUser({ friendship: { is_friend: true, status: "A" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(removeFriend).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();
      await flushPromises();

      expect(removeFriend).toHaveBeenCalledWith(user.username);
    });

    it("clears friendship after removeFriend succeeds", async () => {
      const user = makeUser({ friendship: { is_friend: true, status: "A" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(removeFriend).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();
      await flushPromises();

      expect(user.friendship).toEqual({ is_friend: false, status: null });
    });

    it("shows success toast after removing a friend", async () => {
      const user = makeUser({ friendship: { is_friend: true, status: "A" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(removeFriend).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", detail: "user.friendRemoved" }),
      );
    });

    it("shows error toast when removeFriend throws", async () => {
      const user = makeUser({ friendship: { is_friend: true, status: "A" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(removeFriend).mockRejectedValue({ translatedMessage: "Remove failed" });

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Remove failed" }),
      );
    });

    // accept callback — already_friends: false → completeFriendRequest(accept=false)
    it("calls completeFriendRequest with accept=false when declining a pending request", async () => {
      const user = makeUser({ friendship: { is_friend: false, status: "P" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemovePending();
      await flushPromises();

      expect(completeFriendRequest).toHaveBeenCalledWith(user.username, false);
    });

    it("clears friendship after declining a pending request", async () => {
      const user = makeUser({ friendship: { is_friend: false, status: "P" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemovePending();
      await flushPromises();

      expect(user.friendship).toEqual({ is_friend: false, status: null });
    });

    it("shows declined toast after declining a pending request", async () => {
      const user = makeUser({ friendship: { is_friend: false, status: "P" } });
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [user] });
      vi.mocked(completeFriendRequest).mockResolvedValue(undefined);

      mockConfirmRequire.mockImplementationOnce(({ accept }) => accept());

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemovePending();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", detail: "user.friendRequestDeclined" }),
      );
    });

    it("does not call any API when the modal is rejected", async () => {
      vi.mocked(userSearching).mockResolvedValue({ ...emptyPagination, results: [makeUser()] });

      // reject callback — do nothing
      mockConfirmRequire.mockImplementationOnce(() => {});

      const wrapper = createWrapper();
      await flushPromises();

      await getFriendProps(wrapper).onRemoveFriend();
      await flushPromises();

      expect(removeFriend).not.toHaveBeenCalled();
      expect(completeFriendRequest).not.toHaveBeenCalled();
    });
  });
});