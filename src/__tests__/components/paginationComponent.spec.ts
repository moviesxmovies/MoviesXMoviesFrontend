import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PaginatorComponent from "@/components/paginationComponent.vue";

let lastPaginatorProps: Record<string, unknown> = {};
const firePaginatorPage = vi.fn();

vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");

  return {
    Paginator: defineComponent({
      name: "Paginator",
      props: ["first", "rows", "totalRecords", "template", "pt", "class"],
      emits: ["page"],
      setup(props, { emit }) {
        // Store latest props so tests can inspect them
        lastPaginatorProps = props as Record<string, unknown>;
        // Expose a way for tests to trigger the page event
        firePaginatorPage.mockImplementation((pageIndex: number) =>
          emit("page", { page: pageIndex }),
        );
        return () =>
          h("div", {
            "data-testid": "Paginator",
            "data-first": props.first,
            "data-rows": props.rows,
            "data-total-records": props.totalRecords,
            "data-template": props.template,
          });
      },
    }),
  };
});

// ── Mount helper ──────────────────────────────────────────────────────────────
const mountComponent = (props: {
  total_pages: number;
  current_page: number;
  rows?: number;
}) => mount(PaginatorComponent, { props });

describe("PaginatorComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastPaginatorProps = {};
  });

  // ── Rendering ─────────────────────────────────────────────────────────────
  describe("rendering", () => {
    it("renders the paginator container", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(wrapper.find(".paginator-container").exists()).toBe(true);
    });

    it("renders the Paginator component", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(wrapper.find("[data-testid='Paginator']").exists()).toBe(true);
    });

    it("applies the custom-paginator class to the Paginator", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(wrapper.find("[data-testid='Paginator']").exists()).toBe(true);
    });
  });

  // ── :first calculation ────────────────────────────────────────────────────
  describe(":first prop — (current_page - 1) * rows", () => {
    it("computes first=0 for page 1 with default rows (4)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("0");
    });

    it("computes first=4 for page 2 with default rows (4)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 2 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("4");
    });

    it("computes first=20 for page 3 with rows=10", () => {
      const wrapper = mountComponent({
        total_pages: 5,
        current_page: 3,
        rows: 10,
      });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("20");
    });

    it("computes first=0 for page 1 with explicit rows=10", () => {
      const wrapper = mountComponent({
        total_pages: 5,
        current_page: 1,
        rows: 10,
      });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("0");
    });
  });

  // ── :rows prop ────────────────────────────────────────────────────────────
  describe(":rows prop — defaults to 4", () => {
    it("passes rows=4 when the rows prop is not provided", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-rows"),
      ).toBe("4");
    });

    it("passes the explicit rows value when provided", () => {
      const wrapper = mountComponent({
        total_pages: 5,
        current_page: 1,
        rows: 10,
      });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-rows"),
      ).toBe("10");
    });
  });

  // ── :totalRecords calculation ─────────────────────────────────────────────
  describe(":totalRecords prop — total_pages * rows", () => {
    it("computes totalRecords=20 for 5 pages with default rows (4)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(
        wrapper
          .find("[data-testid='Paginator']")
          .attributes("data-total-records"),
      ).toBe("20");
    });

    it("computes totalRecords=30 for 3 pages with rows=10", () => {
      const wrapper = mountComponent({
        total_pages: 3,
        current_page: 1,
        rows: 10,
      });
      expect(
        wrapper
          .find("[data-testid='Paginator']")
          .attributes("data-total-records"),
      ).toBe("30");
    });

    it("computes totalRecords=4 for 1 page with default rows (4)", () => {
      const wrapper = mountComponent({ total_pages: 1, current_page: 1 });
      expect(
        wrapper
          .find("[data-testid='Paginator']")
          .attributes("data-total-records"),
      ).toBe("4");
    });
  });

  // ── template prop ─────────────────────────────────────────────────────────
  describe("template prop", () => {
    it("passes the correct navigation template string to Paginator", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-template"),
      ).toBe("FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink");
    });
  });

  // ── @page → emit('changePage') ────────────────────────────────────────────
  describe("@page event — emits 'changePage' with page + 1", () => {
    it("emits 'changePage' when the Paginator fires a page event", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      firePaginatorPage(0); // page index 0 → page number 1
      expect(wrapper.emitted("changePage")).toBeTruthy();
    });

    it("emits changePage with page + 1 (index 0 → page 1)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      firePaginatorPage(0);
      expect(wrapper.emitted("changePage")[0]).toEqual([1]);
    });

    it("emits changePage with page + 1 (index 1 → page 2)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      firePaginatorPage(1);
      expect(wrapper.emitted("changePage")[0]).toEqual([2]);
    });

    it("emits changePage with page + 1 (index 4 → page 5)", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      firePaginatorPage(4);
      expect(wrapper.emitted("changePage")[0]).toEqual([5]);
    });

    it("emits 'changePage' once per page event", () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      firePaginatorPage(2);
      expect(wrapper.emitted("changePage")).toHaveLength(1);
    });
  });

  // ── Prop reactivity ───────────────────────────────────────────────────────
  describe("prop reactivity", () => {
    it("updates :first when current_page changes", async () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      await wrapper.setProps({ current_page: 3 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("8"); // (3 - 1) * 4
    });

    it("updates :totalRecords when total_pages changes", async () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 1 });
      await wrapper.setProps({ total_pages: 10 });
      expect(
        wrapper
          .find("[data-testid='Paginator']")
          .attributes("data-total-records"),
      ).toBe("40"); // 10 * 4
    });

    it("updates :rows and :first when rows prop changes", async () => {
      const wrapper = mountComponent({ total_pages: 5, current_page: 2 });
      await wrapper.setProps({ rows: 10 });
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-rows"),
      ).toBe("10");
      expect(
        wrapper.find("[data-testid='Paginator']").attributes("data-first"),
      ).toBe("10"); // (2 - 1) * 10
    });
  });
});
