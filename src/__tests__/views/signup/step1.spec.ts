import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import PrimeVue from "primevue/config";
import { Form, FormField } from "@primevue/forms";
import SignUpStep1 from "@/views/signup/step1.vue";

vi.mock("@/composables/useOAUTH", () => ({
  loginWithGoogle: vi.fn(),
}));

vi.mock("@/repositories/auth/authRepository", () => ({
  FieldMsg: {
    name: "FieldMsg",
    template: '<span class="field-msg">{{ field?.errors?.[0]?.message }}</span>',
    props: ["field"],
  },
}));

vi.mock("@/components/oauthButtonComponent.vue", () => ({
  default: {
    name: "OauthButtonComponent",
    template: '<button data-testid="oauth-btn" @click="$emit(\'click\')">Google</button>',
    emits: ["click"],
  },
}));

vi.mock("@/schemas/signUpSchema", () => ({
  step1Schema: {},
}));
vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({ query: {} })),
}));
const globalConfig = {
  plugins: [PrimeVue],
  components: { Form, FormField },
  mocks: { $t: (key: string) => key },
};

const defaultModelValue = {
  username: "",
  email: "",
  password: "",
  confirm_password: "",
};

function mountComponent(modelValue = defaultModelValue) {
  return mount(SignUpStep1, {
    props: { modelValue },
    global: globalConfig,
  });
}

describe("SignUpStep1 rendering", () => {
  it("renders i18n keys for title and subtitle", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("signup.title");
    expect(wrapper.text()).toContain("signup.step1.subtitle");
  });

  it("renders four FormField components (username, email, password, confirm_password)", () => {
    const wrapper = mountComponent();
    const formFields = wrapper.findAllComponents(FormField);
    const names = formFields.map((f) => f.props("name"));
    expect(names).toContain("username");
    expect(names).toContain("email");
    expect(names).toContain("password");
    expect(names).toContain("confirm_password");
  });

  it("renders a submit button with the correct label in the DOM", () => {
    const wrapper = mountComponent();
    const btn = wrapper.find('button[type="submit"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain("next");
  });

  it("renders the OAuth button", () => {
    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="oauth-btn"]').exists()).toBe(true);
  });

  it("renders the 'or' divider with i18n key", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("signup.or");
  });

  it("renders username and email as native text inputs in the DOM", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("input#username").exists()).toBe(true);
    expect(wrapper.find("input#email").exists()).toBe(true);
  });

  it("renders at least two password inputs (password + confirm_password)", () => {
    const wrapper = mountComponent();
    const passwordInputs = wrapper.findAll('input[type="password"]');
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SignUpStep1 emits", () => {
  it('emits "update:modelValue" and "next" when form submits with valid data', async () => {
    const wrapper = mountComponent();
    const formValues = {
      username: "testuser",
      email: "test@example.com",
      password: "Secret123!",
      confirm_password: "Secret123!",
    };

    await wrapper.findComponent(Form).vm.$emit("submit", { valid: true, values: formValues });

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0][0]).toEqual(formValues);
    expect(wrapper.emitted("next")).toBeTruthy();
  });

  it('does NOT emit "next" when form submits with invalid data', async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent(Form).vm.$emit("submit", { valid: false, values: {} });

    expect(wrapper.emitted("next")).toBeFalsy();
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it('does NOT emit "update:modelValue" when valid is false', async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent(Form).vm.$emit("submit", { valid: false, values: { username: "x" } });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("passes through arbitrary extra values untouched", async () => {
    const wrapper = mountComponent();
    const values = {
      username: "bob",
      email: "bob@test.com",
      password: "P@ss!",
      confirm_password: "P@ss!",
      extra: "data",
    };

    await wrapper.findComponent(Form).vm.$emit("submit", { valid: true, values });

    expect(wrapper.emitted("update:modelValue")![0][0]).toMatchObject({ extra: "data" });
  });
});

