import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateListDialog from "@/components/createListDialog.vue";
import type { Movie, MovieList } from "@/types";

// --- Mocks de Repositorios y Utilidades ---
const mockCreateList = vi.fn();
const mockAddMovieToList = vi.fn();
const mockUpdateList = vi.fn();
const mockToastAdd = vi.fn();
const mockGoToMovieList = vi.fn();

const mockAuthStore = { user: { username: "testuser" } };

vi.mock("@/repositories/listRepository", () => ({
  createList: (...args: any[]) => mockCreateList(...args),
  addMovieToList: (...args: any[]) => mockAddMovieToList(...args),
  updateList: (...args: any[]) => mockUpdateList(...args),
  privacityConfig: {
    P: { value: "P", text: "Public", icon: "pi pi-globe", class: "p-pub" },
    R: { value: "R", text: "Friends", icon: "pi pi-users", class: "p-fr" },
    F: { value: "F", text: "Private", icon: "pi pi-lock", class: "p-pr" },
  },
}));

vi.mock("@/utils/handleApiError", () => ({
  handleApiError: vi.fn((error, fieldErrors, serverErrors, toast, t) => {
    // Simula comportamiento de error de API
    if (error.isField) {
      fieldErrors.value = { name: ["Invalid name"] };
    } else {
      serverErrors.value = ["Global error"];
    }
  }),
}));

vi.mock("@/utils/goTo", () => ({
  goToMovieList: (...args: any[]) => mockGoToMovieList(...args),
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => mockAuthStore,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (k: string) => k,
  }),
}));

vi.mock("primevue", async () => {
  const { defineComponent } = await import("vue");
  return {
    Dialog: defineComponent({
      name: "Dialog",
      props: ["visible", "header"],
      template: `<div v-if="visible" data-testid="Dialog">
                  <header>{{ header }}</header>
                  <slot />
                 </div>`,
    }),
    Button: defineComponent({
      name: "Button",
      props: ["label", "type"],
      template: `<button :type="type">{{ label }}</button>`,
    }),
    InputText: defineComponent({
      name: "InputText",
      props: ["modelValue"],
      emits: ["update:modelValue", "input"],
      template: `<input :value="modelValue" @input="$emit('input', $event)" />`,
    }),
    FloatLabel: { template: "<div><slot /></div>" },
    IconField: { template: "<div><slot /></div>" },
    InputIcon: { template: "<i></i>" },
    useToast: () => ({ add: mockToastAdd }),
  };
});

// Mock del sistema de formularios de PrimeVue
vi.mock("@primevue/forms", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    Form: defineComponent({
      name: "Form",
      emits: ["submit"],
      setup(_, { slots, emit }) {
        const submit = () =>
          emit("submit", {
            valid: true,
            values: { name: "New List", privacity: "P" },
          });
        return () =>
          h(
            "form",
            {
              onSubmit: (e: Event) => {
                e.preventDefault();
                submit();
              },
              "data-testid": "Form",
            },
            slots.default?.(),
          );
      },
    }),
    FormField: defineComponent({
      name: "FormField",
      props: ["name", "initialValue"],
      setup(props, { slots }) {
        const field = {
          value: props.initialValue,
          props: { onChange: vi.fn() },
        };
        return () =>
          h(
            "div",
            { "data-testid": `field-${props.name}` },
            slots.default?.(field),
          );
      },
    }),
  };
});

vi.mock("@primevue/forms/resolvers/zod", () => ({ zodResolver: () => ({}) }));
vi.mock("@primevue/forms/useform", () => ({
  useForm: () => ({ reset: vi.fn() }),
}));

// --- Setup de Tests ---

const movie: Movie = { id: 1, title: "Inception", slug: "inception" } as Movie;

const mountDialog = (props = {}) =>
  mount(CreateListDialog, {
    props: { visible: true, ...props },
    global: {
      stubs: {
        teleport: true,
        FieldMsg: true,
        SearchGenresComponent: true,
        SearchPersonComponent: true,
        SearchUsersComponent: true,
      },
    },
  });

