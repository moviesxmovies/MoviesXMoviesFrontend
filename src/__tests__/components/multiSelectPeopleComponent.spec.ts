import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MultiSelectPeopleComponent from "@/components/multiSelectPeopleComponent.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockDebounce = vi.fn((fn: () => void) => fn());
vi.mock("@/utils/debounce", () => ({ default: (fn: any, _ms: number) => mockDebounce(fn) }));

vi.mock("vue-i18n", () => ({
    useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", async () => {
    const { defineComponent, h } = await import("vue");

    return {
        MultiSelect: defineComponent({
            name: "MultiSelect",
            props: [
                "modelValue", "options", "optionLabel", "loading",
                "display", "filter", "autoFilter", "placeholder",
                "maxSelectedLabels", "appendTo",
            ],
            emits: ["update:modelValue", "filter"],
            setup(props, { slots, emit }) {
                return () =>
                    h("div", { "data-testid": "MultiSelect", "data-loading": String(props.loading) }, [
                        // Render named slots so we can test them
                        slots.empty?.(),
                        slots.emptyfilter?.(),
                        // Render each option slot entry
                        ...(props.options ?? []).map((option: any) =>
                            slots.option?.({ option })
                        ),
                        // Render chip slot for each selected value
                        ...(props.modelValue ?? []).map((value: any) =>
                            slots.chip?.({ value })
                        ),
                        // Helper buttons to trigger events from tests
                        h("button", {
                            "data-testid": "trigger-filter",
                            onClick: () => emit("filter", { value: "search term" }),
                        }),
                        h("button", {
                            "data-testid": "trigger-update-model",
                            onClick: () => emit("update:modelValue", props.options ?? []),
                        }),
                    ]);
            },
        }),
    };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PERSONS = [
    { slug: "alice", name: "Alice", image: "alice.jpg" },
    { slug: "bob",   name: "Bob",   image: "bob.jpg"   },
];

const USERS = [
    { username: "charlie", picture: "charlie.jpg" },
    { username: "diana",   picture: "diana.jpg"   },
];

const mountPerson = (overrides = {}) =>
    mount(MultiSelectPeopleComponent, {
        props: {
            modelValue: [],
            isLoading: false,
            items: PERSONS,
            message: "Search persons",
            type: "person" as const,
            ...overrides,
        },
        global: {
            stubs: { teleport: true },
            mocks: { $t: (k: string) => k },
        },
    });

const mountUser = (overrides = {}) =>
    mount(MultiSelectPeopleComponent, {
        props: {
            modelValue: [],
            isLoading: false,
            items: USERS,
            message: "Search users",
            type: "user" as const,
            ...overrides,
        },
        global: {
            stubs: { teleport: true },
            mocks: { $t: (k: string) => k },
        },
    });

// ── Tests ────────────────────────────────────────────────────────────────────

describe("MultiSelectPeopleComponent", () => {
    beforeEach(() => vi.clearAllMocks());

    // ── rendering ─────────────────────────────────────────────────────────────

    describe("rendering", () => {
        it("renders MultiSelect", () => {
            const wrapper = mountPerson();
            expect(wrapper.find("[data-testid='MultiSelect']").exists()).toBe(true);
        });

        it("passes loading=false when isLoading is false", () => {
            const wrapper = mountPerson({ isLoading: false });
            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("false");
        });

        it("passes loading=true when isLoading is true", () => {
            const wrapper = mountPerson({ isLoading: true });
            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("true");
        });
    });

    // ── showLoading computed ──────────────────────────────────────────────────

    describe("showLoading", () => {
        it("is true when isLoading prop is true", () => {
            const wrapper = mountPerson({ isLoading: true });
            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("true");
        });

        it("is true while isSearching (after filter event, before isLoading resets)", async () => {
            const wrapper = mountPerson({ isLoading: false });
            await wrapper.find("[data-testid='trigger-filter']").trigger("click");
            // isSearching=true but isLoading still false → showLoading must be true
            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("true");
        });

        it("resets isSearching when isLoading goes from true to false", async () => {
            const wrapper = mountPerson({ isLoading: false });
            await wrapper.find("[data-testid='trigger-filter']").trigger("click");

            // Simulate parent completing the fetch
            await wrapper.setProps({ isLoading: true });
            await wrapper.setProps({ isLoading: false });

            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("false");
        });
    });

    // ── handleFilter ──────────────────────────────────────────────────────────

    describe("handleFilter", () => {
        it("sets isSearching to true on filter event", async () => {
            const wrapper = mountPerson();
            await wrapper.find("[data-testid='trigger-filter']").trigger("click");
            expect(wrapper.find("[data-testid='MultiSelect']").attributes("data-loading")).toBe("true");
        });

        it("emits search with the filter event payload via debounce", async () => {
            const wrapper = mountPerson();
            await wrapper.find("[data-testid='trigger-filter']").trigger("click");
            expect(wrapper.emitted("search")).toBeTruthy();
            expect(wrapper.emitted("search")![0][0]).toEqual({ value: "search term" });
        });

        it("calls debounce when filtering", async () => {
            const wrapper = mountPerson();
            await wrapper.find("[data-testid='trigger-filter']").trigger("click");
            expect(mockDebounce).toHaveBeenCalled();
        });
    });

    // ── handleSelectionChange ─────────────────────────────────────────────────

    describe("handleSelectionChange", () => {
        it("emits update:modelValue with the new value", async () => {
            const wrapper = mountPerson({ items: PERSONS });
            await wrapper.find("[data-testid='trigger-update-model']").trigger("click");
            expect(wrapper.emitted("update:modelValue")).toBeTruthy();
            expect(wrapper.emitted("update:modelValue")![0][0]).toEqual(PERSONS);
        });

        it("emits change after update:modelValue", async () => {
            const wrapper = mountPerson({ items: PERSONS });
            await wrapper.find("[data-testid='trigger-update-model']").trigger("click");
            expect(wrapper.emitted("change")).toBeTruthy();
        });
    });

    // ── removeItem ────────────────────────────────────────────────────────────

    describe("removeItem — type person", () => {
        it("removes the correct person by slug and emits update:modelValue", async () => {
            const wrapper = mountPerson({ modelValue: [...PERSONS] });
            // Click the × on Alice's chip
            await wrapper.findAll(".pi-times")[0].trigger("click");
            const emitted = wrapper.emitted("update:modelValue");
            expect(emitted).toBeTruthy();
            // Alice removed → only Bob remains
            expect(emitted![0][0]).toEqual([PERSONS[1]]);
        });

        it("emits change after removing a person", async () => {
            const wrapper = mountPerson({ modelValue: [...PERSONS] });
            await wrapper.findAll(".pi-times")[0].trigger("click");
            expect(wrapper.emitted("change")).toBeTruthy();
        });

        it("results in empty array when the only person is removed", async () => {
            const wrapper = mountPerson({ modelValue: [PERSONS[0]] });
            await wrapper.find(".pi-times").trigger("click");
            expect(wrapper.emitted("update:modelValue")![0][0]).toEqual([]);
        });
    });

    describe("removeItem — type user", () => {
        it("removes the correct user by username and emits update:modelValue", async () => {
            const wrapper = mountUser({ modelValue: [...USERS] });
            await wrapper.findAll(".pi-times")[0].trigger("click");
            const emitted = wrapper.emitted("update:modelValue");
            expect(emitted).toBeTruthy();
            // Charlie removed → only Diana remains
            expect(emitted![0][0]).toEqual([USERS[1]]);
        });

        it("emits change after removing a user", async () => {
            const wrapper = mountUser({ modelValue: [...USERS] });
            await wrapper.findAll(".pi-times")[0].trigger("click");
            expect(wrapper.emitted("change")).toBeTruthy();
        });
    });

    // ── option slot ───────────────────────────────────────────────────────────

    describe("option slot — type person", () => {
        it("renders option name for persons", () => {
            const wrapper = mountPerson({ items: PERSONS });
            expect(wrapper.text()).toContain("Alice");
            expect(wrapper.text()).toContain("Bob");
        });

        it("renders option image for persons", () => {
            const wrapper = mountPerson({ items: PERSONS });
            const imgs = wrapper.findAll("img");
            expect(imgs.some((img) => img.attributes("src") === "alice.jpg")).toBe(true);
        });
    });

    describe("option slot — type user", () => {
        it("renders username for users", () => {
            const wrapper = mountUser({ items: USERS });
            expect(wrapper.text()).toContain("charlie");
            expect(wrapper.text()).toContain("diana");
        });

        it("renders picture for users", () => {
            const wrapper = mountUser({ items: USERS });
            const imgs = wrapper.findAll("img");
            expect(imgs.some((img) => img.attributes("src") === "charlie.jpg")).toBe(true);
        });
    });

    // ── chip slot ─────────────────────────────────────────────────────────────

    describe("chip slot — type person", () => {
        it("renders chip label with person name", () => {
            const wrapper = mountPerson({ modelValue: [PERSONS[0]] });
            expect(wrapper.text()).toContain("Alice");
        });

        it("renders chip image with person image", () => {
            const wrapper = mountPerson({ modelValue: [PERSONS[0]] });
            const imgs = wrapper.findAll("img");
            expect(imgs.some((img) => img.attributes("src") === "alice.jpg")).toBe(true);
        });
    });

    describe("chip slot — type user", () => {
        it("renders chip label with username", () => {
            const wrapper = mountUser({ modelValue: [USERS[0]] });
            expect(wrapper.text()).toContain("charlie");
        });

        it("renders chip image with user picture", () => {
            const wrapper = mountUser({ modelValue: [USERS[0]] });
            const imgs = wrapper.findAll("img");
            expect(imgs.some((img) => img.attributes("src") === "charlie.jpg")).toBe(true);
        });
    });

    // ── empty / emptyfilter slots ─────────────────────────────────────────────

    describe("empty slot", () => {
        it("shows loading spinner when showLoading is true", async () => {
            const wrapper = mountPerson({ isLoading: true });
            expect(wrapper.find(".pi-spinner").exists()).toBe(true);
        });

        it("shows no-results icon when showLoading is false", () => {
            const wrapper = mountPerson({ isLoading: false });
            expect(wrapper.find(".pi-search").exists()).toBe(true);
        });

        it("shows i18n loading text when loading", () => {
            const wrapper = mountPerson({ isLoading: true });
            expect(wrapper.text()).toContain("loading");
        });

        it("shows i18n noResults text when not loading", () => {
            const wrapper = mountPerson({ isLoading: false });
            expect(wrapper.text()).toContain("search.empty");
        });
    });
});