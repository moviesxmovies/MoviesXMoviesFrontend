import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CelebrityView from "@/views/CelebrityView.vue"; // adjust path as needed
import type { MoviePagination, Person } from "@/types";

// ── Repository mocks ─────────────────────────────────────────────────────────
const mockGetUserProfile = vi.fn();
const mockGetUserFilmography = vi.fn();

vi.mock("@/repositories/userRepository", () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  getUserFilmography: (...args: unknown[]) => mockGetUserFilmography(...args),
}));

// ── vue-router ───────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { slug: "keanu-reeves" } }),
  useRouter: () => ({ push: mockPush }),
}));

// ── vue-i18n ─────────────────────────────────────────────────────────────────
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// ── Infinite scroll composable ───────────────────────────────────────────────
vi.mock("@/composables/useInfiniteScroll", () => ({
  useInfiniteScroll: (cb: () => void) => {
    // expose the callback so tests can trigger it manually
    return { sentinelRef: null, _cb: cb };
  },
}));

// ── PrimeVue stubs ────────────────────────────────────────────────────────────
vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");

  const passThrough = (name: string) =>
    defineComponent({
      name,
      props: ["value", "severity", "icon", "style", "class"],
      setup(_, { slots }) {
        return () => h("div", { "data-testid": name }, slots.default?.());
      },
    });

  return {
    Accordion: passThrough("Accordion"),
    AccordionContent: passThrough("AccordionContent"),
    AccordionHeader: passThrough("AccordionHeader"),
    AccordionPanel: passThrough("AccordionPanel"),
    Tag: passThrough("Tag"),
    useToast: () => ({ add: vi.fn() }),
  };
});

// ── FilmographyComponent stub ─────────────────────────────────────────────────
vi.mock("@/components/filmographyComponent.vue", () => ({
  default: {
    name: "FilmographyComponent",
    props: ["index", "list", "loading", "title", "sentinelRef", "empty"],
    emits: ["update:sentinelRef"],
    template: `
      <div
        data-testid="filmography"
        :data-title="title"
        :data-empty="empty"
        :data-loading="loading"
        :data-list-length="list?.length"
      />
    `,
  },
}));

// ── Test data factories ───────────────────────────────────────────────────────
const makePerson = (overrides: Partial<Person> = {}): Person =>
  ({
    id: 1,
    name: "Keanu Reeves",
    biography: "An actor.",
    birthday: "1964-09-02",
    deathday: null,
    gender: "2",
    image: "https://example.com/keanu.jpg",
    ...overrides,
  } as unknown as Person);

const makeMoviePagination = (count = 2): MoviePagination =>
  ({
    results: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
    })),
    next_last_id: null,
  } as unknown as MoviePagination);

// ── Mount helper ─────────────────────────────────────────────────────────────
const mountView = () =>
  mount(CelebrityView, {
    global: { stubs: { teleport: true } },
  });

