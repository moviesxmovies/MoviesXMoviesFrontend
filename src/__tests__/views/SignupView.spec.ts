import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignupView from "../../views/SignupView.vue";
import Step1 from "../../views/signup/step1.vue";
import Step2 from "../../views/signup/step2.vue";

const { mockPost, mockPush, mockToastAdd } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockPush: vi.fn(),
  mockToastAdd: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: { post: mockPost },
}));

vi.mock("@/stores/langStore", () => ({
  useLangStore: vi.fn(() => ({ language: "en" })),
}));

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn(() => ({ t: (key: string) => key })),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  ProgressBar: { template: "<div><slot /></div>" },
}));

vi.mock("@/views/signup/step1.vue", () => ({
  default: {
    template: '<div data-testid="step1" />',
    emits: ["next", "back"],
  },
}));

vi.mock("@/views/signup/step2.vue", () => ({
  default: {
    template: '<div data-testid="step2" />',
    emits: ["next", "back"],
  },
}));

const factory = () =>
  mount(SignupView, { global: { stubs: { teleport: true } } });

describe("SignupView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render step 1 initially", () => {
    const wrapper = factory();
    expect(wrapper.findComponent({ name: "Step1" })).toBeTruthy();
  });

  it("should advance to step 2 when next is emitted", async () => {
    const wrapper = factory();
    await wrapper.findComponent(Step1).vm.$emit("next");
    await flushPromises();
    expect(wrapper.findComponent(Step2).exists()).toBe(true);
  });

  it("should go back to step 1 when back is emitted on step 2", async () => {
    const wrapper = factory();
    await wrapper.vm.next();
    wrapper.vm.currentStep--;
    await flushPromises();
    expect(wrapper.find('[data-testid="step1"]').exists()).toBe(true);
  });

  it("should call signup API with correct FormData on handleForm", async () => {
    mockPost.mockResolvedValueOnce({});
    const wrapper = factory();

    wrapper.vm.formData.username = "johndoe";
    wrapper.vm.formData.email = "john@example.com";
    wrapper.vm.formData.password = "Password123!";
    wrapper.vm.formData.confirm_password = "Password123!";
    wrapper.vm.formData.first_name = "John";
    wrapper.vm.formData.last_name = "Doe";

    await wrapper.vm.handleForm();
    await flushPromises();

    expect(mockPost).toHaveBeenCalledWith(
      "/auth/signup/",
      expect.any(FormData),
      { params: { lang: "en" } },
    );
  });

  it("should redirect to /home on successful signup", async () => {
    mockPost.mockResolvedValueOnce({});
    const wrapper = factory();
    await wrapper.vm.handleForm();
    await flushPromises();
    expect(mockPush).toHaveBeenCalledWith("/home");
  });




  it("should append image to FormData when image is set", async () => {
    mockPost.mockResolvedValueOnce({});
    const wrapper = factory();
    const file = new File(["img"], "avatar.png", { type: "image/png" });
    wrapper.vm.formData.image = file;
    await wrapper.vm.handleForm();
    await flushPromises();

    const formData = mockPost.mock.calls[0][1] as FormData;
    expect(formData.get("picture")).toBeInstanceOf(File);
  });

  it("should not append image to FormData when image is null", async () => {
    mockPost.mockResolvedValueOnce({});
    const wrapper = factory();
    wrapper.vm.formData.image = null;
    await wrapper.vm.handleForm();
    await flushPromises();

    const formData = mockPost.mock.calls[0][1] as FormData;
    expect(formData.get("picture")).toBeNull();
  });
  describe("handleError", () => {
  it("should set __general__ error when response has detail", async () => {
    const wrapper = factory();
    wrapper.vm.handleError({
      response: { data: { detail: "No autorizado." } },
    });
    await flushPromises();

    expect(wrapper.vm.fieldErrors["__general__"]).toEqual(["No autorizado."]);
  });

  it("should set __general__ error when response has error array", async () => {
    const wrapper = factory();
    wrapper.vm.handleError({
      response: { data: { error: ["Esta contraseña es demasiado común."] } },
    });
    await flushPromises();

    expect(wrapper.vm.fieldErrors["__general__"]).toEqual([
      "Esta contraseña es demasiado común.",
    ]);
  });

  it("should set field errors for username and email", async () => {
    const wrapper = factory();
    wrapper.vm.handleError({
      response: {
        data: {
          username: ["Ya existe un usuario con este nombre."],
          email: ["Ya existe Usuario con este Email."],
        },
      },
    });
    await flushPromises();

    expect(wrapper.vm.fieldErrors["username"]).toEqual([
      "Ya existe un usuario con este nombre.",
    ]);
    expect(wrapper.vm.fieldErrors["email"]).toEqual([
      "Ya existe Usuario con este Email.",
    ]);
  });

  it("should navigate to step 1 when username error is present", async () => {
    const wrapper = factory();
    wrapper.vm.currentStep = 2;
    wrapper.vm.handleError({
      response: {
        data: { username: ["Ya existe un usuario con este nombre."] },
      },
    });
    await flushPromises();

    expect(wrapper.vm.currentStep).toBe(1);
  });

  it("should navigate to step 1 when email error is present", async () => {
    const wrapper = factory();
    wrapper.vm.currentStep = 2;
    wrapper.vm.handleError({
      response: {
        data: { email: ["Ya existe Usuario con este Email."] },
      },
    });
    await flushPromises();

    expect(wrapper.vm.currentStep).toBe(1);
  });

  it("should navigate to step 1 when error array is present", async () => {
    const wrapper = factory();
    wrapper.vm.currentStep = 2;
    wrapper.vm.handleError({
      response: {
        data: { error: ["Esta contraseña es demasiado común."] },
      },
    });
    await flushPromises();

    expect(wrapper.vm.currentStep).toBe(1);
  });

  it("should NOT navigate to step 1 when only step 2 field errors are present", async () => {
    const wrapper = factory();
    wrapper.vm.currentStep = 2;
    wrapper.vm.handleError({
      response: {
        data: { first_name: ["Este campo es obligatorio."] },
      },
    });
    await flushPromises();

    expect(wrapper.vm.currentStep).toBe(2);
  });

  it("should do nothing when response data is missing", async () => {
    const wrapper = factory();
    wrapper.vm.handleError({});
    await flushPromises();

    expect(Object.keys(wrapper.vm.fieldErrors)).toHaveLength(0);
  });

  it("should do nothing when response data is not an object", async () => {
    const wrapper = factory();
    wrapper.vm.handleError({ response: { data: "Internal Server Error" } });
    await flushPromises();

    expect(Object.keys(wrapper.vm.fieldErrors)).toHaveLength(0);
  });

  it("should clear previous field errors before setting new ones", async () => {
    const wrapper = factory();

    wrapper.vm.handleError({
      response: { data: { username: ["Error anterior."] } },
    });
    await flushPromises();

    Object.keys(wrapper.vm.fieldErrors).forEach(
      (k) => delete wrapper.vm.fieldErrors[k],
    );

    wrapper.vm.handleError({
      response: { data: { email: ["Nuevo error."] } },
    });
    await flushPromises();

    expect(wrapper.vm.fieldErrors["username"]).toBeUndefined();
    expect(wrapper.vm.fieldErrors["email"]).toEqual(["Nuevo error."]);
  });
});
});
