import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import ListComponent from "@/components/listComponent.vue"; // ajusta la ruta
import type { UserMovieList } from "@/types";

vi.mock("@/repositories/listRepository", () => ({
  privacityConfig: {
    P: { text: "Public",  icon: "pi pi-globe",  class: "badge-public"  },
    R: { text: "Friends", icon: "pi pi-users",  class: "badge-friends" },
    F: { text: "Private", icon: "pi pi-lock",   class: "badge-private" },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");

  const stub = (name: string, extra: string[] = []) =>
    defineComponent({
      name,
      props: ["height", "class", "binary", "modelValue", "style", ...extra],
      setup(_, { slots }) {
        return () => h("div", { "data-testid": name }, slots.default?.());
      },
    });

  return {
    Skeleton:    stub("Skeleton"),
    ScrollPanel: stub("ScrollPanel"),
    Checkbox:    defineComponent({
      name: "Checkbox",
      props: ["binary", "modelValue", "class"],
      template: `<input
        type="checkbox"
        data-testid="checkbox"
        :checked="modelValue"
        @click.stop
      />`,
    }),
  };
});

// ── Factories ─────────────────────────────────────────────────────────────────
const makeItem = (
  id: number,
  containsMovie: boolean,
  privacity: "P" | "R" | "F" | null = "P"
): UserMovieList =>
  ({
    containsMovie,
    list: { id, name: `List ${id}`, slug: `list-${id}`, privacity },
  } as unknown as UserMovieList);

const mountComponent = (props: Record<string, unknown> = {}) =>
  mount(ListComponent, {
    props: { items: [], loading: false, ...props },
  });

describe("ListComponent", () => {
  describe("loading state", () => {
    it("Shows 5 skeletons when loading is true", () => {
      const wrapper = mountComponent({ loading: true });
      expect(wrapper.findAll("[data-testid='Skeleton']")).toHaveLength(5);
    });

    it("Doesn't show ScrollPanel when loading is true", () => {
      const wrapper = mountComponent({ loading: true });
      expect(wrapper.find("[data-testid='ScrollPanel']").exists()).toBe(false);
    });

    it("Doesn't show skeletons when loading is false", () => {
      const wrapper = mountComponent({ loading: false, items: [] });
      expect(wrapper.findAll("[data-testid='Skeleton']")).toHaveLength(0);
    });

    it("Shows ScrollPanel when loading is false", () => {
      const wrapper = mountComponent({ loading: false, items: [] });
      expect(wrapper.find("[data-testid='ScrollPanel']").exists()).toBe(true);
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────
  describe("empty state", () => {
    it("Shows empty-state when no items and loading is false", () => {
      const wrapper = mountComponent({ items: [], loading: false });
      expect(wrapper.find(".empty-state").exists()).toBe(true);
    });

    it("Shows empty-state info", () => {
      const wrapper = mountComponent({ items: [], loading: false });
      expect(wrapper.find(".empty-title").text()).toBe("components.lists.noLists");
      expect(wrapper.find(".empty-desc").text()).toBe("components.lists.noListsDesc");
    });

    it("Doesn't show empty state when list is not empty", () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)], loading: false });
      expect(wrapper.find(".empty-state").exists()).toBe(false);
    });

    it("Doesn't show empty-state when loading", () => {
      const wrapper = mountComponent({ items: [], loading: true });
      expect(wrapper.find(".empty-state").exists()).toBe(false);
    });
  });

  // ── Items rendering ────────────────────────────────────────────────────
  describe("items rendering", () => {
    it("Renders a list-item per element of the list", () => {
      const items = [makeItem(1, false), makeItem(2, true), makeItem(3, false)];
      const wrapper = mountComponent({ items });
      expect(wrapper.findAll(".list-item")).toHaveLength(3);
    });

    it("Shows the name of each list", () => {
      const items = [makeItem(1, false), makeItem(2, false)];
      const wrapper = mountComponent({ items });
      const names = wrapper.findAll(".list-name").map((w) => w.text().trim());
      expect(names).toContain("List 1");
      expect(names).toContain("List 2");
    });

    it("Applies item-selected when containsMovie is true", () => {
      const wrapper = mountComponent({ items: [makeItem(1, true)] });
      expect(wrapper.find(".list-item").classes()).toContain("item-selected");
    });

    it("Doesn't applu item-selected when containsMovie is false", () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)] });
      expect(wrapper.find(".list-item").classes()).not.toContain("item-selected");
    });

    it("Shows pi-check icon when containsMovie is true", () => {
      const wrapper = mountComponent({ items: [makeItem(1, true)] });
      expect(wrapper.find(".main-icon").classes()).toContain("pi-check");
    });

    it("Shows pi-bookmark icon when containsMovie is false", () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)] });
      expect(wrapper.find(".main-icon").classes()).toContain("pi-bookmark");
    });
  });

  // ── Privacity badge ─────────────────────────────────────────────────────────
  describe("privacity badge", () => {
    it.each([
      ["P", "badge-public",  "Public"],
      ["R", "badge-friends", "Friends"],
      ["F", "badge-private", "Private"],
    ] as const)(
      "privacity shows class and text",
      (privacity, cssClass, text) => {
        const wrapper = mountComponent({ items: [makeItem(1, false, privacity)] });
        const badge = wrapper.find(".privacity-badge");
        expect(badge.classes()).toContain(cssClass);
        expect(badge.text()).toContain(text);
      }
    );

    it("Doesn't render badge if privacy is null", () => {
      const wrapper = mountComponent({ items: [makeItem(1, false, null)] });
      expect(wrapper.find(".privacity-badge").exists()).toBe(false);
    });
  });

  // ── Checkbox ────────────────────────────────────────────────────────────────
  describe("checkbox", () => {
    it("Marked checkboxwhen containsMovie is true", () => {
      const wrapper = mountComponent({ items: [makeItem(1, true)] });
      const checkbox = wrapper.find("[data-testid='checkbox']") as ReturnType<typeof wrapper.find>;
      expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    });

    it("Doesn't show checked checkbox when containsMovie is false", () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)] });
      const checkbox = wrapper.find("[data-testid='checkbox']");
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });
  });

  // ── Emitted events ────────────────────────────────────────────────────────
  describe("emitted events", () => {
    it("emits 'add'when when list is clicked", async () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)] });
      await wrapper.find(".list-item").trigger("click");
      expect(wrapper.emitted("add")).toBeTruthy();
      expect(wrapper.emitted("add")[0]).toEqual(["list-1"]);
    });

    it("emits 'remove' when checked list is clicked", async () => {
      const wrapper = mountComponent({ items: [makeItem(1, true)] });
      await wrapper.find(".list-item").trigger("click");
      expect(wrapper.emitted("remove")).toBeTruthy();
      expect(wrapper.emitted("remove")[0]).toEqual(["list-1"]);
    });

    it("Each item shows correct slug", async () => {
      const items = [makeItem(10, false), makeItem(20, true)];
      const wrapper = mountComponent({ items });
      const listItems = wrapper.findAll(".list-item");

      await listItems[0].trigger("click"); // containsMovie false → add
      await listItems[1].trigger("click"); // containsMovie true  → remove

      expect(wrapper.emitted("add")[0]).toEqual(["list-10"]);
      expect(wrapper.emitted("remove")[0]).toEqual(["list-20"]);
    });

    it("checkbox input doen't emit father events", async () => {
      const wrapper = mountComponent({ items: [makeItem(1, false)] });
      await wrapper.find("[data-testid='checkbox']").trigger("click");
      expect(wrapper.emitted("add")).toBeFalsy();
      expect(wrapper.emitted("remove")).toBeFalsy();
    });
  });
});