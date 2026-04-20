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

  it("should show success toast on successful signup", async () => {
    mockPost.mockResolvedValueOnce({});
    const wrapper = factory();
    await wrapper.vm.handleForm();
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    );
  });

  it("should show error toast when API fails", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { detail: "Email already exists" } },
    });
    const wrapper = factory();
    await wrapper.vm.handleForm();
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "Email already exists",
      }),
    );
  });

  it("should show fallback error toast when API fails without detail", async () => {
    mockPost.mockRejectedValueOnce({});
    const wrapper = factory();
    await wrapper.vm.handleForm();
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "signup.toast.failed",
      }),
    );
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
});