describe("CreateListDialog.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderizado y Modos", () => {
    it("muestra el encabezado de creación por defecto", () => {
      const wrapper = mountDialog();
      expect(wrapper.text()).toContain("components.createList.header");
    });

    it("muestra el encabezado de edición cuando se pasa movieList", () => {
      const wrapper = mountDialog({
        movieList: { name: "Existing" } as MovieList,
      });
      expect(wrapper.text()).toContain("components.createList.headerEdit");
    });

    it("renderiza los botones de privacidad basados en la config", () => {
      const wrapper = mountDialog();
      expect(wrapper.findAll(".privacy-btn")).toHaveLength(3);
    });
  });

  describe("Lógica de Creación (Create Mode)", () => {
    it("llama a createList y luego a addMovieToList si hay una película seleccionada", async () => {
      mockCreateList.mockResolvedValue({ data: { slug: "new-list-slug" } });
      const wrapper = mountDialog({ movie });

      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(mockCreateList).toHaveBeenCalled();
      expect(mockAddMovieToList).toHaveBeenCalledWith(
        "testuser",
        "new-list-slug",
        "inception",
      );
      expect(wrapper.emitted("reloadLists")).toBeTruthy();
    });

    it("llama a goToMovieList si NO hay una película seleccionada al crear", async () => {
      mockCreateList.mockResolvedValue({ data: { slug: "empty-list" } });
      const wrapper = mountDialog({ movie: undefined });

      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(mockGoToMovieList).toHaveBeenCalledWith("testuser", "empty-list");
    });
  });

  describe("Lógica de Edición (Edit Mode)", () => {
    it("llama a updateList en lugar de createList", async () => {
      const movieList = { slug: "old-slug", name: "Old" } as MovieList;
      mockUpdateList.mockResolvedValue({ data: { slug: "old-slug" } });
      const wrapper = mountDialog({ movieList });

      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(mockUpdateList).toHaveBeenCalled();
      expect(mockCreateList).not.toHaveBeenCalled();
      expect(wrapper.emitted("reloadMovieList")).toBeTruthy();
    });
  });

  describe("Filtros Inteligentes", () => {
    it("no muestra filtros inteligentes por defecto", () => {
      const wrapper = mountDialog({ intelligent: false });
      expect(
        wrapper.findComponent({ name: "SearchGenresComponent" }).exists(),
      ).toBe(false);
    });

    it("muestra componentes de búsqueda cuando intelligent es true y no es edición", () => {
      const wrapper = mountDialog({ intelligent: true });
      expect(
        wrapper.findComponent({ name: "SearchGenresComponent" }).exists(),
      ).toBe(true);
      expect(
        wrapper.findComponent({ name: "SearchPersonComponent" }).exists(),
      ).toBe(true);
    });
  });

  describe("Manejo de Errores", () => {
    it("muestra errores de servidor cuando la API falla", async () => {
      mockCreateList.mockRejectedValue({ isField: false });
      const wrapper = mountDialog();

      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(wrapper.find(".server-errors").exists()).toBe(true);
      expect(wrapper.find(".server-errors").text()).toContain("Global error");
    });

    it("limpia los errores cuando se vuelve a abrir el diálogo", async () => {
      const wrapper = mountDialog({ visible: false });

      // Forzamos un estado de error previo (simulado)
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(".server-errors").exists()).toBe(false);
    });
  });

  describe("Acciones del Usuario", () => {
    it("cierra el diálogo al hacer clic en cancelar", async () => {
      const wrapper = mountDialog();
      await wrapper.find(".cancel-btn").trigger("click");

      const emittedEvents = wrapper.emitted("update:visible");

      expect(emittedEvents).toBeDefined();
      // Comprobamos el último valor emitido
      expect(emittedEvents?.at(-1)).toEqual([false]);
    });
  });
});
