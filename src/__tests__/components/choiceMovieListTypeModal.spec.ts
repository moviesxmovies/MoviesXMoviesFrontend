import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChooseListTypeDialog from "@/components/choiceMovieListTypeModal.vue";

vi.mock("@/components/createListDialog.vue", () => ({
    default: {
        name: "CreateListDialog",
        props: ["visible", "intelligent"],
        emits: ["update:visible", "reload-lists"],
        template: `<div
            data-testid="CreateListDialog"
            :data-visible="String(visible)"
            :data-intelligent="String(!!intelligent)"
        />`,
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
            mocks: { $t: (k: string) => k },
        },
    });

const getNormalDialog = (wrapper: ReturnType<typeof mountDialog>) =>
    wrapper.findAllComponents({ name: "CreateListDialog" }).find(
        (c) => c.attributes("data-intelligent") === "false"
    );

const getIntelligentDialog = (wrapper: ReturnType<typeof mountDialog>) =>
    wrapper.findAllComponents({ name: "CreateListDialog" }).find(
        (c) => c.attributes("data-intelligent") === "true"
    );

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

        it("renders two CreateListDialog components", () => {
            const wrapper = mountDialog();
            expect(wrapper.findAllComponents({ name: "CreateListDialog" })).toHaveLength(2);
        });

        it("normal CreateListDialog starts hidden", () => {
            const wrapper = mountDialog();
            expect(getNormalDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("intelligent CreateListDialog starts hidden", () => {
            const wrapper = mountDialog();
            expect(getIntelligentDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("intelligent CreateListDialog has intelligent prop set to true", () => {
            const wrapper = mountDialog();
            expect(getIntelligentDialog(wrapper)?.attributes("data-intelligent")).toBe("true");
        });

        it("normal CreateListDialog has intelligent prop set to false", () => {
            const wrapper = mountDialog();
            expect(getNormalDialog(wrapper)?.attributes("data-intelligent")).toBe("false");
        });
    });

    describe("normal list button", () => {
        it("opens normal CreateListDialog when clicking the first button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
            expect(getNormalDialog(wrapper)?.attributes("data-visible")).toBe("true");
        });

        it("does not open intelligent CreateListDialog when clicking the first button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
            expect(getIntelligentDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("does not close the outer Dialog", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
            expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
        });
    });

    describe("intelligent list button", () => {
        it("opens intelligent CreateListDialog when clicking the second button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[1].trigger("click");
            expect(getIntelligentDialog(wrapper)?.attributes("data-visible")).toBe("true");
        });

        it("does not open normal CreateListDialog when clicking the second button", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[1].trigger("click");
            expect(getNormalDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("does not close the outer Dialog", async () => {
            const wrapper = mountDialog();
            await wrapper.findAll(".list-type-btn")[1].trigger("click");
            expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
        });
    });

    describe("closeAllModals — triggered from normal CreateListDialog", () => {
        const openNormalModal = async (wrapper: ReturnType<typeof mountDialog>) => {
            await wrapper.findAll(".list-type-btn")[0].trigger("click");
        };

        it("closes normal CreateListDialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await getNormalDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(getNormalDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("closes the outer Dialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await getNormalDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
        });

        it("emits 'reload-lists' when closeAllModals is called", async () => {
            const wrapper = mountDialog();
            await openNormalModal(wrapper);

            await getNormalDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("reload-lists")).toBeTruthy();
        });
    });

    describe("closeAllModals — triggered from intelligent CreateListDialog", () => {
        const openIntelligentModal = async (wrapper: ReturnType<typeof mountDialog>) => {
            await wrapper.findAll(".list-type-btn")[1].trigger("click");
        };

        it("closes intelligent CreateListDialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openIntelligentModal(wrapper);

            await getIntelligentDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(getIntelligentDialog(wrapper)?.attributes("data-visible")).toBe("false");
        });

        it("closes the outer Dialog when reload-lists is emitted", async () => {
            const wrapper = mountDialog();
            await openIntelligentModal(wrapper);

            await getIntelligentDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
        });

        it("emits 'reload-lists' when closeAllModals is called", async () => {
            const wrapper = mountDialog();
            await openIntelligentModal(wrapper);

            await getIntelligentDialog(wrapper)!.vm.$emit("reload-lists");
            await flushPromises();

            expect(wrapper.emitted("reload-lists")).toBeTruthy();
        });
    });

    describe("no interaction", () => {
        it("does not emit 'reload-lists' without user interaction", () => {
            const wrapper = mountDialog();
            expect(wrapper.emitted("reload-lists")).toBeFalsy();
        });
    });
});