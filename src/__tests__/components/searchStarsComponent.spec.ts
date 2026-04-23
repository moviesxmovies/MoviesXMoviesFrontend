import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchStarsComponent from "@/components/searchStarsComponent.vue";
import { createPinia } from "pinia";
import { reactive } from "vue";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockRoute = reactive({ query: {} as Record<string, any> });

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
}));

vi.mock("primevue", () => ({
  Checkbox: {
    name: "Checkbox",
    template: `<input
      type="checkbox"
      :data-testid="'checkbox-' + value"
      :checked="modelValue?.includes(value)"
      @change="$emit('change')"
    />`,
    props: ["modelValue", "value", "inputId", "name"],
    emits: ["update:modelValue", "change"],
  },
}));

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountComponent = () =>
  mount(SearchStarsComponent, {
    global: {
      plugins: [createPinia()],
    },
  });

describe("SearchStarsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  describe("render", () => {
    it("renders a star item for each of the 5 stars", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.findAll(".star-item")).toHaveLength(5);
    });

    it("renders the correct number of star icons per item", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const items = wrapper.findAll(".star-item");

      items.forEach((item, index) => {
        expect(item.findAll(".pi-star-fill")).toHaveLength(index + 1);
      });
    });

    it("renders a checkbox for each star", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.findAll("input[type='checkbox']")).toHaveLength(5);
    });

    it("renders a label for each star linked to its checkbox", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const labels = wrapper.findAll("label");
      expect(labels).toHaveLength(5);
      labels.forEach((label, index) => {
        expect(label.attributes("for")).toBe(String(index + 1));
      });
    });
  });

  // ── Query sync ──────────────────────────────────────────────────────────────
  describe("query sync", () => {
    it("pre-selects stars matching route.query.stars on mount", async () => {
      mockRoute.query = { stars: "3" };
      const wrapper = mountComponent();
      await flushPromises();
      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      expect(vm.selectedStars).toEqual(["3"]);
    });

    it("pre-selects multiple stars when route.query.stars is an array", async () => {
      mockRoute.query = { stars: ["2", "4"] };
      const wrapper = mountComponent();
      await flushPromises();
      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      expect(vm.selectedStars).toEqual(["2", "4"]);
    });

    it("sets selectedStars to empty array when route.query.stars is absent", async () => {
      mockRoute.query = {};
      const wrapper = mountComponent();
      await flushPromises();
      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      expect(vm.selectedStars).toEqual([]);
    });

    it("updates selectedStars when route.query.stars changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      mockRoute.query = { stars: "5" };
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      expect(vm.selectedStars).toEqual(["5"]);
    });

    it("clears selectedStars when route.query.stars is removed", async () => {
      mockRoute.query = { stars: "3" };
      const wrapper = mountComponent();
      await flushPromises();

      mockRoute.query = {};
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      expect(vm.selectedStars).toEqual([]);
    });
  });

  // ── Emit ────────────────────────────────────────────────────────────────────
  describe("filterStars emit", () => {
    it("emits filterStars with current selectedStars when a checkbox changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      vm.selectedStars = ["3", "5"];
      await wrapper.find("[data-testid='checkbox-3']").trigger("change");

      expect(wrapper.emitted("filterStars")?.[0]).toEqual([["3", "5"]]);
    });

    it("emits filterStars with empty array when nothing is selected", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedStars: string[] };
      vm.selectedStars = [];
      await wrapper.find("[data-testid='checkbox-1']").trigger("change");

      expect(wrapper.emitted("filterStars")?.[0]).toEqual([[]]);
    });

    it("emits filterStars once per checkbox change", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find("[data-testid='checkbox-2']").trigger("change");
      await wrapper.find("[data-testid='checkbox-4']").trigger("change");

      expect(wrapper.emitted("filterStars")).toHaveLength(2);
    });
  });
});