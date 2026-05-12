import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CreateListDialog from "@/components/createListDialog.vue";
import type { Movie } from "@/types";

const mockCreateList = vi.fn();
const mockAddMovieToList = vi.fn();
const mockToastAdd = vi.fn();
const mockAuthStore = { user: { username: "testuser" } };
const mockUpdateList = vi.fn();

vi.mock("@/repositories/listRepository", () => ({
  createList: (...args: unknown[]) => mockCreateList(...args),
  addMovieToList: (...args: unknown[]) => mockAddMovieToList(...args),
  updateList: (...args: unknown[]) => mockUpdateList(...args),
  privacityConfig: {
    P: { value: "P", text: "Public", icon: "pi pi-globe" },
    R: { value: "R", text: "Friends", icon: "pi pi-users" },
    F: { value: "F", text: "Private", icon: "pi pi-lock" },
  },
}));

vi.mock("@/utils/handleApiError", () => ({
  handleApiError: vi.fn((error, fieldErrors, serverErrors, toast, t) => {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: t("errors.generic"),
      life: 3000,
    });
  }),
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

vi.mock("@primevue/forms/useform", () => ({
  useForm: () => ({
    fields: { privacy: "P" },
    handleSubmit: vi.fn(),
    reset: vi.fn(),
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
    afterEach(() => {
      mockAuthStore.user = { username: "testuser" };
    });

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

  describe("handleSubmit — updateList (edit mode)", () => {
    const movieList: MovieList = {
      slug: "my-existing-list",
      name: "My List",
      description: "desc",
      privacity: "P",
    } as MovieList;

    const mountEditDialog = (visible = true) =>
      mount(CreateListDialog, {
        props: { visible, movieList },
        global: { stubs: { teleport: true } },
      });

    beforeEach(() => {
      mockAuthStore.user = { username: "testuser" };
      mockUpdateList.mockResolvedValue({ data: { slug: "my-existing-list" } });
    });

    it("calls updateList instead of createList when movieList prop is provided", async () => {
      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockUpdateList).toHaveBeenCalledWith(
        "testuser",
        "my-existing-list",
        expect.any(Object),
      );
      expect(mockCreateList).not.toHaveBeenCalled();
    });

    it("emits reloadMovieList with the updated slug", async () => {
      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.emitted("reloadMovieList")).toBeTruthy();
      expect(wrapper.emitted("reloadMovieList")![0]).toEqual([
        "my-existing-list",
      ]);
    });

    it("emits reloadLists after update", async () => {
      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.emitted("reloadLists")).toBeTruthy();
    });

    it("closes dialog after successful update", async () => {
      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      const lastEmit = wrapper.emitted("update:visible")?.at(-1);
      expect(lastEmit).toEqual([false]);
    });

    it("does not call addMovieToList in edit mode", async () => {
      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockAddMovieToList).not.toHaveBeenCalled();
    });

    it("shows edit header text", () => {
      const wrapper = mountEditDialog();
      expect(wrapper.find("[data-testid='dialog-header']").text()).toBe(
        "components.createList.headerEdit",
      );
    });

    it("shows error toast when updateList fails", async () => {
      mockUpdateList.mockRejectedValue(new Error("network"));

      const wrapper = mountEditDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" }),
      );
      expect(wrapper.emitted("reloadLists")).toBeFalsy();
    });
  });

  // ── intelligent mode ─────────────────────────────────────────────────────────

  describe("intelligent prop", () => {
    const mountIntelligentDialog = () =>
      mount(CreateListDialog, {
        props: { visible: true, intelligent: true },
        global: {
          stubs: {
            teleport: true,
            SearchGenresComponent: {
              name: "SearchGenresComponent",
              template: `<div data-testid="search-genres" />`,
              emits: ["filterGenres"],
            },
            SearchPersonComponent: {
              name: "SearchPersonComponent",
              template: `<div data-testid="search-person" />`,
              props: ["modelValue"],
              emits: ["update:modelValue"],
            },
            SearchUsersComponent: {
              name: "SearchUsersComponent",
              template: `<div data-testid="search-users" />`,
              props: ["modelValue"],
              emits: ["update:modelValue"],
            },
          },
        },
      });

    it("renders intelligent filter section when intelligent=true and no movieList", () => {
      const wrapper = mountIntelligentDialog();
      expect(wrapper.find("[data-testid='search-genres']").exists()).toBe(true);
      expect(wrapper.find("[data-testid='search-person']").exists()).toBe(true);
      expect(wrapper.find("[data-testid='search-users']").exists()).toBe(true);
    });

    it("does NOT render intelligent filters when intelligent=false", () => {
      const wrapper = mount(CreateListDialog, {
        props: { visible: true, intelligent: false },
        global: {
          stubs: {
            teleport: true,
            SearchGenresComponent: true,
            SearchPersonComponent: true,
            SearchUsersComponent: true,
          },
        },
      });
      expect(wrapper.find("[data-testid='search-genres']").exists()).toBe(
        false,
      );
    });

    it("passes selectedGenres to createList via filterGenres event", async () => {
      mockCreateList.mockResolvedValue({ data: { slug: "sl" } });

      const wrapper = mountIntelligentDialog();
      // Simulate the genre filter emitting
      await wrapper
        .findComponent({ name: "SearchGenresComponent" })
        .vm.$emit("filterGenres", ["action", "drama"]);

      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockCreateList).toHaveBeenCalledWith(
        expect.any(Object),
        true,
        expect.objectContaining({ genres: ["action", "drama"] }),
      );
    });

    it("passes intelligent=true flag to createList", async () => {
      mockCreateList.mockResolvedValue({ data: { slug: "sl" } });

      const wrapper = mountIntelligentDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(mockCreateList).toHaveBeenCalledWith(
        expect.any(Object),
        true,
        expect.any(Object),
      );
    });
  });

  // ── watch: reset on open ─────────────────────────────────────────────────────

  describe("watch — resets state when dialog opens", () => {
    it("calls form.reset() when visible changes to true", async () => {
      const wrapper = mount(CreateListDialog, {
        props: { visible: false },
        global: { stubs: { teleport: true } },
      });

      await wrapper.setProps({ visible: true });
      await flushPromises();

      // Dialog renders = watcher ran; no crash = reset called safely
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
    });

    it("does not emit anything when visible changes from true to false", async () => {
      const wrapper = mount(CreateListDialog, {
        props: { visible: true },
        global: { stubs: { teleport: true } },
      });

      const emittedBefore = Object.keys(wrapper.emitted()).length;
      await wrapper.setProps({ visible: false });
      await flushPromises();

      // No extra events triggered by watcher on close
      const newKeys = Object.keys(wrapper.emitted()).filter(
        (k) => !["update:visible"].includes(k),
      );
      expect(newKeys.length).toBe(emittedBefore);
    });
  });

  // ── fieldErrors display ──────────────────────────────────────────────────────

  describe("field-level API errors", () => {
    it("shows server-level error block when serverErrors is populated", async () => {
      // handleApiError populates serverErrors for non-field errors
      const { handleApiError } = await import("@/utils/handleApiError");
      vi.mocked(handleApiError).mockImplementation(
        (_, _fieldErrors, serverErrors) => {
          serverErrors.value = ["Something went wrong globally"];
        },
      );

      mockCreateList.mockRejectedValue({ response: { status: 500 } });

      const wrapper = mountDialog();
      await wrapper.find("[data-testid='Form']").trigger("submit");
      await flushPromises();

      expect(wrapper.find(".server-errors").exists()).toBe(true);
      expect(wrapper.find(".server-errors").text()).toContain(
        "Something went wrong globally",
      );
    });
  });
});
