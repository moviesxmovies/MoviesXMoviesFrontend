import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import SignupView from "@/views/SignupView.vue";
import i18n from "@/i18n";

const { mockPush, mockToastAdd, mockHandleRegister, mockHandleLogin } =
  vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockToastAdd: vi.fn(),
    mockHandleRegister: vi.fn(),
    mockHandleLogin: vi.fn(),
  }));

vi.mock("vue-router", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("primevue/usetoast", () => ({ useToast: () => mockToast }));
vi.mock("@/repositories/auth/authRepository", () => ({
  handleRegister: mockHandleRegister,
  handleLogin: mockHandleLogin,
}));

const factory = () =>
  mount(SignupView, {
    global: {
      plugins: [createPinia(), i18n],
      stubs: {
        Card: { template: "<div><slot /></div>" },
        LangComponent: true,
        ThemeComponent: true,
      },
    },
  });

describe("SignupView - script logic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should not submit if form is invalid", async () => {
    const wrapper = factory();
    await wrapper.find('[type="submit"]').trigger("click");
    await flushPromises();

    expect(mockHandleRegister).not.toHaveBeenCalled();
  });

  it("should call handleRegister and handleLogin with correct values on valid submit", async () => {
    mockHandleRegister.mockResolvedValue({});
    mockHandleLogin.mockResolvedValue({});

    const wrapper = factory();
    const vm = wrapper.vm as any;

    await vm.onFormSubmit({
      valid: true,
      values: {
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        confirm_password: "Password123",
      },
    });

    expect(mockHandleRegister).toHaveBeenCalledWith({
      first_name: "John",
      last_name: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "Password123",
      confirm_password: "Password123",
    });

    expect(mockHandleLogin).toHaveBeenCalledWith({
      username: "johndoe",
      password: "Password123",
    });
  });

  it("should show success toast and navigate to /home on success", async () => {
    mockHandleRegister.mockResolvedValue({});
    mockHandleLogin.mockResolvedValue({});

    const wrapper = factory();
    const vm = wrapper.vm as any;

    await vm.onFormSubmit({
      valid: true,
      values: {
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        confirm_password: "Password123",
      },
    });

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "success",
      summary: "Welcome!",
      detail: "Your account has been created",
      life: 3000,
    });

    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("should show error toast if registration fails", async () => {
    mockHandleRegister.mockRejectedValue({
      response: { data: { detail: "Username already exists" } },
    });

    const wrapper = factory();
    const vm = wrapper.vm as any;

    await vm.onFormSubmit({
      valid: true,
      values: {
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        confirm_password: "Password123",
      },
    });

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Username already exists",
      life: 5000,
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should show fallback error message if no detail in error response", async () => {
    mockHandleRegister.mockRejectedValue({});

    const wrapper = factory();
    const vm = wrapper.vm as any;

    await vm.onFormSubmit({
      valid: true,
      values: {
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        confirm_password: "Password123",
      },
    });

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "Registration failed",
      life: 5000,
    });
  });

  it("should not navigate if form is invalid", async () => {
    const wrapper = factory();
    const vm = wrapper.vm as any;

    await vm.onFormSubmit({ valid: false, values: {} });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockHandleRegister).not.toHaveBeenCalled();
  });
});
