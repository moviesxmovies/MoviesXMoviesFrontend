import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import FilmographyComponent from "@/components/filmographyComponent.vue";
import type { Movie } from "@/types";

// ── PrimeVue stubs ──────────────────────────────────────────────────────────
vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");

  const passThrough = (name: string, extraProps: string[] = []) =>
    defineComponent({
      name,
      props: ["value", "class", "style", ...extraProps],
      setup(_, { slots }) {
        return () => h("div", { "data-testid": name }, slots.default?.());
      },
    });

  return {
    AccordionPanel: passThrough("AccordionPanel"),
    AccordionHeader: passThrough("AccordionHeader"),
    AccordionContent: passThrough("AccordionContent"),
    ScrollPanel: passThrough("ScrollPanel", ["style"]),
  };
});

// ── vue-i18n stub ────────────────────────────────────────────────────────────
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// ── MovieCardComponent stub ──────────────────────────────────────────────────
vi.mock("@/components/movieCardComponent.vue", () => ({
  default: {
    name: "MovieCardComponent",
    props: ["movie"],
    template: `<div data-testid="movie-card" :data-id="movie.id">{{ movie.title }}</div>`,
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeMovie = (id: number): Movie =>
  ({ id, title: `Movie ${id}` }) as Movie;

const defaultProps = {
  index: 1,
  title: "Acted In",
  loading: false,
  sentinelRef: null,
};

const mountComponent = (props: Record<string, unknown> = {}) =>
  mount(FilmographyComponent, {
    props: { ...defaultProps, ...props },
    global: { stubs: { teleport: true } },
  });

// ────────────────────────────────────────────────────────────────────────────
describe("FilmographyComponent", () => {
  // ── Rendering with list ───────────────────────────────────────────────────
  describe("when a non-empty list is provided", () => {
    const movies = [makeMovie(1), makeMovie(2), makeMovie(3)];

    it("renders the AccordionPanel for the list", () => {
      const wrapper = mountComponent({ list: movies });
      expect(wrapper.find("[data-testid='AccordionPanel']").exists()).toBe(
        true,
      );
    });

    it("renders one MovieCardComponent per movie", () => {
      const wrapper = mountComponent({ list: movies });
      const cards = wrapper.findAll("[data-testid='movie-card']");
      expect(cards).toHaveLength(3);
    });

    it("passes correct movie data to each MovieCardComponent", () => {
      const wrapper = mountComponent({ list: movies });
      const cards = wrapper.findAll("[data-testid='movie-card']");
      movies.forEach((movie, i) => {
        expect(cards[i].attributes("data-id")).toBe(String(movie.id));
        expect(cards[i].text()).toContain(movie.title);
      });
    });

    it("displays the title prop", () => {
      const wrapper = mountComponent({ list: movies });
      expect(wrapper.text()).toContain("Acted In");
    });

    it("uses the default icon when no icon prop is given", () => {
      const wrapper = mountComponent({ list: movies });
      expect(wrapper.find(".pi.pi-video").exists()).toBe(true);
    });

    it("uses a custom icon when the icon prop is provided", () => {
      const wrapper = mountComponent({ list: movies, icon: "pi pi-star" });
      expect(wrapper.find(".pi.pi-star").exists()).toBe(true);
      expect(wrapper.find(".pi.pi-video").exists()).toBe(false);
    });

    it("does NOT render the empty-state panel", () => {
      const wrapper = mountComponent({ list: movies });
      // The empty panel contains the no-movies i18n key
      expect(wrapper.text()).not.toContain(
        "components.filmography.no_movies_description",
      );
    });

    it("renders the sentinel div", () => {
      const wrapper = mountComponent({ list: movies });
      expect(wrapper.find(".sentinel").exists()).toBe(true);
    });

    it("does NOT show the loading spinner when loading is false", () => {
      const wrapper = mountComponent({ list: movies, loading: false });
      expect(wrapper.find(".pi-spinner").exists()).toBe(false);
    });

    it("shows the loading spinner when loading is true", () => {
      const wrapper = mountComponent({ list: movies, loading: true });
      expect(wrapper.find(".pi-spinner").exists()).toBe(true);
    });
  });

  // ── Empty-state (empty prop) ──────────────────────────────────────────────
  describe("when empty prop is true and no list is given", () => {
    it("renders the empty-state AccordionPanel", () => {
      const wrapper = mountComponent({ empty: true });
      expect(wrapper.find("[data-testid='AccordionPanel']").exists()).toBe(
        true,
      );
    });

    it("displays the no-movies heading key via i18n", () => {
      const wrapper = mountComponent({ empty: true });
      expect(wrapper.text()).toContain("components.filmography.no_movies");
    });

    it("displays the no-movies description key via i18n", () => {
      const wrapper = mountComponent({ empty: true });
      expect(wrapper.text()).toContain(
        "components.filmography.no_movies_description",
      );
    });

    it("does NOT render MovieCardComponent", () => {
      const wrapper = mountComponent({ empty: true });
      expect(wrapper.find("[data-testid='movie-card']").exists()).toBe(false);
    });

    it("displays the title prop in the empty-state panel", () => {
      const wrapper = mountComponent({ empty: true, title: "Directed" });
      expect(wrapper.text()).toContain("Directed");
    });
  });

  // ── Hidden when list is empty array and empty is not set ─────────────────
  describe("when list is an empty array and empty prop is not set", () => {
    it("renders no AccordionPanel (v-if guards)", () => {
      const wrapper = mountComponent({ list: [] });
      // Neither list?.length nor empty is truthy
      expect(wrapper.find("[data-testid='AccordionPanel']").exists()).toBe(
        false,
      );
    });
  });

  // ── emit update:sentinelRef ───────────────────────────────────────────────
  describe("sentinel ref emit", () => {
    it("emits update:sentinelRef when sentinel div is mounted", async () => {
      const wrapper = mountComponent({ list: [makeMovie(1)] });
      // The :ref callback on .sentinel emits the event
      const emitted = wrapper.emitted("update:sentinelRef");
      expect(emitted).toBeTruthy();
    });

    it("emits the element as first argument", async () => {
      const wrapper = mountComponent({ list: [makeMovie(1)] });
      const emitted = wrapper.emitted<HTMLElement[][]>("update:sentinelRef");
      const [firstArg] = emitted[0];
      // Could be an HTMLElement or null depending on env
      expect(firstArg instanceof HTMLElement).toBe(true);
    });
  });
});