// ────────────────────────────────────────────────────────────────────────────
describe("CelebrityView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(makePerson());
    mockGetUserFilmography.mockResolvedValue(makeMoviePagination());
  });

  // ── onMounted data fetching ───────────────────────────────────────────────
  describe("onMounted", () => {
    it("calls getUserProfile with the route slug", async () => {
      mountView();
      await flushPromises();
      expect(mockGetUserProfile).toHaveBeenCalledWith("keanu-reeves");
    });

    it("calls getUserFilmography for 'acted' on mount", async () => {
      mountView();
      await flushPromises();
      expect(mockGetUserFilmography).toHaveBeenCalledWith(
        "keanu-reeves",
        "acted",
        undefined
      );
    });

    it("calls getUserFilmography for 'directed' on mount", async () => {
      mountView();
      await flushPromises();
      expect(mockGetUserFilmography).toHaveBeenCalledWith(
        "keanu-reeves",
        "directed",
        undefined
      );
    });
  });

  // ── Profile rendering ─────────────────────────────────────────────────────
  describe("profile sidebar", () => {
    it("renders the celebrity image", async () => {
      const wrapper = mountView();
      await flushPromises();
      const img = wrapper.find("img.card-img");
      expect(img.attributes("src")).toBe("https://example.com/keanu.jpg");
      expect(img.attributes("alt")).toBe("Keanu Reeves");
    });

    it("renders the celebrity name", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".celebrity-name").text()).toBe("Keanu Reeves");
    });

    it("renders the birthday", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.text()).toContain("1964-09-02");
    });

    it("does NOT render deathday when null", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".death-icon").exists()).toBe(false);
    });

    it("renders deathday when present", async () => {
      mockGetUserProfile.mockResolvedValue(
        makePerson({ deathday: "2099-01-01" })
      );
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".death-icon").exists()).toBe(true);
      expect(wrapper.text()).toContain("2099-01-01");
    });
  });

  // ── Gender tag ────────────────────────────────────────────────────────────
  describe("gender tag", () => {
    it.each([
      ["0", "pi pi-minus", "var(--secondary)"],
      ["1", "pi pi-venus", "var(--accent)"],
      ["2", "pi pi-mars", "var(--primary)"],
    ])("gender, icon and color renders for celebrity gender", async (gender, icon, color) => {
      mockGetUserProfile.mockResolvedValue(makePerson({ gender }));
      const wrapper = mountView();
      await flushPromises();
      // Tag stub renders data-testid="Tag"; verify computed values via vm
      const vm = wrapper.vm as unknown as {
        genderIcon: string;
        genderBackground: string;
      };
      expect(vm.genderIcon).toBe(icon);
      expect(vm.genderBackground).toBe(color);
    });

    it("falls back to pi-question for unknown gender", async () => {
      mockGetUserProfile.mockResolvedValue(makePerson({ gender: "99" }));
      const wrapper = mountView();
      await flushPromises();
      const vm = wrapper.vm as unknown as { genderIcon: string };
      expect(vm.genderIcon).toBe("pi pi-question");
    });
  });

  // ── Biography ─────────────────────────────────────────────────────────────
  describe("biography section", () => {
    it("displays biography text when present", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".biography").text()).toBe("An actor.");
    });

    it("displays empty-text when biography is absent", async () => {
      mockGetUserProfile.mockResolvedValue(makePerson({ biography: "" }));
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.find(".empty-text").exists()).toBe(true);
    });
  });

  // ── FilmographyComponent integration ─────────────────────────────────────
  describe("FilmographyComponent children", () => {
    it("renders exactly 2 filmography stubs when both lists have data", async () => {
      const wrapper = mountView();
      await flushPromises();
      expect(wrapper.findAll("[data-testid='filmography']")).toHaveLength(2);
    });

    it("passes acted_movies to the correct FilmographyComponent", async () => {
      const wrapper = mountView();
      await flushPromises();
      const all = wrapper.findAll("[data-testid='filmography']");
      const actedFilmography = all.find(
        (w) => w.attributes("data-title") === "celebrity.filmography.acted_in"
      );
      expect(actedFilmography).toBeDefined();
      expect(actedFilmography.attributes("data-list-length")).toBe("2");
    });

    it("passes directed_movies to the correct FilmographyComponent", async () => {
      const wrapper = mountView();
      await flushPromises();
      const all = wrapper.findAll("[data-testid='filmography']");
      const directedFilmography = all.find(
        (w) => w.attributes("data-title") === "celebrity.filmography.directed"
      );
      expect(directedFilmography).toBeDefined();
      expect(directedFilmography.attributes("data-list-length")).toBe("2");
    });

    it("renders the empty FilmographyComponent when both lists are empty", async () => {
      mockGetUserFilmography.mockResolvedValue({
        results: [],
        next_last_id: null,
      });
      const wrapper = mountView();
      await flushPromises();
      const [emptyFilmography] = wrapper.findAll(
        "[data-testid='filmography']"
      );
      expect(emptyFilmography.attributes("data-empty")).toBe("true");
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("redirects to NotFound when getUserProfile rejects", async () => {
      mockGetUserProfile.mockRejectedValue({
        response: { data: { message: "Not found" } },
      });
      mountView();
      await flushPromises();
      expect(mockPush).toHaveBeenCalledWith({ name: "NotFound" });
    });

    it("does not redirect to NotFound on filmography errors", async () => {
      mockGetUserFilmography.mockRejectedValue(new Error("fail"));
      mountView();
      await flushPromises();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ── Infinite scroll — pagination ──────────────────────────────────────────
  describe("fetchFilmography with lastId (pagination)", () => {
    it("appends results when next_last_id is present and callback fires", async () => {
      mockGetUserFilmography
        .mockResolvedValueOnce({
          results: [{ id: 1, title: "Movie 1" }],
          next_last_id: 1,
        })
        .mockResolvedValueOnce({
          results: [{ id: 1, title: "Movie 1" }],
          next_last_id: 1,
        })
        .mockResolvedValueOnce({
          results: [{ id: 2, title: "Movie 2" }],
          next_last_id: null,
        });

      const wrapper = mountView();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        fetchFilmography: (
          type: "acted" | "directed",
          lastId?: number
        ) => Promise<void>;
        acted_movies: MoviePagination;
      };

      await vm.fetchFilmography("acted", 1);
      await flushPromises();

      expect(vm.acted_movies.results).toHaveLength(2);
    });
  });
});