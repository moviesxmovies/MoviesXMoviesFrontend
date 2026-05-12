import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddToListDialog from "@/components/addToListDialog.vue"; // adjust path if needed
import type { Movie, UserMovieList } from "@/types";

// ── Repository mocks ──────────────────────────────────────────────────────────

const mockAddMovieToList = vi.fn();
const mockRemoveMovieFromList = vi.fn();
const mockFetchUserLists = vi.fn();
const mockFetchMovieListsFromMovie = vi.fn();
const mockToastAdd = vi.fn();
const mockAuthStore = { user: { username: "testuser" } };

vi.mock("@/repositories/listRepository", () => ({
  addMovieToList: (...a: unknown[]) => mockAddMovieToList(...a),
  removeMovieFromList: (...a: unknown[]) => mockRemoveMovieFromList(...a),
  fetchUserLists: (...a: unknown[]) => mockFetchUserLists(...a),
  fetchMovieListsFromMovie: (...a: unknown[]) =>
    mockFetchMovieListsFromMovie(...a),
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => mockAuthStore,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (k: string, args?: unknown[]) => (args ? `${k}:${args}` : k),
  }),
}));

vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");

  return {
    // The Dialog stub must react to the `visible` prop that the component
    // passes via v-model:visible.
    Dialog: defineComponent({
      name: "Dialog",
      props: [
        "visible",
        "modal",
        "draggable",
        "dismissableMask",
        "header",
        "style",
        "pt",
      ],
      emits: ["update:visible"],
      setup(props, { slots }) {
        return () =>
          props.visible
            ? h("div", { "data-testid": "Dialog" }, [
              h("div", { "data-testid": "dialog-header" }, props.header),
              slots.default?.(),
              slots.footer?.(),
            ])
            : null;
      },
    }),
    useToast: () => ({ add: mockToastAdd }),
  };
});

// ── Child component stubs ─────────────────────────────────────────────────────

vi.mock("@/components/createListDialog.vue", () => ({
  default: {
    name: "CreateListDialog",
    props: ["movie", "visible"],
    emits: ["update:visible", "reloadLists"],
    template: `<div data-testid="CreateListDialog" />`,
  },
}));

