import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateListDialog from "@/components/createListDialog.vue";
import type { Movie } from "@/types";

const mockCreateList = vi.fn();
const mockAddMovieToList = vi.fn();
const mockToastAdd = vi.fn();
const mockAuthStore = { user: { username: "testuser" } };

vi.mock("@/repositories/listRepository", () => ({
  createList: (...args: unknown[]) => mockCreateList(...args),
  addMovieToList: (...args: unknown[]) => mockAddMovieToList(...args),
  privacityConfig: {
    P: { value: "P", text: "Public", icon: "pi pi-globe" },
    R: { value: "R", text: "Friends", icon: "pi pi-users" },
    F: { value: "F", text: "Private", icon: "pi pi-lock" },
  },
}));

vi.mock("@/repositories/auth/authRepository", () => ({
  FieldMsg: {
    name: "FieldMsg",
    props: ["field"],
    template: `<span data-testid="field-msg" />`,
  },
}));

vi.mock("@/schemas/listSchema", () => ({
  defaultListSchema: {},
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

  const passThrough = (name: string, extraProps: string[] = []) =>
    defineComponent({
      name,
      props: [
        "modelValue",
        "class",
        "style",
        "label",
        "type",
        "variant",
        "fluid",
        "modal",
        "draggable",
        "dismissableMask",
        "header",
        ...extraProps,
      ],
      emits: ["update:modelValue", "click"],
      setup(props, { slots, emit }) {
        return () =>
          h("div", { "data-testid": name, onClick: () => emit("click") }, [
            slots.default?.(),
          ]);
      },
    });

  return {
    Dialog: defineComponent({
      name: "Dialog",
      props: [
        "visible",
        "modal",
        "draggable",
        "dismissableMask",
        "header",
        "class",
        "style",
      ],
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
    Button: defineComponent({
      name: "Button",
      props: ["label", "type", "variant", "fluid", "class"],
      emits: ["click"],
      setup(props, { emit }) {
        return () =>
          h(
            "button",
            {
              "data-testid": `button-${props.label?.toLowerCase().replace(" ", "-")}`,
              type: props.type ?? "button",
              onClick: () => emit("click"),
            },
            props.label,
          );
      },
    }),
    FloatLabel: passThrough("FloatLabel"),
    IconField: passThrough("IconField"),
    InputText: defineComponent({
      name: "InputText",
      props: ["id", "fluid", "class", "modelValue", "invalid", "dirty"],
      emits: ["update:modelValue"],
      setup(props, { emit }) {
        return () =>
          h("input", {
            "data-testid": `input-${props.id}`,
            id: props.id,
            value: props.modelValue,
            onInput: (e: Event) =>
              emit("update:modelValue", (e.target as HTMLInputElement).value),
          });
      },
    }),
    InputIcon: passThrough("InputIcon"),
    RadioButton: defineComponent({
      name: "RadioButton",
      props: ["inputId", "name", "value", "modelValue"],
      emits: ["update:modelValue"],
      setup(props, { emit }) {
        return () =>
          h("input", {
            type: "radio",
            "data-testid": `radio-${props.value}`,
            id: props.inputId,
            checked: props.modelValue === props.value,
            onChange: () => emit("update:modelValue", props.value),
          });
      },
    }),
    useToast: () => ({ add: mockToastAdd }),
  };
});

vi.mock("@primevue/forms", async () => {
  const { defineComponent, h, ref } = await import("vue");
  let capturedSubmitHandler: ((e: unknown) => void) | null = null;
  const triggerSubmit = (payload: unknown) => capturedSubmitHandler?.(payload);

  return {
    __triggerSubmit: triggerSubmit,
    Form: defineComponent({
      name: "Form",
      props: ["resolver"],
      emits: ["submit"],
      setup(_, { slots, emit }) {
        capturedSubmitHandler = (payload) => emit("submit", payload);
        return () =>
          h(
            "form",
            {
              "data-testid": "Form",
              onSubmit: (e: Event) => {
                e.preventDefault();
                emit("submit", { valid: true, values: {} });
              },
            },
            slots.default?.(),
          );
      },
    }),
    FormField: defineComponent({
      name: "FormField",
      props: ["name", "initialValue", "class"],
      setup(props, { slots }) {
        const $field = {
          modelValue: ref(props.initialValue ?? ""),
          invalid: false,
          dirty: false,
          onBlur: vi.fn(),
        };
        return () =>
          h(
            "div",
            { "data-testid": `field-${props.name}` },
            slots.default?.($field),
          );
      },
    }),
  };
});

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: () => () => ({ valid: true, values: {} }),
}));

vi.mock("@primevue/forms/useform", () => ({
  useForm: () => ({
    fields: { privacy: "P" },
    handleSubmit: vi.fn(),
  }),
}));

const movie: Movie = {
  id: 1,
  title: "Inception",
  slug: "inception",
} as Movie;

const mountDialog = (visible = true) =>
  mount(CreateListDialog, {
    props: { visible, movie },
    global: { stubs: { teleport: true } },
  });

