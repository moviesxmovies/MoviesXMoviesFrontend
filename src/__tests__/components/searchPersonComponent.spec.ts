import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchPersonComponent from "@/components/searchPersonComponent.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockCelebritySearching = vi.fn();
vi.mock("@/repositories/personRepository", () => ({
    celebritySearching: (...args: any[]) => mockCelebritySearching(...args),
}));

const mockDebounce = vi.fn((fn: (...args: any[]) => any) => fn);
vi.mock("@/utils/debounce", () => ({ default: (fn: any, _ms: number) => mockDebounce(fn) }));

vi.mock("vue-i18n", () => ({
    useI18n: () => ({ t: (k: string) => k }),
}));

const mockToastAdd = vi.fn();
vi.mock("primevue", () => ({
    useToast: () => ({ add: mockToastAdd }),
}));

vi.mock("@/components/multiSelectPeopleComponent.vue", () => ({
    default: {
        name: "multiSelectPeopleComponent",
        props: ["message", "isLoading", "items", "modelValue", "type"],
        emits: ["update:modelValue", "filter", "change"],
        template: `
            <div data-testid="multiSelectPeopleComponent"
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
        { slug: "bob",   name: "Bob"   },
    ],
    count: 2,
};

const mountComponent = (props = {}) =>
    mount(SearchPersonComponent, {
        props,
        global: { stubs: { teleport: true } },
    });

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SearchPersonComponent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCelebritySearching.mockResolvedValue(PERSONS_PAGE);
    });

    // ── onMounted ─────────────────────────────────────────────────────────────

    describe("onMounted", () => {
        it("calls celebritySearching with no arguments on mount", async () => {
            mountComponent();
            await flushPromises();
            expect(mockCelebritySearching).toHaveBeenCalledOnce();
            expect(mockCelebritySearching).toHaveBeenCalledWith("");
        });

        it("renders MultiSelectPeopleComponent", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").exists()).toBe(true);
        });

        it("passes isLoading=false after successful fetch", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").attributes("data-is-loading")).toBe("false");
        });

        it("passes the correct type prop", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").attributes("data-type")).toBe("person");
        });

        it("passes the i18n message prop", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").attributes("data-message")).toBe(
                "components.searchPersons.persons"
            );
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
                detail: "components.searchPersons.getPersonsError",
            });
        });

        it("resets isLoading to false after error", async () => {
            mockCelebritySearching.mockRejectedValueOnce(new Error("fail"));
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").attributes("data-is-loading")).toBe("false");
        });
    });

    // ── fetchPersons guard ────────────────────────────────────────────────────

    describe("fetchPersons — concurrent call guard", () => {
        it("does not make a second API call if already loading", async () => {
            let resolve!: (v: any) => void;
            mockCelebritySearching.mockReturnValueOnce(new Promise((r) => (resolve = r)));
            const wrapper = mountComponent();

            // Trigger a filter event while the first call is still pending
            await wrapper.find("[data-testid='emit-filter']").trigger("click");

            // Only the initial onMounted call should have fired
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

            // Second call triggered by the filter event
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

            // Simulate the parent driving v-model to pre-select persons
            await wrapper.findComponent({ name: "multiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                PERSONS_PAGE.results
            );
            await wrapper.find("[data-testid='emit-change']").trigger("click");
            await flushPromises();

            const emitted = wrapper.emitted("update:modelValue");
            expect(emitted).toBeTruthy();
            expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
        });

        it("emits filterPersons with slugs when selection changes", async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.findComponent({ name: "multiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                PERSONS_PAGE.results
            );
            await wrapper.find("[data-testid='emit-change']").trigger("click");
            await flushPromises();

            const emitted = wrapper.emitted("filterPersons");
            expect(emitted).toBeTruthy();
            expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
        });

        it("emits empty arrays when selection is cleared", async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.findComponent({ name: "multiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                []
            );
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
            expect(wrapper.find("[data-testid='multiSelectPeopleComponent']").exists()).toBe(true);
        });
    });
});