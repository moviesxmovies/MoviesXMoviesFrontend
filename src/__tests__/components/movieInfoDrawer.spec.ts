import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import MovieInfoDrawer from "@/components/movieInfoDrawer.vue";
import type { Movie, Person } from "@/types";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// --- Helpers ---
const mockMovie: Movie = {
  id: "1",
  title: "Inception",
  release_date: "2010",
  cover: "https://example.com/cover.jpg",
  synopsis: "A thief who steals corporate secrets.",
  platforms: [
    { id: "p1", name: "Netflix", image: "https://example.com/netflix.png" },
  ],
  genres: [
    { id: "g1", name: "Sci-Fi" },
    { id: "g2", name: "Thriller" },
  ],
  actors: ["/api/people/1", "/api/people/2"],
  directors: ["/api/people/3"],
};

const mockActor1: Person = {
  id: "1",
  name: "Leonardo DiCaprio",
  image: "https://example.com/leo.jpg",
};
const mockActor2: Person = {
  id: "2",
  name: "Joseph Gordon-Levitt",
  image: "https://example.com/joe.jpg",
};
const mockDirector: Person = {
  id: "3",
  name: "Christopher Nolan",
  image: "https://example.com/nolan.jpg",
};

const toastAddMock = vi.fn();
vi.mock("primevue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("primevue")>();
  return {
    ...actual,
    useToast: () => ({
      add: toastAddMock,
    }),
  };
});

// 2. Ajusta el mountComponent para que el Stub sea funcional
function mountComponent(movie: Movie = mockMovie, visible = true) {
  return mount(MovieInfoDrawer, {
    props: {
      movie,
      visible,
    },
    global: {
      stubs: {
        Drawer: {
          template: `<div v-if="visible" class="p-drawer-stub">
              <div class="p-drawer-header">
                <slot name="header" />
              </div>
              <div class="p-drawer-content">
                <slot />
              </div>
            </div>`,
          props: ["visible"],
        },
        ScrollPanel: { template: "<div><slot /></div>" },
        Skeleton: { template: '<div class="p-skeleton" />' },
      },
    },
  });
}

// --- Tests ---
describe("MovieInfoDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Props", () => {
    it("Should accept movie prop correctly", () => {
      const wrapper = mountComponent();
      expect(wrapper.props().movie).toEqual(mockMovie);
    });

    it("Should accept visible prop correctly", () => {
      const wrapper = mountComponent(mockMovie, true);
      expect(wrapper.props().visible).toBe(true);
    });
  });

  describe("Loading State", () => {
    it("Should show skeleton while loading", async () => {
      mockGet.mockReturnValue(new Promise(() => {}));

      const wrapper = mountComponent();

      expect(wrapper.find(".drawer-loading").exists()).toBe(true);
      expect(wrapper.findAll(".p-skeleton").length).toBeGreaterThan(0);
    });

    it("Should hide skeleton when loading is complete", async () => {
      mockGet
        .mockResolvedValueOnce({ data: mockActor1 })
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });

      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find(".drawer-loading").exists()).toBe(false);
    });
  });

  describe("Rendered Content", () => {
    beforeEach(async () => {
      mockGet
        .mockResolvedValueOnce({ data: mockActor1 })
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });
    });

    it("Should show the movie title in the header", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find(".drawer-title").text()).toBe("Inception");
    });

    it("Should show the release year", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find(".drawer-year").text()).toBe("2010");
    });

    it("Should show the cover image if it exists", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const poster = wrapper.find(".drawer-poster");
      expect(poster.exists()).toBe(true);
      expect(poster.attributes("src")).toBe(mockMovie.cover);
    });

    it("Should not show the cover image if it does not exist", async () => {
      const movieWithoutCover = { ...mockMovie, cover: undefined };
      const wrapper = mountComponent(movieWithoutCover);
      await flushPromises();

      expect(wrapper.find(".drawer-poster").exists()).toBe(false);
    });

    it("Should show the synopsis correctly", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find(".drawer-section__body").text()).toBe(
        mockMovie.synopsis,
      );
    });

    it("Should render the genres", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const tags = wrapper.findAll(".genre-tag");
      expect(tags).toHaveLength(2);
      expect(tags[0].text()).toBe("Sci-Fi");
      expect(tags[1].text()).toBe("Thriller");
    });

    it("Should render the actors after loading", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const actors = wrapper.findAll(".person-item");
      expect(actors.length).toBeGreaterThanOrEqual(2);
    });

    it("Should render the platforms", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const platforms = wrapper.findAll(".platform-item");
      expect(platforms).toHaveLength(1);
    });
  });

  describe("Error Handling", () => {
    it("Should show an error toast if an actor request fails", async () => {
      mockGet
        .mockRejectedValueOnce({ response: { data: { message: "Not found" } } })
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });

      mountComponent();
      await flushPromises();

      expect(toastAddMock).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Not found",
        }),
      );
    });

    it("Should use the i18n message if the error has no API message", async () => {
      mockGet
        .mockRejectedValueOnce({})
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });

      mountComponent();
      await flushPromises();

      expect(toastAddMock).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.movieInfoDrawer.fetchActorsError",
        }),
      );
    });

    it("Should continue loading the rest even if an actor fails", async () => {
      mockGet
        .mockRejectedValueOnce({})
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });

      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find(".drawer-loading").exists()).toBe(false);
    });
  });

  describe("Changing Movie", () => {
    it("reloads the data when the movie prop changes", async () => {
      mockGet
        .mockResolvedValueOnce({ data: mockActor1 })
        .mockResolvedValueOnce({ data: mockActor2 })
        .mockResolvedValueOnce({ data: mockDirector });

      const wrapper = mountComponent();
      await flushPromises();

      const newMovie: Movie = {
        ...mockMovie,
        id: "2",
        title: "Interstellar",
        actors: ["/api/people/4"],
        directors: ["/api/people/5"],
      };

      mockGet
        .mockResolvedValueOnce({
          data: { id: "4", name: "Matthew McConaughey", image: "" },
        })
        .mockResolvedValueOnce({
          data: { id: "5", name: "Christopher Nolan", image: "" },
        });

      await wrapper.setProps({ movie: newMovie });
      await flushPromises();

      expect(mockGet).toHaveBeenCalledTimes(5);
    });
  });
});
