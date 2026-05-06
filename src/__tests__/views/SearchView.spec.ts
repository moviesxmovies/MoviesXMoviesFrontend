import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SearchView from "@/views/SearchView.vue";
import { ref } from "vue";

vi.mock("@/views/SearchMovieView.vue", () => ({
  default: { template: '<div data-testid="search-movie-view" />' },
}));
vi.mock("@/views/SearchMovieListsView.vue", () => ({
  default: { template: '<div data-testid="search-movie-lists-view" />' },
}));
vi.mock("@/views/SearchUsersView.vue", () => ({
  default: { template: '<div data-testid="search-users-view" />' },
}));

vi.mock("@/utils/debounce", () => ({
  default: (fn: Function) => fn,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockPush = vi.fn();
const mockQuery = ref<Record<string, string>>({});

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: vi.fn(() => ({ push: mockPush })),
    useRoute: vi.fn(() => ({ query: mockQuery.value, path: "/search" })),
  };
});

const createWrapper = (query: Record<string, string> = {}) => {
  mockQuery.value = query;

  return mount(SearchView, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { teleport: true },
    },
  });
};

beforeEach(() => {
  mockPush.mockClear();
  mockQuery.value = {};
});

describe("SearchView", () => {
  describe("initial render", () => {
    it("renders the search input", () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true);
    });

    it("renders all type options", () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll(".p-togglebutton");
      expect(buttons.map((b) => b.text())).toEqual([
        "search.movies",
        "search.users",
        "search.lists",
        "search.actors",
        "search.directors",
      ]);
    });

    it("shows SearchMovieView by default", () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="search-movie-view"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="search-users-view"]').exists()).toBe(
        false,
      );
    });

    it("shows SearchUsersView when type is users", () => {
      const wrapper = createWrapper({ type: "users" });
      expect(wrapper.find('[data-testid="search-users-view"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="search-movie-view"]').exists()).toBe(
        false,
      );
    });

    it("shows SearchMovieListsView when type is lists", () => {
      const wrapper = createWrapper({ type: "lists" });
      expect(
        wrapper.find('[data-testid="search-movie-lists-view"]').exists(),
      ).toBe(true);
      expect(wrapper.find('[data-testid="search-movie-view"]').exists()).toBe(
        false,
      );
    });
  });

  describe("search input", () => {
    it("initializes search from name query param", () => {
      const wrapper = createWrapper({ name: "inception" });
      const input = wrapper.find('[data-testid="search-input"]');
      expect((input.element as HTMLInputElement).value).toBe("inception");
    });

    it("shows clear button when search has value", () => {
      const wrapper = createWrapper({ name: "inception" });
      expect(wrapper.find(".clear-btn").exists()).toBe(true);
    });

    it("hides clear button when search is empty", () => {
      const wrapper = createWrapper();
      expect(wrapper.find(".clear-btn").exists()).toBe(false);
    });

    it("clears search when clear button is clicked", async () => {
      const wrapper = createWrapper({ name: "inception" });
      await wrapper.find(".clear-btn").trigger("click");
      const input = wrapper.find('[data-testid="search-input"]');
      expect((input.element as HTMLInputElement).value).toBe("");
    });

    it("updates route with name when user types", async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="search-input"]').setValue("batman");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ name: "batman", page: 1 }),
        }),
      );
    });

    it("sets name to undefined when search is cleared", async () => {
      const wrapper = createWrapper({ name: "batman" });
      await wrapper.find(".clear-btn").trigger("click");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ name: undefined }),
        }),
      );
    });
  });

  describe("type selector", () => {
    it("defaults type to movies when no query param", () => {
      const wrapper = createWrapper();
      expect((wrapper.vm as any).type).toBe("movies");
    });

    it("initializes type from query param", () => {
      const wrapper = createWrapper({ type: "users" });
      expect((wrapper.vm as any).type).toBe("users");
    });

    it("updates route with new type on change", async () => {
      const wrapper = createWrapper();
      await (wrapper.vm as any).updateRoute("users");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ type: "users", page: 1 }),
        }),
      );
    });

    it("preserves existing query params when changing type", async () => {
      const wrapper = createWrapper({ name: "batman" });
      await (wrapper.vm as any).updateRoute("actors");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            name: "batman",
            type: "actors",
            page: 1,
          }),
        }),
      );
    });

    it("updates type and route when an option is clicked", async () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll(".p-togglebutton");
      await buttons[1].trigger("click");

      expect((wrapper.vm as any).type).toBe("users");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ type: "users", page: 1 }),
        }),
      );
    });

    it("syncs v-model and triggers updateRoute on SelectButton change", async () => {
      const wrapper = createWrapper();
      const selectButton = wrapper.findComponent({ name: "SelectButton" });

      await selectButton.vm.$emit("update:modelValue", "actors");
      await selectButton.vm.$emit("change", { value: "actors" });

      expect((wrapper.vm as any).type).toBe("actors");
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ type: "actors" }),
        }),
      );
    });
  });
});
