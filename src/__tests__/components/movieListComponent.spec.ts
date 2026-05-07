import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MovieListCard from "@/components/moviesListComponent.vue";

// ─── Hoisted mocks (declared before vi.mock factories run) ────────────────────

const { mockToastAdd, mockGoToMovieList, mockApiGet, mockFormatRelativeTime } =
  vi.hoisted(() => ({
    mockToastAdd: vi.fn(),
    mockGoToMovieList: vi.fn(),
    mockApiGet: vi.fn(),
    mockFormatRelativeTime: vi.fn((date: string) => `relative(${date})`),
  }));

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/composables/useAPI", () => ({
  api: { get: mockApiGet },
}));

vi.mock("@/composables/useDate", () => ({
  useDate: () => ({ formatRelativeTime: mockFormatRelativeTime }),
}));

vi.mock("@/utils/goTo", () => ({
  goToMovieList: mockGoToMovieList,
}));

vi.mock("primevue", () => ({
  useToast: () => ({ add: mockToastAdd }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, args?: any) =>
      args !== undefined ? `${key}(${JSON.stringify(args)})` : key,
  }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseMovieList = {
  name: "My List",
  description: "A great list",
  privacity: "P",
  user: "/api/users/1/",
  slug: "my-list",
  movies: [{ id: 1 }, { id: 2 }, { id: 3 }],
  updated_at: "2024-06-01T12:00:00Z",
};

function mountComponent(movieList = baseMovieList) {
  return mount(MovieListCard, {
    props: { movieList },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MovieListCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: { username: "johndoe" } });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Rendering", () => {
    it("renders the component", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".movie-list").exists()).toBe(true);
    });

    it("displays the list name", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".movie-list-name").text()).toBe("My List");
    });

    it("displays the description when provided", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".movie-list-description").text()).toBe("A great list");
    });

    it("hides the description when not provided", () => {
      const wrapper = mountComponent({ ...baseMovieList, description: "" });
      expect(wrapper.find(".movie-list-description").exists()).toBe(false);
    });

    it("displays movie count via i18n key", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".movie-list-count").text()).toBe(
        `components.movieList.moviesCount({"count":3})`,
      );
    });

    it("displays the relative date from formatRelativeTime", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".movie-list-date").text()).toBe(
        "relative(2024-06-01T12:00:00Z)",
      );
    });

    it("calls formatRelativeTime with updated_at", () => {
      mountComponent();
      expect(mockFormatRelativeTime).toHaveBeenCalledWith("2024-06-01T12:00:00Z");
    });
  });

  // ── Privacy badge ──────────────────────────────────────────────────────────

  describe("Privacy badge", () => {
    it.each([
      ["P", "badge-public", "pi-globe"],
      ["R", "badge-private", "pi-lock"],
      ["F", "badge-friends", "pi-users"],
    ])(
      "applies correct badge for privacity '%s'",
      (privacity, badgeClass, iconClass) => {
        const wrapper = mountComponent({ ...baseMovieList, privacity });
        const badge = wrapper.find(".privacy-badge");
        expect(badge.classes()).toContain(badgeClass);
        expect(badge.find("i").classes()).toContain(iconClass);
      },
    );

    it("falls back to private badge for unknown privacity", () => {
      const wrapper = mountComponent({ ...baseMovieList, privacity: "X" });
      expect(wrapper.find(".privacy-badge").classes()).toContain("badge-private");
    });

    it("renders the privacy badge", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".privacy-badge").exists()).toBe(true);
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe("Navigation on click", () => {
    it("calls api.get with the user URL on click", async () => {
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockApiGet).toHaveBeenCalledWith("/api/users/1/");
    });

    it("calls goToMovieList with username and slug on click", async () => {
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockGoToMovieList).toHaveBeenCalledWith("johndoe", "my-list");
    });

    it("does not call goToMovieList when api.get fails", async () => {
      mockApiGet.mockRejectedValue({
        response: { data: { message: "Not found" } },
      });
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockGoToMovieList).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("shows a toast error when api.get fails", async () => {
      mockApiGet.mockRejectedValue({
        response: { data: { message: "Server error" } },
      });
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "error",
        detail: "Server error",
      });
    });

    it("falls back to i18n key when error has no message", async () => {
      mockApiGet.mockRejectedValue({});
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "error",
        detail: "components.movieList.errorDetail",
      });
    });

    it("does not show a toast on successful navigation", async () => {
      const wrapper = mountComponent();
      await wrapper.find(".movie-list").trigger("click");
      await new Promise((r) => setTimeout(r, 0));
      expect(mockToastAdd).not.toHaveBeenCalled();
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe("Edge cases", () => {
    it("renders correctly with zero movies", () => {
      const wrapper = mountComponent({ ...baseMovieList, movies: [] });
      expect(wrapper.find(".movie-list-count").text()).toBe(
        `components.movieList.moviesCount({"count":0})`,
      );
    });

    it("renders correctly with a single movie", () => {
      const wrapper = mountComponent({ ...baseMovieList, movies: [{ id: 1 }] });
      expect(wrapper.find(".movie-list-count").text()).toContain("1");
    });

    it("renders without crashing when description is undefined", () => {
      const wrapper = mountComponent({
        ...baseMovieList,
        description: undefined as any,
      });
      expect(wrapper.find(".movie-list-description").exists()).toBe(false);
    });
  });
});