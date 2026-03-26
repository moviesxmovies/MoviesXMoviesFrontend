import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { Form, FormField } from "@primevue/forms";
import LoginView from "../../views/LoginView.vue";
import { api } from "../../composables/useAPI";

const { mockSetTokens, mockPost, mockPush, mockToastAdd } = vi.hoisted(() => ({
  mockSetTokens: vi.fn(),
  mockPost: vi.fn(),
  mockPush: vi.fn(),
  mockToastAdd: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUserContainer = { user: { verified: false } };

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    get user() {
      return mockUserContainer.user;
    },
    setTokens: mockSetTokens,
    refreshToken: "refresh-token",
    logout: vi.fn(),
  })),
}));

vi.mock("@/config", () => ({
  config: {
    googleClientId: "test-client-id",
    callbackUri: "http://localhost:5173",
    apiUrl: "http://localhost:8000/api",
  },
}));

vi.mock("@/composables/useAPI", () => ({ api: { post: mockPost } }));

vi.mock("@/composables/useOAUTH", () => ({
  loginWithGoogle: vi.fn(),
}));

vi.mock("@/repositories/auth/authRepository", () => ({
  FieldMsg: {
    name: "FieldMsg",
    template:
      '<span class="field-msg">{{ field?.errors?.[0]?.message }}</span>',
    props: ["field"],
  },
}));

vi.mock("@/components/oauthButtonComponent.vue", () => ({
  default: {
    name: "OauthButtonComponent",
    template:
      '<button data-testid="oauth-btn" @click="$emit(\'click\')">Google</button>',
    emits: ["click"],
  },
}));

vi.mock("@/schemas/loginSchema", () => ({
  loginSchema: {},
}));

vi.mock("primevue/usetoast", () => ({
  useToast: () => mockToastAdd,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const globalConfig = {
  plugins: [PrimeVue, ToastService],
  components: { Form, FormField },
  mocks: { $t: (key: string) => key },
};

function mountComponent() {
  return mount(LoginView, { global: globalConfig });
}

const validValues = { username: "testuser", password: "Secret1234" };

describe("LoginView rendering", () => {
  it("renders title and subtitle i18n keys", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("login.title");
    expect(wrapper.text()).toContain("login.subtitle");
  });

  it("renders username and password FormFields", () => {
    const wrapper = mountComponent();
    const fields = wrapper.findAllComponents(FormField);
    const names = fields.map((f) => f.props("name"));
    expect(names).toContain("username");
    expect(names).toContain("password");
  });

  it("renders a submit button", () => {
    const wrapper = mountComponent();
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("renders the forgot password button", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("login.forgotPassword");
  });

  it("renders the OAuth button", () => {
    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="oauth-btn"]').exists()).toBe(true);
  });

  it("renders the signup link", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("login.signup");
  });
});

describe("LoginView login() success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls handleLogin with the form values", async () => {
    const wrapper = mountComponent();
    await wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockHandleLogin).toHaveBeenCalledWith(validValues);
  });

  it("shows a success toast after login", async () => {
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    );
  });

  it("redirects to /home after successful login", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        status: true,
        access_token: "mock-access",
        refresh_token: "mock-refresh",
      },
    });
    const wrapper = mountComponent();
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("sets loading to false after success", async () => {
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    const submitBtn = wrapper.find('button[type="submit"]');
    expect(submitBtn.attributes("disabled")).toBeUndefined();
  });
});

describe("LoginView login() with invalid form", () => {
  beforeEach(() => {
    mockHandleLogin.mockClear();
    mockPush.mockClear();
  });

  it("does not call handleLogin when valid=false", async () => {
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: false, values: validValues });
    await flushPromises();

    expect(mockHandleLogin).not.toHaveBeenCalled();
  });

  it("does not redirect when valid=false", async () => {
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: false, values: validValues });
    await flushPromises();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not show a toast when valid=false", async () => {
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: false, values: validValues });
    await flushPromises();

    expect(mockToastAdd).not.toHaveBeenCalled();
  });
});

describe("LoginView login() error handling", () => {
  beforeEach(() => {
    mockToastAdd.mockClear();
    mockPush.mockClear();
  });

  it("shows invalidCredentials toast on 401", async () => {
    mockHandleLogin.mockRejectedValue({ response: { status: 401 } });
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "login.toast.invalidCredentials",
      }),
    );
  });

  it("shows accessDenied toast on 403", async () => {
    const err = new Error("Forbidden") as any;
    err.response = { status: 403 };
    mockHandleLogin.mockRejectedValue(err);
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "login.toast.accessDenied",
      }),
    );
  });

  it("shows connectionError toast on unknown error", async () => {
    mockHandleLogin.mockRejectedValue({ response: { status: 500 } });
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "login.toast.connectionError",
      }),
    );
  });

  it("shows connectionError toast when there is no response", async () => {
    mockHandleLogin.mockRejectedValue(new Error("Network error"));
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    );
  });

  it("does not redirect on error", async () => {
    mockHandleLogin.mockRejectedValue({ response: { status: 401 } });
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("sets loading to false after error", async () => {
    mockHandleLogin.mockRejectedValue({ response: { status: 401 } });
    const wrapper = mountComponent();
    wrapper
      .findComponent(Form)
      .vm.$emit("submit", { valid: true, values: validValues });
    await flushPromises();

    const submitBtn = wrapper.find('button[type="submit"]');
    expect(submitBtn.attributes("disabled")).toBeUndefined();
  });
});

describe("LoginView – navigation", () => {
  it("navigates to /forgot-password when the forgot password button is clicked", async () => {
    mockPush.mockClear();
    const wrapper = mountComponent();
    const forgotBtn = wrapper
      .findAll("button[type='button']")
      .find((b) => b.text().includes("login.forgotPassword"));

    forgotBtn.trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("navigates to /signup when the signup link is clicked", async () => {
    mockPush.mockClear();
    const wrapper = mountComponent();
    const signupBtn = wrapper
      .findAll("button[type='button']")
      .find((b) => b.text().includes("login.signup"));

    signupBtn.trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/signup");
  });
});

describe("LoginView – OAuth", () => {
  it("calls loginWithGoogle when the OAuth button is clicked", async () => {
    const { loginWithGoogle } = await import("@/composables/useOAUTH");
    const wrapper = mountComponent();

    await wrapper.find('[data-testid="oauth-btn"]').trigger("click");

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });
});
