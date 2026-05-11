import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent } from "vue";
import MovieListView from "@/views/MovieListDetailView.vue";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock("@/composables/useDate", () => ({
  useDate: () => ({
    formatRelativeTime: vi.fn((date: string) => `relative(${date})`),
  }),
}));

vi.mock("@/repositories/listRepository", () => ({
  getMovieList: vi.fn(),
  movieSearchingInList: vi.fn(),
  removeMovieFromList: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, args?: any) =>
      args === undefined ? key : `${key}(${args})`,
  }),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: vi.fn() })),
  useConfirm: vi.fn(() => ({ require: vi.fn() })),
  ConfirmDialog: defineComponent({ template: "<div />" }),
  Skeleton: defineComponent({ template: "<div class='skeleton' />" }),
}));

vi.mock("@/components/movieCardComponent.vue", () => ({
  default: defineComponent({
    props: ["movie", "loading", "delete"],
    emits: ["remove-movie"],
    template: `<div data-testid="movie-card" @click="$emit('remove-movie', movie.slug)">{{ movie.title }}</div>`,
  }),
}));

vi.mock("@/components/paginationComponent.vue", () => ({
  default: defineComponent({
    props: ["total_pages", "current_page"],
    emits: ["change-page"],
    template: `<div data-testid="PaginationComponent" @click="$emit('change-page', 2)" />`,
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { api } from "@/composables/useAPI";
import {
  getMovieList,
  movieSearchingInList,
  removeMovieFromList,
} from "@/repositories/listRepository";
import { useRoute, useRouter } from "vue-router";

const mockRoute = {
  params: { user: "johndoe", slug: "my-list" },
  query: { page: "1" },
  path: "/johndoe/my-list",
};

const mockRouter = {
  push: vi.fn(),
};

const mockMovieList = {
  name: "My Favourites",
  description: "A great list",
  privacity: "P",
  user: "/api/users/1/",
  movies: [{ id: 1 }, { id: 2 }],
  updated_at: "2024-01-01T00:00:00Z",
};

const mockUser = {
  username: "johndoe",
  picture: "https://example.com/avatar.jpg",
};

const mockMovies = {
  results: [
    { id: 1, title: "Inception", slug: "inception" },
    { id: 2, title: "Interstellar", slug: "interstellar" },
  ],
  total_pages: 3,
  current_page: 1,
};

function setupMocks(overrides: Partial<typeof mockMovieList> = {}) {
  (useRoute as ReturnType<typeof vi.fn>).mockReturnValue(mockRoute);
  (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  (getMovieList as ReturnType<typeof vi.fn>).mockResolvedValue({
    ...mockMovieList,
    ...overrides,
  });
  (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockUser });
  (movieSearchingInList as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockMovies,
  );
}

async function mountComponent() {
  const wrapper = mount(MovieListView, {
    global: {
      stubs: { teleport: true },
    },
  });
  await flushPromises();
  return wrapper;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MovieListView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Initial render", () => {
    it("shows skeleton while loading", () => {
      (useRoute as ReturnType<typeof vi.fn>).mockReturnValue(mockRoute);
      (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
      // Delay resolution so loading stays true during the first render
      (getMovieList as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );
      (movieSearchingInList as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );
      (api.get as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}),
      );

      const wrapper = mount(MovieListView, {
        global: { stubs: { teleport: true } },
      });

      expect(wrapper.find(".header-skeleton").exists()).toBe(true);
      expect(wrapper.find(".movie-list-info").exists()).toBe(false);
    });

    it("renders movie list info after loading", async () => {
      const wrapper = await mountComponent();
      expect(wrapper.find(".movie-list-info").exists()).toBe(true);
      expect(wrapper.find(".header-skeleton").exists()).toBe(false);
    });

    it("displays the list name", async () => {
      const wrapper = await mountComponent();
      expect(wrapper.find(".list-name").text()).toBe("My Favourites");
    });

    it("displays the list description", async () => {
      const wrapper = await mountComponent();
      expect(wrapper.find(".list-description").text()).toBe("A great list");
    });

    it("shows fallback message when description is empty", async () => {
      setupMocks({ description: "" });
      const wrapper = await mountComponent();
      expect(wrapper.find(".list-description").text()).toBe(
        "list.noDescription",
      );
    });

    it("displays the author username", async () => {
      const wrapper = await mountComponent();
      expect(wrapper.find(".username").text()).toBe("@johndoe");
    });

    it("displays the author avatar", async () => {
      const wrapper = await mountComponent();
      const img = wrapper.find(".author-img");
      expect(img.attributes("src")).toBe("https://example.com/avatar.jpg");
      expect(img.attributes("alt")).toBe("johndoe");
    });
  });

  // ── Privacy badge ──────────────────────────────────────────────────────────

  describe("Privacy badge", () => {
    it("shows public badge for privacity P", async () => {
      setupMocks({ privacity: "P" });
      const wrapper = await mountComponent();
      expect(wrapper.find(".badge-public").exists()).toBe(true);
      expect(wrapper.find(".pi-globe").exists()).toBe(true);
    });

    it("shows private badge for privacity R", async () => {
      setupMocks({ privacity: "R" });
      const wrapper = await mountComponent();
      expect(wrapper.find(".badge-private").exists()).toBe(true);
      expect(wrapper.find(".pi-lock").exists()).toBe(true);
    });

    it("shows friends badge for privacity F", async () => {
      setupMocks({ privacity: "F" });
      const wrapper = await mountComponent();
      expect(wrapper.find(".badge-friends").exists()).toBe(true);
      expect(wrapper.find(".pi-users").exists()).toBe(true);
    });
  });

  // ── Movie cards ────────────────────────────────────────────────────────────

  describe("Movie cards", () => {
    it("renders a card for each movie result", async () => {
      const wrapper = await mountComponent();
      const cards = wrapper.findAll('[data-testid="movie-card"]');
      expect(cards).toHaveLength(2);
    });

    it("renders no cards when results are empty", async () => {
      (movieSearchingInList as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockMovies,
        results: [],
      });
      const wrapper = await mountComponent();
      expect(wrapper.findAll('[data-testid="movie-card"]')).toHaveLength(0);
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  describe("Pagination", () => {
    it("shows pagination when total_pages > 1", async () => {
      const wrapper = await mountComponent();
      expect(wrapper.find('[data-testid="PaginationComponent"]').exists()).toBe(
        true,
      );
    });

    it("hides pagination when total_pages === 1", async () => {
      (movieSearchingInList as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockMovies,
        total_pages: 1,
      });
      const wrapper = await mountComponent();
      expect(wrapper.find('[data-testid="PaginationComponent"]').exists()).toBe(
        false,
      );
    });

    it("calls router.push with correct page on pagination change", async () => {
      const wrapper = await mountComponent();
      await wrapper
        .find('[data-testid="PaginationComponent"]')
        .trigger("click");
      expect(mockRouter.push).toHaveBeenCalledWith({
        path: mockRoute.path,
        query: { ...mockRoute.query, page: 2 },
      });
    });
  });

  // ── Remove movie ───────────────────────────────────────────────────────────

  describe("Remove movie", () => {
    it("calls confirm.require when remove-movie is emitted", async () => {
      const { useConfirm } = await import("primevue");
      const mockRequire = vi.fn();
      (useConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
        require: mockRequire,
      });

      const wrapper = await mountComponent();
      await wrapper.find('[data-testid="movie-card"]').trigger("click");

      expect(mockRequire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "pi pi-exclamation-triangle",
        }),
      );
    });

    it("calls removeMovieFromList with correct args on confirm accept", async () => {
      let acceptCallback: () => void = () => {};
      const { useConfirm } = await import("primevue");
      (useConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
        require: vi.fn(({ accept }: { accept: () => void }) => {
          acceptCallback = accept;
        }),
      });
      (removeMovieFromList as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const wrapper = await mountComponent();
      await wrapper.find('[data-testid="movie-card"]').trigger("click");
      acceptCallback();
      await flushPromises();

      expect(removeMovieFromList).toHaveBeenCalledWith(
        "johndoe",
        "my-list",
        "inception",
      );
    });

    it("refreshes movie list after successful removal", async () => {
      let acceptCallback: () => void = () => {};
      const { useConfirm } = await import("primevue");
      (useConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
        require: vi.fn(({ accept }: { accept: () => void }) => {
          acceptCallback = accept;
        }),
      });
      (removeMovieFromList as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const callsBefore = (movieSearchingInList as ReturnType<typeof vi.fn>)
        .mock.calls.length;

      const wrapper = await mountComponent();
      await wrapper.find('[data-testid="movie-card"]').trigger("click");
      acceptCallback();
      await flushPromises();

      expect(
        (movieSearchingInList as ReturnType<typeof vi.fn>).mock.calls.length,
      ).toBeGreaterThan(callsBefore);
    });
  });

  // ── API calls ──────────────────────────────────────────────────────────────

  describe("API integration", () => {
    it("calls getMovieList with route params", async () => {
      await mountComponent();
      expect(getMovieList).toHaveBeenCalledWith("johndoe", "my-list");
    });

    it("calls movieSearchingInList with route params and page", async () => {
      await mountComponent();
      expect(movieSearchingInList).toHaveBeenCalledWith(
        "johndoe",
        "my-list",
        "",
        1,
      );
    });

    it("calls api.get with the user URL from movie list", async () => {
      await mountComponent();
      expect(api.get).toHaveBeenCalledWith("/api/users/1/");
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("shows toast error when getMovieList fails", async () => {
      const { useToast } = await import("primevue");
      const mockAdd = vi.fn();
      (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ add: mockAdd });
      (getMovieList as ReturnType<typeof vi.fn>).mockRejectedValue({
        response: { data: { message: "List not found" } },
      });

      await mountComponent();

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "List not found",
        }),
      );
    });

    it("shows toast error when movieSearchingInList fails", async () => {
      const { useToast } = await import("primevue");
      const mockAdd = vi.fn();
      (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ add: mockAdd });
      (movieSearchingInList as ReturnType<typeof vi.fn>).mockRejectedValue({
        response: { data: { message: "Could not fetch movies" } },
      });

      await mountComponent();

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Could not fetch movies",
        }),
      );
    });

    it("shows toast error when removeMovieFromList fails", async () => {
      const { useToast, useConfirm } = await import("primevue");
      const mockAdd = vi.fn();
      (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ add: mockAdd });

      let acceptCallback: () => void = () => {};
      (useConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
        require: vi.fn(({ accept }: { accept: () => void }) => {
          acceptCallback = accept;
        }),
      });
      (removeMovieFromList as ReturnType<typeof vi.fn>).mockRejectedValue({
        response: { data: { message: "Remove failed" } },
      });

      const wrapper = await mountComponent();
      await wrapper.find('[data-testid="movie-card"]').trigger("click");
      acceptCallback();
      await flushPromises();

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Remove failed",
        }),
      );
    });

    it("uses fallback error key when API error message is missing", async () => {
      const { useToast } = await import("primevue");
      const mockAdd = vi.fn();
      (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ add: mockAdd });
      (getMovieList as ReturnType<typeof vi.fn>).mockRejectedValue({});

      await mountComponent();

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "list.getListError",
        }),
      );
    });
  });

  // ── Stats display ──────────────────────────────────────────────────────────

  describe("Stats display", () => {
    it("displays movie count from movieList.movies.length", async () => {
      const wrapper = await mountComponent();
      const stats = wrapper.find(".list-footer-stats");
      expect(stats.text()).toContain("list.moviesCount(2)");
    });

    it("displays relative updated_at time", async () => {
      const wrapper = await mountComponent();
      const stats = wrapper.find(".list-footer-stats");
      expect(stats.text()).toContain("relative(2024-01-01T00:00:00Z)");
    });
  });
});
