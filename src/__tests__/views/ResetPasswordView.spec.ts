import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResetPasswordView from "../../views/ResetPasswordView.vue"; // Ajusta la ruta si es necesario

const { mockResetPassword, mockPush, mockToastAdd, mockRoute } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
  mockPush: vi.fn(),
  mockToastAdd: vi.fn(),
  mockRoute: {
    query: {
      email: "test@example.com",
      code: "123456"
    }
  }
}));

vi.mock("@/repositories/auth/authRepository", () => ({
  resetPassword: mockResetPassword,
  FieldMsg: { template: "<span><slot /></span>" },
}));

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn(() => ({ t: (key: string) => key })),
}));

vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  Button: { template: "<button type='submit'><slot /></button>" },
  FloatLabel: { template: "<div><slot /></div>" },
  Password: { 
    template: "<input class='p-password' />",
    props: ["modelValue"] 
  },
}));

vi.mock("@primevue/forms", () => ({
  Form: {
    template: "<form @submit.prevent=\"$emit('submit', { valid: formValid, values: formValues })\"><slot /></form>",
    emits: ["submit"],
  },
  FormField: {
    template: "<div><slot :field=\"{ invalid: false, dirty: false, errors: [] }\" /></div>",
    props: ["name", "initialValue"]
  },
}));

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("@/schemas/resetPasswordSchema", () => ({
  resetPasswordSchema: {},
}));

const factory = () =>
  mount(ResetPasswordView, { 
    global: { 
        stubs: { teleport: true },
        mocks: {
            $t: (key: string) => key
        }
    } 
  });

describe("ResetPasswordView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render password inputs", () => {
    const wrapper = factory();
    // Buscamos los componentes Password mockeados
    expect(wrapper.findAll(".p-password").length).toBe(2);
  });

  it("should render the submit button", () => {
    const wrapper = factory();
    expect(wrapper.find("button[type='submit']").exists()).toBe(true);
  });

  it("should not call resetPassword when form is invalid", async () => {
    const wrapper = factory();
    await wrapper.vm.handleSubmit({ valid: false, values: {} });
    await flushPromises();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("should call resetPassword with correct values from form and route on valid submit", async () => {
    mockResetPassword.mockResolvedValueOnce("Password updated");
    const wrapper = factory();
    
    const formValues = {
      forgot_password_code: "123456",
      password: "newPassword123",
      email: "test@example.com"
    };

    await wrapper.vm.handleSubmit({ valid: true, values: formValues });
    await flushPromises();

    expect(mockResetPassword).toHaveBeenCalledWith(
      formValues.forgot_password_code,
      formValues.password,
      formValues.email
    );
  });

  it("should show a success toast on successful reset", async () => {
    const successMsg = "Password updated successfully";
    mockResetPassword.mockResolvedValueOnce(successMsg);
    const wrapper = factory();

    await wrapper.vm.handleSubmit({ 
        valid: true, 
        values: { forgot_password_code: "1", password: "p", email: "e" } 
    });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        detail: successMsg,
      }),
    );
  });

  it("should redirect to /login on successful reset", async () => {
    mockResetPassword.mockResolvedValueOnce("OK");
    const wrapper = factory();

    await wrapper.vm.handleSubmit({ 
        valid: true, 
        values: { forgot_password_code: "1", password: "p", email: "e" } 
    });
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should show an error toast when the API fails with a message", async () => {
    const errorMessage = "Invalid or expired token";
    mockResetPassword.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });
    const wrapper = factory();

    await wrapper.vm.handleSubmit({ 
        valid: true, 
        values: { forgot_password_code: "wrong", password: "p", email: "e" } 
    });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: errorMessage,
      }),
    );
  });

  it("should show fallback i18n error toast when API fails without message", async () => {
    mockResetPassword.mockRejectedValueOnce({});
    const wrapper = factory();

    await wrapper.vm.handleSubmit({ 
        valid: true, 
        values: { forgot_password_code: "1", password: "p", email: "e" } 
    });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "resetPassword.toast.error",
      }),
    );
  });

  it("should not redirect when the API fails", async () => {
    mockResetPassword.mockRejectedValueOnce(new Error("Fail"));
    const wrapper = factory();

    await wrapper.vm.handleSubmit({ 
        valid: true, 
        values: { forgot_password_code: "1", password: "p", email: "e" } 
    });
    await flushPromises();

    expect(mockPush).not.toHaveBeenCalled();
  });
});