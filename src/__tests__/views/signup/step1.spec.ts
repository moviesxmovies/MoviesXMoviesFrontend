import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignUpStep1 from "@/views/signup/step1.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

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

// Stub PrimeVue components so we can interact with native inputs
vi.mock("primevue", () => ({
  Button: {
    name: "Button",
    template: '<button :type="type" v-bind="$attrs">{{ label }}</button>',
    props: ["type", "label", "fluid"],
  },
  FloatLabel: {
    name: "FloatLabel",
    template: "<div><slot /></div>",
    props: ["variant"],
  },
  IconField: {
    name: "IconField",
    template: "<div><slot /></div>",
  },
  InputIcon: {
    name: "InputIcon",
    template: "<i />",
    props: ["class", "style"],
  },
  InputText: {
    name: "InputText",
    template: '<input v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["fluid"],
    emits: ["update:modelValue"],
  },
  Password: {
    name: "Password",
    template: '<input type="password" v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["feedback", "toggleMask", "fluid"],
    emits: ["update:modelValue"],
  },
}));

// Stub @primevue/forms
vi.mock("@primevue/forms", () => ({
  Form: {
    name: "Form",
    template: '<form @submit.prevent="handleSubmit"><slot /></form>',
    props: ["resolver"],
    emits: ["submit"],
    setup(props: any, { emit }: any) {
      const handleSubmit = () => {
        // Simulate form validation and emit
        emit("submit", { valid: true, values: {} });
      };
      return { handleSubmit };
    },
  },
  FormField: {
    name: "FormField",
    template: '<div><slot :field="fieldState" /></div>',
    props: ["name", "initialValue"],
    setup() {
      const fieldState = {
        invalid: false,
        dirty: false,
        errors: [],
      };
      return { fieldState };
    },
  },
}));

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("@/schemas/signUpSchema", () => ({
  step1Schema: {},
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultModelValue = {
  username: "",
  email: "",
  password: "",
  confirm_password: "",
};

function mountComponent(modelValue = defaultModelValue) {
  return mount(SignUpStep1, {
    props: { modelValue },
    global: {
      mocks: {
        $t: (key: string) => key, // i18n passthrough
      },
    },
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SignUpStep1 – rendering", () => {
  it("renders four form fields (username, email, password, confirm_password)", () => {
    const wrapper = mountComponent();
    // Each FormField renders a wrapping div; we look for named slots via props
    const formFields = wrapper.findAllComponents({ name: "FormField" });
    const names = formFields.map((f) => f.props("name"));
    expect(names).toContain("username");
    expect(names).toContain("email");
    expect(names).toContain("password");
    expect(names).toContain("confirm_password");
  });

  it("renders the submit button with correct label key", () => {
    const wrapper = mountComponent();
    const btn = wrapper.findComponent({ name: "Button" });
    expect(btn.props("label")).toBe("signup.next");
    expect(btn.props("type") ?? btn.attributes("type")).toBe("submit");
  });

  it("renders the OAuth button", () => {
    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="oauth-btn"]').exists()).toBe(true);
  });

  it("renders the 'or' divider with i18n key", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("signup.or");
  });
});

// ── Emit tests ────────────────────────────────────────────────────────────────

describe("SignUpStep1 – emits", () => {
  it('emits "update:modelValue" and "next" when form submits with valid data', async () => {
    const wrapper = mountComponent();
    const formValues = {
      username: "testuser",
      email: "test@example.com",
      password: "Secret123!",
      confirm_password: "Secret123!",
    };

    // Override the Form stub to emit valid data
    const form = wrapper.findComponent({ name: "Form" });
    await form.vm.$emit("submit", { valid: true, values: formValues });

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0][0]).toEqual(formValues);
    expect(wrapper.emitted("next")).toBeTruthy();
  });

  it('does NOT emit "next" when form submits with invalid data', async () => {
    const wrapper = mountComponent();

    const form = wrapper.findComponent({ name: "Form" });
    await form.vm.$emit("submit", { valid: false, values: {} });

    expect(wrapper.emitted("next")).toBeFalsy();
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it('does NOT emit "update:modelValue" when valid is false', async () => {
    const wrapper = mountComponent();

    const form = wrapper.findComponent({ name: "Form" });
    await form.vm.$emit("submit", { valid: false, values: { username: "x" } });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});

// ── OAuth tests ───────────────────────────────────────────────────────────────

describe("SignUpStep1 – OAuth", () => {
  it("calls loginWithGoogle when the OAuth button is clicked", async () => {
    const { loginWithGoogle } = await import("@/composables/useOAUTH");
    const wrapper = mountComponent();

    await wrapper.find('[data-testid="oauth-btn"]').trigger("click");

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });
});

// ── onFormSubmit logic (unit) ─────────────────────────────────────────────────

describe("SignUpStep1 – onFormSubmit logic", () => {
  it("emits both events with the received values when valid=true", async () => {
    const wrapper = mountComponent();
    const values = { username: "alice", email: "alice@test.com", password: "Passw0rd!", confirm_password: "Passw0rd!" };

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: true, values });

    expect(wrapper.emitted("update:modelValue")![0][0]).toStrictEqual(values);
    expect(wrapper.emitted("next")!.length).toBe(1);
  });

  it("emits neither event when valid=false regardless of values", async () => {
    const wrapper = mountComponent();
    const values = { username: "alice", email: "alice@test.com", password: "Passw0rd!", confirm_password: "Passw0rd!" };

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: false, values });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("next")).toBeUndefined();
  });

  it("passes through arbitrary extra values untouched", async () => {
    const wrapper = mountComponent();
    const values = { username: "bob", email: "bob@test.com", password: "P@ss!", confirm_password: "P@ss!", extra: "data" };

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: true, values });

    expect(wrapper.emitted("update:modelValue")![0][0]).toMatchObject({ extra: "data" });
  });
});

// ── Props ─────────────────────────────────────────────────────────────────────

describe("SignUpStep1 – props", () => {
  it("accepts a modelValue prop without errors", () => {
    const wrapper = mountComponent({ username: "prefilled", email: "pre@test.com", password: "", confirm_password: "" });
    expect(wrapper.exists()).toBe(true);
  });
});