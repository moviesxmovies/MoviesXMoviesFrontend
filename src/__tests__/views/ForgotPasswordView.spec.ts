import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPasswordView from "../../views/ForgotPasswordView.vue";

const { mockForgotPassword, mockPush, mockToastAdd } = vi.hoisted(() => ({
  mockForgotPassword: vi.fn(),
  mockPush: vi.fn(),
  mockToastAdd: vi.fn(),
}));

vi.mock("@/repositories/auth/authRepository", () => ({
  forgotPassword: mockForgotPassword,
  FieldMsg: { template: "<span><slot /></span>" },
}));

vi.mock("@/router", () => ({
  router: { push: mockPush },
}));

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn(() => ({ t: (key: string) => key })),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  Button: { template: "<button type='submit'><slot /></button>" },
  FloatLabel: { template: "<div><slot /></div>" },
  IconField: { template: "<div><slot /></div>" },
  InputIcon: { template: "<span><slot /></span>" },
  InputText: { template: "<input />" },
}));

vi.mock("@primevue/forms", () => ({
  Form: {
    template: "<form @submit.prevent=\"$emit('submit', { valid: formValid, values: formValues })\"><slot /></form>",
    emits: ["submit"],
  },
  FormField: {
    template: "<div><slot :field=\"{ invalid: false, dirty: false }\" /></div>",
  },
}));

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("@/schemas/resetPasswordSchema", () => ({
  forgotPasswordSchema: {},
}));

const factory = () =>
  mount(ForgotPasswordView, { global: { stubs: { teleport: true } } });

describe("ForgotPasswordView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the email input", () => {
    const wrapper = factory();
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should render the submit button", () => {
    const wrapper = factory();
    expect(wrapper.find("button[type='submit']").exists()).toBe(true);
  });

  it("should render the back to login link", () => {
    const wrapper = factory();
    expect(wrapper.find("button[type='button']").exists()).toBe(true);
  });

  it("should navigate to /login when back to login is clicked", async () => {
    const wrapper = factory();
    await wrapper.find("button[type='button']").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should not call forgotPassword when form is invalid", async () => {
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: false, values: { email: "" } });
    await flushPromises();
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it("should call forgotPassword with the correct email on valid submit", async () => {
    mockForgotPassword.mockResolvedValueOnce("Check your inbox");
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "user@example.com" } });
    await flushPromises();
    expect(mockForgotPassword).toHaveBeenCalledWith("user@example.com");
  });

  it("should show a success toast on successful submission", async () => {
    mockForgotPassword.mockResolvedValueOnce("Check your inbox");
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "user@example.com" } });
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    );
  });

  it("should use the API response as the toast detail on success", async () => {
    mockForgotPassword.mockResolvedValueOnce("Check your inbox");
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "user@example.com" } });
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        detail: "Check your inbox",
      }),
    );
  });

  it("should redirect to /check-email on successful submission", async () => {
    mockForgotPassword.mockResolvedValueOnce("Check your inbox");
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "user@example.com" } });
    await flushPromises();
    expect(mockPush).toHaveBeenCalledWith("/check-email");
  });

  it("should show an error toast when the API fails with a message", async () => {
    mockForgotPassword.mockRejectedValueOnce({
      response: { data: { message: "Email not found" } },
    });
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "noexiste@example.com" } });
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "Email not found",
      }),
    );
  });

  it("should show a fallback i18n error toast when the API fails without a message", async () => {
    mockForgotPassword.mockRejectedValueOnce({});
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "user@example.com" } });
    await flushPromises();
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "forgotPassword.toast.error",
      }),
    );
  });

  it("should not redirect when the API fails", async () => {
    mockForgotPassword.mockRejectedValueOnce({
      response: { data: { message: "Email not found" } },
    });
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: true, values: { email: "noexiste@example.com" } });
    await flushPromises();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not show a toast when the form is invalid", async () => {
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: false, values: { email: "" } });
    await flushPromises();
    expect(mockToastAdd).not.toHaveBeenCalled();
  });
});