describe("SignUpStep1 OAuth", () => {
  it("calls loginWithGoogle when the OAuth button is clicked", async () => {
    const { loginWithGoogle } = await import("@/composables/useOAUTH");
    const wrapper = mountComponent();

    await wrapper.find('[data-testid="oauth-btn"]').trigger("click");

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });
});

describe("SignUpStep1 props", () => {
  it("accepts a prefilled modelValue without errors", () => {
    const wrapper = mountComponent({
      username: "prefilled",
      email: "pre@test.com",
      password: "",
      confirm_password: "",
    });
    expect(wrapper.exists()).toBe(true);
  });
  describe("SignUpStep1 fieldErrors", () => {
    it("renders __general__ error block when provided", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: { __general__: ["Esta contraseña es demasiado común."] },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Esta contraseña es demasiado común.");
    });

    it("renders multiple __general__ errors", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: {
            __general__: ["Error uno.", "Error dos."],
          },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Error uno.");
      expect(wrapper.text()).toContain("Error dos.");
    });

    it("does NOT render __general__ block when array is empty", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: { __general__: [] },
        },
        global: globalConfig,
      });

      expect(wrapper.find(".pi-exclamation-circle").exists()).toBe(false);
    });

    it("renders username field error from backend", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: { username: ["Ya existe un usuario con este nombre."] },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Ya existe un usuario con este nombre.");
    });

    it("renders email field error from backend", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: { email: ["Ya existe Usuario con este Email."] },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Ya existe Usuario con este Email.");
    });

    it("renders confirm_password field error from backend", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: { confirm_password: ["Las contraseñas no coinciden."] },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Las contraseñas no coinciden.");
    });

    it("renders multiple field errors for the same field", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: {
            username: ["Error A.", "Error B."],
          },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Error A.");
      expect(wrapper.text()).toContain("Error B.");
    });

    it("does NOT render field error divs when fieldErrors is undefined", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: undefined,
        },
        global: globalConfig,
      });

      expect(wrapper.find(".pi-times-circle").exists()).toBe(false);
    });

    it("does NOT render field error divs when fieldErrors is empty object", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: {},
        },
        global: globalConfig,
      });

      expect(wrapper.findAll(".pi-times-circle")).toHaveLength(0);
    });

    it("renders both __general__ and field-specific errors simultaneously", () => {
      const wrapper = mount(SignUpStep1, {
        props: {
          modelValue: defaultModelValue,
          fieldErrors: {
            __general__: ["Esta contraseña es demasiado común."],
            username: ["Ya existe un usuario con este nombre."],
          },
        },
        global: globalConfig,
      });

      expect(wrapper.text()).toContain("Esta contraseña es demasiado común.");
      expect(wrapper.text()).toContain("Ya existe un usuario con este nombre.");
    });
  });

  describe("SignUpStep1 route query", () => {
    it("prefills email field from route.query.email", async () => {
      const { useRoute } = await import("vue-router");
      vi.mocked(useRoute).mockReturnValueOnce({
        query: { email: "prefilled@example.com" },
      } as any);

      const wrapper = mount(SignUpStep1, {
        props: { modelValue: defaultModelValue },
        global: globalConfig,
      });

      const emailInput = wrapper.find("input#email");
      expect(emailInput.exists()).toBe(true);
      const emailField = wrapper
        .findAllComponents(FormField)
        .find((f) => f.props("name") === "email");
      expect(emailField?.props("initialValue")).toBe("prefilled@example.com");
    });

    it("uses empty string as initialValue when route.query.email is absent", () => {
      const wrapper = mount(SignUpStep1, {
        props: { modelValue: defaultModelValue },
        global: globalConfig,
      });

      const emailField = wrapper
        .findAllComponents(FormField)
        .find((f) => f.props("name") === "email");
      expect(emailField?.props("initialValue")).toBe("");
    });
  });

});