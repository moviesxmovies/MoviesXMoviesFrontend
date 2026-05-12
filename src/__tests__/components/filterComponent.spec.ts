import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FilterComponent from "@/components/filterComponent.vue";
import { createPinia } from "pinia";

const { mockToastAdd } = vi.hoisted(() => {
  return {
    mockToastAdd: vi.fn(),
  };
});

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", () => ({
  useToast: () => ({ add: mockToastAdd }),
  Accordion: {
    name: "Accordion",
    template: '<div data-testid="accordion"><slot /></div>',
    props: ["multiple", "value"],
  },
  AccordionPanel: {
    name: "AccordionPanel",
    template: '<div data-testid="accordion-panel"><slot /></div>',
    props: ["value"],
  },
  AccordionHeader: {
    name: "AccordionHeader",
    template: '<div data-testid="accordion-header"><slot /></div>',
  },
  AccordionContent: {
    name: "AccordionContent",
    template: '<div data-testid="accordion-content"><slot /></div>',
  },
}));

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountComponent = () =>
  mount(FilterComponent, {
    global: {
      plugins: [createPinia()],
      stubs: {
        SearchGenresComponent: {
          name: "SearchGenresComponent",
          template: '<div data-testid="search-genres" />',
          emits: ["filterGenres"],
        },
        SearchPlatformsComponent: {
          name: "SearchPlatformsComponent",
          template: '<div data-testid="search-platforms" />',
          emits: ["filterPlatforms"],
        },
        SearchPersonComponent: {
          name: "SearchPersonComponent",
          template: '<div data-testid="search-person" />',
          emits: ["filterPersons"],
        },
        SearchStarsComponent: {
          name: "SearchStarsComponent",
          template: '<div data-testid="search-stars" />',
          emits: ["filterStars"],
        },
        FilterPreferencesComponent: {
          name: "FilterPreferencesComponent",
          template: '<div data-testid="filter-preferences" />',
          emits: ["filterUnseen", "filterReviewed"],
        },
      },
    },
  });

describe("FilterComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  describe("render", () => {
    it("renders the Accordion wrapper", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='accordion']").exists()).toBe(true);
    });

    it("renders 5 accordion panels", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.findAll("[data-testid='accordion-panel']")).toHaveLength(
        5,
      );
    });

    it("renders the genres header with the i18n key", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const headers = wrapper.findAll("[data-testid='accordion-header']");
      expect(headers[0].text()).toBe("components.filter.genres");
    });

    it("renders the platforms header with the i18n key", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const headers = wrapper.findAll("[data-testid='accordion-header']");
      expect(headers[1].text()).toBe("components.filter.platforms");
    });

    it("renders the celebrities header with the i18n key", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const headers = wrapper.findAll("[data-testid='accordion-header']");
      expect(headers[2].text()).toBe("components.filter.celebrities");
    });

    it("renders the stars header with the i18n key", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const headers = wrapper.findAll("[data-testid='accordion-header']");
      expect(headers[3].text()).toBe("components.filter.stars");
    });

    it("renders SearchGenresComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='search-genres']").exists()).toBe(true);
    });

    it("renders SearchPlatformsComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='search-platforms']").exists()).toBe(
        true,
      );
    });

    it("renders SearchPersonComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='search-person']").exists()).toBe(true);
    });

    it("renders SearchStarsComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='search-stars']").exists()).toBe(true);
    });

    it("renders FilterPreferencesComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.find("[data-testid='filter-preferences']").exists()).toBe(
        true,
      );
    });
  });

  // ── Event propagation ───────────────────────────────────────────────────────
  describe("event propagation", () => {
    it("emits filterGenres when SearchGenresComponent emits filterGenres", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "SearchGenresComponent" })
        .vm.$emit("filterGenres", ["action", "drama"]);

      expect(wrapper.emitted("filterGenres")?.[0]).toEqual([
        ["action", "drama"],
      ]);
    });

    it("emits filterPlatforms when SearchPlatformsComponent emits filterPlatforms", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "SearchPlatformsComponent" })
        .vm.$emit("filterPlatforms", ["netflix"]);

      expect(wrapper.emitted("filterPlatforms")?.[0]).toEqual([["netflix"]]);
    });

    it("emits filterCelebrities when SearchPersonComponent emits filterPersons", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const payload = ["tom-cruise", "brad-pitt"];
      await wrapper
        .findComponent({ name: "SearchPersonComponent" })
        .vm.$emit("filterPersons", payload);

      expect(wrapper.emitted("filterCelebrities")?.[0]).toEqual([payload]);
    });

    it("emits filterStars when SearchStarsComponent emits filterStars", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "SearchStarsComponent" })
        .vm.$emit("filterStars", ["4", "5"]);

      expect(wrapper.emitted("filterStars")?.[0]).toEqual([["4", "5"]]);
    });

    it("emits filterUnseen when FilterPreferencesComponent emits filterUnseen", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "FilterPreferencesComponent" })
        .vm.$emit("filterUnseen", true);

      expect(wrapper.emitted("filterUnseen")?.[0]).toEqual([true]);
    });

    it("emits filterReviewed when FilterPreferencesComponent emits filterReviewed", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "FilterPreferencesComponent" })
        .vm.$emit("filterReviewed", true);

      expect(wrapper.emitted("filterReviewed")?.[0]).toEqual([true]);
    });

    it("propagates the exact payload received from SearchGenresComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const payload = ["sci-fi", "thriller", "horror"];
      await wrapper
        .findComponent({ name: "SearchGenresComponent" })
        .vm.$emit("filterGenres", payload);

      expect(wrapper.emitted("filterGenres")?.[0][0]).toEqual(payload);
    });

    it("emits each event independently without cross-contamination", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "SearchGenresComponent" })
        .vm.$emit("filterGenres", ["action"]);

      await wrapper
        .findComponent({ name: "SearchStarsComponent" })
        .vm.$emit("filterStars", ["5"]);

      expect(wrapper.emitted("filterGenres")).toHaveLength(1);
      expect(wrapper.emitted("filterPlatforms")).toBeFalsy();
      expect(wrapper.emitted("filterStars")).toHaveLength(1);
    });
  });
});