describe("CreateListDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("visibility", () => {
    it("renders the Dialog when visible is true", () => {
      const wrapper = mountDialog(true);
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
    });

    it("does not render the Dialog when visible is false", () => {
      const wrapper = mountDialog(false);
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(false);
    });

    it("Dialog header shows correct i18n key", () => {
      const wrapper = mountDialog(true);
      expect(wrapper.find("[data-testid='dialog-header']").text()).toBe(
        "components.createList.header",
      );
    });
  });

  describe("form structure", () => {
    it("renders FormField for 'name'", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("[data-testid='field-name']").exists()).toBe(true);
    });

    it("renders FormField for 'description'", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("[data-testid='field-description']").exists()).toBe(
        true,
      );
    });

    it("renders FormField for 'privacity'", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("[data-testid='field-privacity']").exists()).toBe(
        true,
      );
    });

    it("renders the 3 privacy RadioButtons", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("[data-testid='radio-P']").exists()).toBe(true);
      expect(wrapper.find("[data-testid='radio-R']").exists()).toBe(true);
      expect(wrapper.find("[data-testid='radio-F']").exists()).toBe(true);
    });

    it("renders name and description InputText", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("[data-testid='input-name']").exists()).toBe(true);
      expect(wrapper.find("[data-testid='input-description']").exists()).toBe(
        true,
      );
    });

    it("renders submit button", () => {
      const wrapper = mountDialog();
      expect(wrapper.find("button[type='submit']").exists()).toBe(true);
    });

    it("renders cancel button", () => {
      const wrapper = mountDialog();
      expect(wrapper.find(".cancel-btn").exists()).toBe(true);
    });
  });

  describe("handleSubmit — success", () => {
    beforeEach(() => {
      mockCreateList.mockResolvedValue({
        data: { slug: "my-list" },
        status: "List created!",
      });
      mockAddMovieToList.mockResolvedValue({});
    });

    it("calls createList with form values", async () => {
      const wrapper = mountDialog();
      const form = wrapper.find("[data-testid='Form']");
      await form.trigger("submit");
      await flushPromises();

      expect(mockCreateList).toHaveBeenCalled();
    });

    it("calls addMovieToList with username, list slug, and movie slug", async () => {
      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "testuser",
        "my-list",
        "inception",
      );
    });

    it("emits 'reloadLists' after successful creation", async () => {
      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.emitted("reloadLists")).toBeTruthy();
    });

    it("closes dialog after successful submit", async () => {
      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.emitted("update:visible")).toBeTruthy();
      const lastEmit = wrapper.emitted("update:visible").at(-1);
      expect(lastEmit).toEqual([false]);
    });
  });

  describe("handleSubmit — createList error", () => {
    it("uses fallback i18n message when no response message is present", async () => {
      mockCreateList.mockRejectedValue(new Error("network"));

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "errors.generic",
        }),
      );
    });

    it("does not emit 'reloadLists' if createList fails", async () => {
      mockCreateList.mockRejectedValue(new Error("fail"));

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.emitted("reloadLists")).toBeFalsy();
    });

    it("does not close dialog if createList fails", async () => {
      mockCreateList.mockRejectedValue(new Error("fail"));

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      const emitted = wrapper.emitted("update:visible");
      const closedToFalse = emitted?.includes((call) => call === false);
      expect(closedToFalse).toBeFalsy();
    });
  });

  describe("addToList — error", () => {
    it("shows error toast when addMovieToList fails", async () => {
      mockCreateList.mockResolvedValue({
        data: { slug: "my-list" },
        status: "ok",
      });
      mockAddMovieToList.mockRejectedValue({
        response: { data: { message: "Movie already added" } },
      });

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Movie already added",
        }),
      );
    });

    it("uses fallback i18n message when addMovieToList fails without message", async () => {
      mockCreateList.mockResolvedValue({
        data: { slug: "my-list" },
        status: "ok",
      });
      mockAddMovieToList.mockRejectedValue(new Error("network"));

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: expect.stringContaining(
            "components.addToList.addToListError",
          ),
        }),
      );
    });
  });

  describe("cancel button", () => {
    it("closes dialog when clicking Cancel", async () => {
      const wrapper = mountDialog();
      await wrapper.find(".cancel-btn").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("update:visible")).toBeTruthy();
      const lastEmit = wrapper.emitted("update:visible").at(-1);
      expect(lastEmit).toEqual([false]);
    });

    it("does not call createList when clicking Cancel", async () => {
      const wrapper = mountDialog();
      await wrapper.find(".cancel-btn").trigger("click");
      expect(mockCreateList).not.toHaveBeenCalled();
    });
  });

  describe("authStore integration", () => {
    it("passes authStore username to addMovieToList", async () => {
      mockAuthStore.user = { username: "janedoe" };
      mockCreateList.mockResolvedValue({ data: { slug: "sl" }, status: "ok" });
      mockAddMovieToList.mockResolvedValue({});

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "janedoe",
        expect.any(String),
        expect.any(String),
      );
    });

    it("uses empty string as username when user is null", async () => {
      mockAuthStore.user = null;
      mockCreateList.mockResolvedValue({ data: { slug: "sl" }, status: "ok" });
      mockAddMovieToList.mockResolvedValue({});

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "",
        expect.any(String),
        expect.any(String),
      );
    });
  });
});