vi.mock("@/components/listComponent.vue", () => ({
  default: {
    name: "ListComponent",
    props: ["items", "loading"],
    emits: ["add", "remove"],
    template: `
      <div data-testid="ListComponent"
        :data-loading="loading"
        :data-items-count="items?.length"
      />
    `,
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const movie: Movie = { id: 1, title: "Inception", slug: "inception" } as Movie;

const makeLists = (slugs: string[]) =>
  slugs.map((slug, i) => ({ id: i + 1, name: `List ${i + 1}`, slug }));

// ── Mount helper ──────────────────────────────────────────────────────────────
// `visible` is declared as defineModel<boolean>("visible") in the component.
// Vue Test Utils handles defineModel the same way as a v-model prop:
//   - pass the current value as the prop name ("visible")
//   - pass an "onUpdate:visible" handler so emitted updates don't warn
const mountComponent = (visible = true, movieOverride?: Partial<Movie>) =>
  mount(AddToListDialog, {
    props: {
      visible,
      "onUpdate:visible": vi.fn(),
      movie: { ...movie, ...movieOverride },
    },
    global: { stubs: { teleport: true } },
  });

// ─────────────────────────────────────────────────────────────────────────────
describe("AddToListDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchUserLists.mockResolvedValue({
      results: makeLists(["list-1", "list-2"]),
      next_last_id: undefined,
      count: 2,
    });
    mockFetchMovieListsFromMovie.mockResolvedValue([]);
  });

  // ── Visibility ────────────────────────────────────────────────────────────
  describe("visibility", () => {
    it("renders the Dialog when visible is true", async () => {
      const wrapper = mountComponent(true);
      await flushPromises();
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
    });

    it("does not render the Dialog when visible is false", async () => {
      const wrapper = mountComponent(false);
      await flushPromises();
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(false);
    });

    it("always renders CreateListDialog regardless of visibility", async () => {
      const wrapper = mountComponent(false);
      await flushPromises();
      expect(wrapper.find("[data-testid='CreateListDialog']").exists()).toBe(
        true,
      );
    });
  });

  // ── onMounted / immediate watch ───────────────────────────────────────────
  describe("initial data loading (immediate watch)", () => {
    it("calls fetchUserLists with the user's username on mount", async () => {
      mountComponent();
      await flushPromises();
      expect(mockFetchUserLists).toHaveBeenCalledWith("testuser", undefined);
    });

    it("calls fetchMovieListsFromMovie with the movie slug on mount", async () => {
      mountComponent();
      await flushPromises();
      expect(mockFetchMovieListsFromMovie).toHaveBeenCalledWith("inception");
    });

    it("passes the fetched lists to ListComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const list = wrapper.find("[data-testid='ListComponent']");
      expect(list.attributes("data-items-count")).toBe("2");
    });

    it("marks containsMovie correctly based on fetchMovieListsFromMovie", async () => {
      mockFetchMovieListsFromMovie.mockResolvedValue(["list-1"]);
      const wrapper = mountComponent();
      await flushPromises();
      const vm = wrapper.vm as unknown as { userList: UserMovieList[] };
      expect(
        vm.userList.find((u) => u.list.slug === "list-1")?.containsMovie,
      ).toBe(true);
      expect(
        vm.userList.find((u) => u.list.slug === "list-2")?.containsMovie,
      ).toBe(false);
    });

    it("shows the loading state in ListComponent while fetching", async () => {
      mockFetchUserLists.mockReturnValue(new Promise(() => { }));
      const wrapper = mountComponent();
      // Don't flush — check intermediate loading=true state
      const list = wrapper.find("[data-testid='ListComponent']");
      expect(list.attributes("data-loading")).toBe("true");
    });

    it("sets loading to false after fetch completes", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const list = wrapper.find("[data-testid='ListComponent']");
      expect(list.attributes("data-loading")).toBe("false");
    });
  });

  // ── Watch on movie prop ───────────────────────────────────────────────────
  describe("watch on movie prop", () => {
    it("reloads data when the movie prop changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      mockFetchUserLists.mockClear();
      mockFetchMovieListsFromMovie.mockClear();

      await wrapper.setProps({ movie: { ...movie, slug: "interstellar" } });
      await flushPromises();

      expect(mockFetchUserLists).toHaveBeenCalledTimes(1);
      expect(mockFetchMovieListsFromMovie).toHaveBeenCalledWith("interstellar");
    });

    it("emits update:visible with false when movie changes", async () => {
      const wrapper = mountComponent(true);
      await flushPromises();

      await wrapper.setProps({ movie: { ...movie, slug: "interstellar" } });
      await flushPromises();

      // defineModel emits "update:visible" when visible.value is set internally
      expect(wrapper.emitted("update:visible")).toBeTruthy();
      expect(wrapper.emitted("update:visible").at(-1)).toEqual([false]);
    });
  });

  // ── addToList ─────────────────────────────────────────────────────────────
  describe("addToList", () => {
    it("calls addMovieToList with username, listSlug and movieSlug", async () => {
      mockAddMovieToList.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("add", "list-1");
      await flushPromises();

      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "testuser",
        "list-1",
        "inception",
      );
    });

    it("refreshes the movie-in-lists check after adding", async () => {
      mockAddMovieToList.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      mockFetchMovieListsFromMovie.mockClear();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("add", "list-1");
      await flushPromises();

      expect(mockFetchMovieListsFromMovie).toHaveBeenCalledTimes(1);
    });

    it("shows an error toast with server message when addMovieToList fails", async () => {
      mockAddMovieToList.mockRejectedValue({
        response: { data: { message: "Already in list" } },
      });
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("add", "list-1");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Already in list",
        }),
      );
    });

    it("shows the i18n fallback error when addMovieToList fails without a server message", async () => {
      mockAddMovieToList.mockRejectedValue(new Error("network"));
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("add", "list-1");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: expect.stringContaining("components.addToList.error"),
        }),
      );
    });
  });

  // ── removeFromList ────────────────────────────────────────────────────────
  describe("removeFromList", () => {
    it("calls removeMovieFromList with username, listSlug and movieSlug", async () => {
      mockRemoveMovieFromList.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("remove", "list-2");
      await flushPromises();

      expect(mockRemoveMovieFromList).toHaveBeenCalledWith(
        "testuser",
        "list-2",
        "inception",
      );
    });

    it("refreshes the movie-in-lists check after removing", async () => {
      mockRemoveMovieFromList.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();
      mockFetchMovieListsFromMovie.mockClear();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("remove", "list-2");
      await flushPromises();

      expect(mockFetchMovieListsFromMovie).toHaveBeenCalledTimes(1);
    });

    it("shows an error toast with server message when removeMovieFromList fails", async () => {
      mockRemoveMovieFromList.mockRejectedValue({
        response: { data: { message: "Not in list" } },
      });
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("remove", "list-2");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Not in list" }),
      );
    });

    it("shows the i18n fallback error when removeMovieFromList fails without a server message", async () => {
      mockRemoveMovieFromList.mockRejectedValue(new Error("network"));
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("remove", "list-2");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.addToList.removeFromListError",
        }),
      );
    });
  });

  // ── fetchUserLists error ──────────────────────────────────────────────────
  describe("getUserLists error", () => {
    it("shows an error toast with server message when fetchUserLists fails", async () => {
      mockFetchUserLists.mockRejectedValue({
        response: { data: { message: "Unauthorized" } },
      });
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Unauthorized" }),
      );
    });

    it("shows the i18n fallback error when fetchUserLists fails without a server message", async () => {
      mockFetchUserLists.mockRejectedValue(new Error("network"));
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.addToList.fetchListsError",
        }),
      );
    });

    it("sets loading to false even when fetchUserLists fails", async () => {
      mockFetchUserLists.mockRejectedValue(new Error("fail"));
      const wrapper = mountComponent();
      await flushPromises();

      const list = wrapper.find("[data-testid='ListComponent']");
      expect(list.attributes("data-loading")).toBe("false");
    });
  });

  // ── checkMovieInLists error ───────────────────────────────────────────────
  describe("checkMovieInLists error", () => {
    it("shows an error toast when fetchMovieListsFromMovie fails", async () => {
      mockFetchMovieListsFromMovie.mockRejectedValue({
        response: { data: { message: "Movie not found" } },
      });
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Movie not found",
        }),
      );
    });

    it("shows the i18n fallback error when fetchMovieListsFromMovie fails without a server message", async () => {
      mockFetchMovieListsFromMovie.mockRejectedValue(new Error("network"));
      mountComponent();
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "components.addToList.fetchListsError",
        }),
      );
    });
  });

  // ── Create list button ────────────────────────────────────────────────────
  describe("create list button", () => {
    it("opens CreateListDialog when the create button is clicked", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await flushPromises();

      const createDialog = wrapper.findComponent({ name: "CreateListDialog" });
      expect(createDialog.props("visible")).toBe(true);
    });
  });

  // ── reloadLists event from CreateListDialog ───────────────────────────────
  describe("reloadData via @reloadLists", () => {
    it("reloads user lists when CreateListDialog emits reloadLists", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      mockFetchUserLists.mockClear();
      mockFetchMovieListsFromMovie.mockClear();

      await wrapper
        .findComponent({ name: "CreateListDialog" })
        .vm.$emit("reloadLists");
      await flushPromises();

      expect(mockFetchUserLists).toHaveBeenCalledTimes(1);
      expect(mockFetchMovieListsFromMovie).toHaveBeenCalledTimes(1);
    });
  });

  // ── authStore username fallback ───────────────────────────────────────────
  describe("authStore username fallback", () => {
    it("uses empty string as username when user is null", async () => {
      mockAuthStore.user = null as unknown as typeof mockAuthStore.user;
      mockAddMovieToList.mockResolvedValue({});
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "ListComponent" })
        .vm.$emit("add", "list-1");
      await flushPromises();

      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "",
        "list-1",
        "inception",
      );
    });
  });
});
