import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChooseListTypeDialog from "@/components/choiceMovieListTypeModal.vue";

// ✅ Path absoluto para que Vitest intercepte la importación real
vi.mock("@/components/createListDialog.vue", () => ({
    default: {
        name: "CreateListDialog",
        props: ["visible", "movie"],
        emits: ["update:visible", "reload-lists"],
        // ✅ String(visible) — atributos HTML son siempre strings
        template: `<div data-testid="CreateListDialog" :data-visible="String(visible)" />`,
    },
}));

vi.mock("vue-i18n", () => ({
    useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("primevue", async () => {
    const { defineComponent, h } = await import("vue");

    return {
        Dialog: defineComponent({
            name: "Dialog",
            props: ["visible", "header", "modal", "closable", "dismissableMask", "draggable", "style", "pt"],
            emits: ["update:visible"],
            setup(props, { slots }) {
                return () =>
                    props.visible
                        ? h("div", { "data-testid": "Dialog" }, [
                            h("div", { "data-testid": "dialog-header" }, props.header),
                            slots.default?.(),
                        ])
                        : null;
            },
        }),
        useToast: () => ({ add: vi.fn() }),
    };
});

const mountDialog = (visible = true) =>
    mount(ChooseListTypeDialog, {
        props: { visible },
        global: {
            stubs: { teleport: true },
            // ✅ Mock del plugin global para $t — el componente usa $t en el template
            mocks: { $t: (k: string) => k },
        },
    });

describe("ChooseListTypeDialog", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("visibility", () => {
        it("renders the Dialog when visible is true", () => {
            const wrapper = mountDialog(true);
            expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
        });

        it("does not render the Dialog when visible is false", () => {
            const wrapper = mountDialog(false);
            expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(false);
        });

        it("shows correct i18n header", () => {
            const wrapper = mountDialog(true);
            expect(wrapper.find("[data-testid='dialog-header']").text()).toBe(
                "user.chooseMoviesListType"
            );
        });
    });

    describe("structure", () => {
        it("renders two list-type buttons", () => {
            const wrapper = mountDialog();
            expect(wrapper.findAll(".list-type-btn")).toHaveLength(2);
        });

        it("renders the CreateListDialog component", () => {
            const wrapper = mountDialog();
            expect(wrapper.find("[data-testid='CreateListDialog']").exists()).toBe(true);
        });

        it("CreateListDialog starts hidden", () => {
            const wrapper = mountDialog();
            expect(wrapper.find("[data-testid='CreateListDialog']").attributes("data-visible")).toBe("false");
        });
    });

    describe("normal list button", () => {
        it("opens CreateListDialog when clicking the first button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
            expect(wrapper.find("[data-testid='CreateListDialog']").attributes("data-visible")).toBe("true");
        });

        it("does not close the outer Dialog", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
            expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
        });
    });

    describe("intelligent list button", () => {
        it("does not open CreateListDialog when clicking the second button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[1].trigger("click");
            expect(wrapper.find("[data-testid='CreateListDialog']").attributes("data-visible")).toBe("false");
        });
    });

    describe("closeAllModals", () => {
        const openNormalModal = async (wrapper: ReturnType<typeof mountDialog>) => {
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
        };

        it("closes CreateListDialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await wrapper.findComponent({ name: "CreateListDialog" }).vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.find("[data-testid='CreateListDialog']").attributes("data-visible")).toBe("false");
        });

        it("closes the outer Dialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await wrapper.findComponent({ name: "CreateListDialog" }).vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
        });

        it("emits 'reload-lists' when closeAllModals is called", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await wrapper.findComponent({ name: "CreateListDialog" }).vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("reload-lists")).toBeTruthy();
        });

        it("does not emit 'reload-lists' without user interaction", () => {
            const wrapper = mountDialog();
            expect(wrapper.emitted("reload-lists")).toBeFalsy();
        });
    });
});