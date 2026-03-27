import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PrimeVue from "primevue/config";
import LoginView from "@/views/LoginView.vue"; // adjust path as needed

const { mockHandleLogin, mockToastAdd, mockPush, mockLoginWithGoogle } =
  vi.hoisted(() => ({
    mockHandleLogin: vi.fn(),
    mockToastAdd: vi.fn(),
    mockPush: vi.fn(),
    mockLoginWithGoogle: vi.fn(),
  }));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/repositories/auth/authRepository", () => ({
  handleLogin: mockHandleLogin,
  FieldMsg: {
    name: "FieldMsg",
    template: "<span />",
    props: ["field"],
  },
}));

vi.mock("primevue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("primevue")>();
  return {
    ...actual,
    useToast: () => ({ add: mockToastAdd }),
  };
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/composables/useOAUTH", () => ({
  loginWithGoogle: mockLoginWithGoogle,
}));

vi.mock("@/schemas/loginSchema", () => ({
  loginSchema: {},
}));

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@primevue/forms", () => ({
  Form: {
    name: "Form",
    template: "<form @submit.prevent><slot /></form>",
    props: ["resolver"],
    emits: ["submit"],
  },
  FormField: {
    name: "FormField",
    template:
      '<div><slot :field="{ invalid: false, dirty: false, errors: [] }" /></div>',
    props: ["name", "initialValue"],
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const globalConfig = {
  plugins: [PrimeVue],
  mocks: { $t: (key: string) => key },
};

function mountComponent() {
  return mount(LoginView, { global: globalConfig });
}

function mountWithFieldState(
  name: string,
  state: { dirty: boolean; invalid: boolean },
) {
  return mount(LoginView, {
    global: {
      ...globalConfig,
      components: {
        FormField: {
          name: "FormField",
          template: '<div><slot :field="fieldState" /></div>',
          props: ["name", "initialValue"],
          setup(props: any) {
            const fieldState =
              props.name === name
                ? { ...state, errors: [] }
                : { dirty: false, invalid: false, errors: [] };
            return { fieldState };
          },
        },
      },
    },
  });
}

const validValues = { username: "testuser", password: "Secret123!" };

async function submitForm(
  wrapper: ReturnType<typeof mountComponent>,
  valid = true,
) {
  await wrapper
    .findComponent({ name: "Form" })
    .vm.$emit("submit", { valid, values: validValues });
  await flushPromises();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("LoginView rendering", () => {
  it("renders title and subtitle i18n keys", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("login.title");
    expect(wrapper.text()).toContain("login.subtitle");
  });

  it("renders username and password FormFields", () => {
    const wrapper = mountComponent();
    const fields = wrapper.findAllComponents({ name: "FormField" });
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

// ── login() – happy path ──────────────────────────────────────────────────────

describe("LoginView login() success", () => {
  beforeEach(() => {
    mockHandleLogin.mockResolvedValue(undefined);
    mockToastAdd.mockClear();
    mockPush.mockClear();
  });

  it("calls handleLogin with the form values", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockHandleLogin).toHaveBeenCalledWith(validValues);
  });

  it("shows a success toast", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        detail: "login.toast.success",
      }),
    );
  });

  it("redirects to /home", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});

// ── login() – invalid form ────────────────────────────────────────────────────

describe("LoginView login() invalid form", () => {
  beforeEach(() => {
    mockHandleLogin.mockClear();
    mockToastAdd.mockClear();
    mockPush.mockClear();
  });

  it("does not call handleLogin when valid=false", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper, false);

    expect(mockHandleLogin).not.toHaveBeenCalled();
  });

  it("does not redirect when valid=false", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper, false);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not show a toast when valid=false", async () => {
    const wrapper = mountComponent();
    await submitForm(wrapper, false);

    expect(mockToastAdd).not.toHaveBeenCalled();
  });
});

// ── login() – error handling ──────────────────────────────────────────────────

describe("LoginView login() error handling", () => {
  beforeEach(() => {
    mockToastAdd.mockClear();
    mockPush.mockClear();
  });

  const makeAxiosError = (status: number, detail: string) => {
    const err = new Error() as any;
    err.response = { status, data: { detail } };
    return err;
  };

  it("shows the API detail message on error", async () => {
    mockHandleLogin.mockRejectedValue(
      makeAxiosError(401, "Invalid credentials"),
    );
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "Invalid credentials",
      }),
    );
  });

  it("shows undefined detail when error has no response body", async () => {
    mockHandleLogin.mockRejectedValue(new Error("Network error"));
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", detail: undefined }),
    );
  });

  it("does not redirect on error", async () => {
    mockHandleLogin.mockRejectedValue(makeAxiosError(401, "Unauthorized"));
    const wrapper = mountComponent();
    await submitForm(wrapper);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("always shows an error toast regardless of status code", async () => {
    for (const status of [400, 401, 403, 500]) {
      mockToastAdd.mockClear();
      mockHandleLogin.mockRejectedValue(
        makeAxiosError(status, `Error ${status}`),
      );
      const wrapper = mountComponent();
      await submitForm(wrapper);

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" }),
      );
    }
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe("LoginView navigation", () => {
  beforeEach(() => mockPush.mockClear());

  it("navigates to /forgot-password", async () => {
    const wrapper = mountComponent();
    const btn = wrapper
      .findAll("button[type='button']")
      .find((b) => b.text().includes("login.forgotPassword"));
    await btn!.trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("navigates to /signup", async () => {
    const wrapper = mountComponent();
    const btn = wrapper
      .findAll("button[type='button']")
      .find((b) => b.text().includes("login.signup"));
    await btn!.trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/signup");
  });
});

// ── OAuth ─────────────────────────────────────────────────────────────────────

describe("LoginView OAuth", () => {
  it("calls loginWithGoogle when the OAuth button is clicked", async () => {
    const wrapper = mountComponent();
    await wrapper.find('[data-testid="oauth-btn"]').trigger("click");

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
  });
});
