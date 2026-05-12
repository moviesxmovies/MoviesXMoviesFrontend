import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchPersonComponent from "@/components/searchPersonComponent.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockCelebritySearching = vi.fn();
vi.mock("@/repositories/personRepository", () => ({
  celebritySearching: (...args: any[]) => mockCelebritySearching(...args),
}));

const mockGetPersonProfile = vi.fn();
vi.mock("@/repositories/userRepository", () => ({
  getPersonProfile: (...args: any[]) => mockGetPersonProfile(...args),
}));

const mockDebounce = vi.fn((fn: (...args: any[]) => any) => fn);
vi.mock("@/utils/debounce", () => ({
  default: (fn: any, _ms: number) => mockDebounce(fn),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const mockToastAdd = vi.fn();
vi.mock("primevue", () => ({
  useToast: () => ({ add: mockToastAdd }),
}));

// Route mock — controlled per test via mockRoute.query
const mockRoute = { query: {} as Record<string, any> };
vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
}));

vi.mock("@/components/multiSelectPeopleComponent.vue", () => ({
  default: {
    name: "multiSelectPeopleComponent",
    props: ["message", "isLoading", "items", "modelValue", "type"],
    emits: ["update:modelValue", "filter", "change"],
    template: `
      <div
        data-testid="multiSelectPeopleComponent"
        :data-is-loading="String(isLoading)"
        :data-type="type"
        :data-message="message"
      >
        <button data-testid="emit-filter" @click="$emit('filter', { value: 'test query' })" />
        <button data-testid="emit-change" @click="$emit('change')" />
      </div>
    `,
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const PERSONS_PAGE = {
  results: [
    { slug: "alice", name: "Alice" },
    { slug: "bob", name: "Bob" },
  ],
  count: 2,
};

const mountComponent = (props = {}, query: Record<string, any> = {}) => {
  mockRoute.query = query;
  return mount(SearchPersonComponent, {
    props,
    global: { stubs: { teleport: true } },
  });
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SearchPersonComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockCelebritySearching.mockResolvedValue(PERSONS_PAGE);
  });

  // ── watch immediate (replaces onMounted) ──────────────────────────────────

  describe("watch immediate — no celebrities in query", () => {
    it("calls celebritySearching with empty string when query is empty", async () => {
      mountComponent();
      await flushPromises();
      expect(mockCelebritySearching).toHaveBeenCalledWith("");
    });

    it("renders MultiSelectPeopleComponent", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(
        wrapper.find("[data-testid='multiSelectPeopleComponent']").exists(),
      ).toBe(true);
    });

    it("passes isLoading=false after successful fetch", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(
        wrapper
          .find("[data-testid='multiSelectPeopleComponent']")
          .attributes("data-is-loading"),
      ).toBe("false");
    });

    it("passes the correct type prop", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(
        wrapper
          .find("[data-testid='multiSelectPeopleComponent']")
          .attributes("data-type"),
      ).toBe("person");
    });

    it("passes the i18n message prop", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(
        wrapper
          .find("[data-testid='multiSelectPeopleComponent']")
          .attributes("data-message"),
      ).toBe("search.celebrities");
    });
  });

  // ── watch: celebrities in query (pre-selection) ───────────────────────────

  describe("watch immediate — celebrities in query", () => {
    it("pre-selects a person found in the fetched results", async () => {
      mountComponent({}, { celebrities: "alice" });
      await flushPromises();

      // fetchPersons called to load the list
      expect(mockCelebritySearching).toHaveBeenCalledWith("");
      // getPersonProfile should NOT be called — alice is in results
      expect(mockGetPersonProfile).not.toHaveBeenCalled();
    });

    it("calls getPersonProfile for a slug not found in results", async () => {
      const unknownPerson = { slug: "charlie", name: "Charlie" };
      mockGetPersonProfile.mockResolvedValue(unknownPerson);

      mountComponent({}, { celebrities: "charlie" });
      await flushPromises();

      expect(mockGetPersonProfile).toHaveBeenCalledWith("charlie");
    });

    it("handles array of celebrities in query", async () => {
      const unknownPerson = { slug: "charlie", name: "Charlie" };
      mockGetPersonProfile.mockResolvedValue(unknownPerson);

      mountComponent({}, { celebrities: ["alice", "charlie"] });
      await flushPromises();

      // alice is in results, charlie is not — only charlie needs profile fetch
      expect(mockGetPersonProfile).toHaveBeenCalledTimes(1);
      expect(mockGetPersonProfile).toHaveBeenCalledWith("charlie");
    });

    it("does not call fetchPersons again when already synced and results exist", async () => {
      // Mount once so persons.results is populated
      const wrapper = mountComponent({}, { celebrities: "alice" });
      await flushPromises();
      const callCount = mockCelebritySearching.mock.calls.length;

      // Simulate route query changing to the same value (already synced)
      mockRoute.query = { celebrities: "alice" };
      // Trigger watcher manually by updating modelValue
      await wrapper.setProps({});
      await flushPromises();

      expect(mockCelebritySearching).toHaveBeenCalledTimes(callCount);
    });
  });

  // ── fetchPersons error handling ───────────────────────────────────────────

  describe("fetchPersons — error handling", () => {
    it("shows a toast on API error with server message", async () => {
      mockCelebritySearching.mockRejectedValueOnce({
        response: { data: { message: "Server error" } },
      });
      mountComponent();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "toast.error",
        detail: "Server error",
      });
    });

    it("shows a fallback toast message when error has no response", async () => {
      mockCelebritySearching.mockRejectedValueOnce(new Error("Network failure"));
      mountComponent();
      await flushPromises();
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "toast.error",
        detail: "search.searchCelebritiesError",
      });
    });

    it("resets isLoading to false after error", async () => {
      mockCelebritySearching.mockRejectedValueOnce(new Error("fail"));
      const wrapper = mountComponent();
      await flushPromises();
      expect(
        wrapper
          .find("[data-testid='multiSelectPeopleComponent']")
          .attributes("data-is-loading"),
      ).toBe("false");
    });
  });

  // ── fetchPersons guard ────────────────────────────────────────────────────

  describe("fetchPersons — concurrent call guard", () => {
    it("does not make a second API call if already loading", async () => {
      let resolve!: (v: any) => void;
      mockCelebritySearching.mockReturnValueOnce(
        new Promise((r) => (resolve = r)),
      );
      const wrapper = mountComponent();

      // Trigger a filter event while the first call is still pending
      await wrapper.find("[data-testid='emit-filter']").trigger("click");

      // Only the initial watch call should have fired
      expect(mockCelebritySearching).toHaveBeenCalledOnce();
      resolve(PERSONS_PAGE);
      await flushPromises();
    });
  });

  // ── filter event ─────────────────────────────────────────────────────────

  describe("@filter event", () => {
    it("calls fetchPersons (via debounce) with the search value", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      mockCelebritySearching.mockResolvedValueOnce(PERSONS_PAGE);

      await wrapper.find("[data-testid='emit-filter']").trigger("click");
      await flushPromises();

      expect(mockCelebritySearching).toHaveBeenNthCalledWith(2, "test query");
    });

    it("wraps fetchPersons in debounce", () => {
      mountComponent();
      expect(mockDebounce).toHaveBeenCalledOnce();
    });
  });

  // ── onSelectionChange ─────────────────────────────────────────────────────

  describe("@change — onSelectionChange", () => {
    it("emits update:modelValue with slugs when selection changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "multiSelectPeopleComponent" })
        .vm.$emit("update:modelValue", PERSONS_PAGE.results);
      await wrapper.find("[data-testid='emit-change']").trigger("click");
      await flushPromises();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
    });

    it("emits filterPersons with slugs when selection changes", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "multiSelectPeopleComponent" })
        .vm.$emit("update:modelValue", PERSONS_PAGE.results);
      await wrapper.find("[data-testid='emit-change']").trigger("click");
      await flushPromises();

      const emitted = wrapper.emitted("filterPersons");
      expect(emitted).toBeTruthy();
      expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
    });

    it("emits empty arrays when selection is cleared", async () => {
      const wrapper = mountComponent();
      await flushPromises();

      await wrapper
        .findComponent({ name: "multiSelectPeopleComponent" })
        .vm.$emit("update:modelValue", []);
      await wrapper.find("[data-testid='emit-change']").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
      expect(wrapper.emitted("filterPersons")?.at(-1)).toEqual([[]]);
    });

    it("does not emit before any selection change", async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
      expect(wrapper.emitted("filterPersons")).toBeFalsy();
    });
  });

  // ── modelValue prop ───────────────────────────────────────────────────────

  describe("modelValue prop", () => {
    it("accepts modelValue without crashing", async () => {
      const wrapper = mountComponent({ modelValue: ["alice"] });
      await flushPromises();
      expect(
        wrapper.find("[data-testid='multiSelectPeopleComponent']").exists(),
      ).toBe(true);
    });
  });
});