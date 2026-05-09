import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchUsersComponent from "@/components/searchUsersComponent.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUserSearching = vi.fn();
vi.mock("@/repositories/userRepository", () => ({
    userSearching: (...args: any[]) => mockUserSearching(...args),
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
        name: "MultiSelectPeopleComponent",
        props: ["message", "isLoading", "items", "modelValue", "type"],
        emits: ["update:modelValue", "filter", "change"],
        template: `
            <div data-testid="MultiSelectPeopleComponent"
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

const USERS_PAGE = {
    results: [
        { username: "alice", name: "Alice" },
        { username: "bob",   name: "Bob"   },
    ],
    count: 2,
};

const mountComponent = (props = {}) =>
    mount(SearchUsersComponent, {
        props,
        global: { stubs: { teleport: true } },
    });

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SearchUsersComponent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserSearching.mockResolvedValue(USERS_PAGE);
    });

    // ── onMounted ─────────────────────────────────────────────────────────────

    describe("onMounted", () => {
        it("calls userSearching with empty name on mount", async () => {
            mountComponent();
            await flushPromises();
            expect(mockUserSearching).toHaveBeenCalledOnce();
            expect(mockUserSearching).toHaveBeenCalledWith({ name: "" });
        });

        it("renders MultiSelectPeopleComponent", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").exists()).toBe(true);
        });

        it("passes isLoading=false after successful fetch", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").attributes("data-is-loading")).toBe("false");
        });

        it("passes the correct type prop", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").attributes("data-type")).toBe("user");
        });

        it("passes the i18n message prop", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").attributes("data-message")).toBe(
                "search.users"
            );
        });
    });

    // ── fetchUsers error handling ─────────────────────────────────────────────

    describe("fetchUsers — error handling", () => {
        it("shows a toast on API error with server message", async () => {
            mockUserSearching.mockRejectedValueOnce({
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
            mockUserSearching.mockRejectedValueOnce(new Error("Network failure"));
            mountComponent();
            await flushPromises();
            expect(mockToastAdd).toHaveBeenCalledWith({
                severity: "error",
                summary: "toast.error",
                detail: "search.searchUsersError",
            });
        });

        it("resets isLoading to false after error", async () => {
            mockUserSearching.mockRejectedValueOnce(new Error("fail"));
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").attributes("data-is-loading")).toBe("false");
        });
    });

    // ── fetchUsers concurrent call guard ──────────────────────────────────────

    describe("fetchUsers — concurrent call guard", () => {
        it("does not make a second API call if already loading", async () => {
            let resolve!: (v: any) => void;
            mockUserSearching.mockReturnValueOnce(new Promise((r) => (resolve = r)));
            const wrapper = mountComponent();

            await wrapper.find("[data-testid='emit-filter']").trigger("click");

            expect(mockUserSearching).toHaveBeenCalledOnce();
            resolve(USERS_PAGE);
            await flushPromises();
        });
    });

    // ── filter event ─────────────────────────────────────────────────────────

    describe("@filter event", () => {
        it("calls fetchUsers (via debounce) with the search value", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            mockUserSearching.mockResolvedValueOnce(USERS_PAGE);

            await wrapper.find("[data-testid='emit-filter']").trigger("click");
            await flushPromises();

            expect(mockUserSearching).toHaveBeenNthCalledWith(2, { name: "test query" });
        });

        it("wraps fetchUsers in debounce", () => {
            mountComponent();
            expect(mockDebounce).toHaveBeenCalledOnce();
        });
    });

    // ── onSelectionChange ─────────────────────────────────────────────────────

    describe("@change — onSelectionChange", () => {
        it("emits update:modelValue with usernames when selection changes", async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.findComponent({ name: "MultiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                USERS_PAGE.results
            );
            await wrapper.find("[data-testid='emit-change']").trigger("click");
            await flushPromises();

            const emitted = wrapper.emitted("update:modelValue");
            expect(emitted).toBeTruthy();
            expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
        });

        it("emits filterUsers with usernames when selection changes", async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.findComponent({ name: "MultiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                USERS_PAGE.results
            );
            await wrapper.find("[data-testid='emit-change']").trigger("click");
            await flushPromises();

            const emitted = wrapper.emitted("filterUsers");
            expect(emitted).toBeTruthy();
            expect(emitted!.at(-1)).toEqual([["alice", "bob"]]);
        });

        it("emits empty arrays when selection is cleared", async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.findComponent({ name: "MultiSelectPeopleComponent" }).vm.$emit(
                "update:modelValue",
                []
            );
            await wrapper.find("[data-testid='emit-change']").trigger("click");
            await flushPromises();

            expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
            expect(wrapper.emitted("filterUsers")?.at(-1)).toEqual([[]]);
        });

        it("does not emit before any selection change", async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.emitted("update:modelValue")).toBeFalsy();
            expect(wrapper.emitted("filterUsers")).toBeFalsy();
        });
    });

    // ── modelValue prop ───────────────────────────────────────────────────────

    describe("modelValue prop", () => {
        it("accepts modelValue without crashing", async () => {
            const wrapper = mountComponent({ modelValue: ["alice"] });
            await flushPromises();
            expect(wrapper.find("[data-testid='MultiSelectPeopleComponent']").exists()).toBe(true);
        });
    });
});