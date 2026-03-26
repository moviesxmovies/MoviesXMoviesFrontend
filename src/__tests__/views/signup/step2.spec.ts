import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignUpStep2 from "@/views/signup/step2.vue";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/repositories/auth/authRepository", () => ({
  FieldMsg: {
    name: "FieldMsg",
    template: '<span class="field-msg">{{ field?.errors?.[0]?.message }}</span>',
    props: ["field"],
  },
}));

vi.mock("primevue", () => ({
  Button: {
    name: "Button",
    template: '<button :type="type || \'button\'" v-bind="$attrs" @click="$emit(\'click\')">{{ label }}</button>',
    props: ["type", "label", "fluid", "outlined"],
    emits: ["click"],
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
  FileUpload: {
    name: "FileUpload",
    template: '<div><input type="file" data-testid="file-input" /></div>',
    props: ["mode", "auto", "chooseLabel", "accept", "maxFileSize", "multiple"],
    emits: ["select"],
  },
}));

vi.mock("@primevue/forms", () => ({
  Form: {
    name: "Form",
    template: '<form @submit.prevent="handleSubmit"><slot /></form>',
    props: ["resolver"],
    emits: ["submit"],
    setup(_: any, { emit }: any) {
      const handleSubmit = () => emit("submit", { valid: true, values: {} });
      return { handleSubmit };
    },
  },
  FormField: {
    name: "FormField",
    template: '<div><slot :field="fieldState" /></div>',
    props: ["name", "initialValue"],
    setup() {
      return { fieldState: { invalid: false, dirty: false, errors: [] } };
    },
  },
}));

vi.mock("@primevue/forms/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("@/schemas/signUpSchema", () => ({
  step2Schema: {},
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultModelValue = {
  username: "testuser",
  email: "test@example.com",
  password: "Secret123!",
  confirm_password: "Secret123!",
  first_name: "",
  last_name: "",
  image: null,
};

function mountComponent(modelValue = defaultModelValue) {
  return mount(SignUpStep2, {
    props: { modelValue },
    global: {
      mocks: { $t: (key: string) => key },
    },
    attachTo: document.body,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SignUpStep2 – rendering", () => {
  it("renders title and subtitle i18n keys", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("signup.profileTitle");
    expect(wrapper.text()).toContain("signup.step2Subtitle");
  });

  it("shows the camera placeholder when no image is selected", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".pi-camera").exists()).toBe(true);
    expect(wrapper.find("img[alt='Avatar']").exists()).toBe(false);
  });

  it("renders two FormFields: first_name and last_name", () => {
    const wrapper = mountComponent();
    const fields = wrapper.findAllComponents({ name: "FormField" });
    const names = fields.map((f) => f.props("name"));
    expect(names).toContain("first_name");
    expect(names).toContain("last_name");
  });

  it("renders a Back button and a SignUp submit button", () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAllComponents({ name: "Button" });
    const labels = buttons.map((b) => b.props("label"));
    expect(labels).toContain("signup.back");
    expect(labels).toContain("signup.signUp");
  });

  it("renders the hidden FileUpload component", () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent({ name: "FileUpload" }).exists()).toBe(true);
  });
});

// ── Avatar / image preview ────────────────────────────────────────────────────

describe("SignUpStep2 – image preview", () => {
  beforeEach(() => {
    // JSDOM does not implement createObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  });

  it("shows avatar <img> after a file is selected", async () => {
    const wrapper = mountComponent();
    const mockFile = new File(["content"], "avatar.png", { type: "image/png" });

    const fileUpload = wrapper.findComponent({ name: "FileUpload" });
    await fileUpload.vm.$emit("select", { files: [mockFile] });

    const avatar = wrapper.find("img[alt='Avatar']");
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes("src")).toBe("blob:mock-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it("hides the camera placeholder once an image is selected", async () => {
    const wrapper = mountComponent();
    const mockFile = new File(["content"], "avatar.png", { type: "image/png" });

    await wrapper.findComponent({ name: "FileUpload" }).vm.$emit("select", { files: [mockFile] });

    expect(wrapper.find(".pi-camera").exists()).toBe(false);
  });

  it("handles event.files as a single File (non-array)", async () => {
    const wrapper = mountComponent();
    const mockFile = new File(["content"], "single.jpg", { type: "image/jpeg" });

    await wrapper.findComponent({ name: "FileUpload" }).vm.$emit("select", { files: mockFile });

    expect(wrapper.find("img[alt='Avatar']").exists()).toBe(true);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });
});

// ── onFileSelect emits ────────────────────────────────────────────────────────

describe("SignUpStep2 – onFileSelect emits", () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  });

  it('emits "update:modelValue" spreading existing modelValue with the new image', async () => {
    const wrapper = mountComponent();
    const mockFile = new File(["img"], "photo.png", { type: "image/png" });

    await wrapper.findComponent({ name: "FileUpload" }).vm.$emit("select", { files: [mockFile] });

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toMatchObject({
      ...defaultModelValue,
      image: mockFile,
    });
  });

  it("preserves existing modelValue fields when emitting image update", async () => {
    const customModel = { ...defaultModelValue, username: "alice", email: "alice@x.com" };
    const wrapper = mountComponent(customModel);
    const mockFile = new File(["img"], "photo.png", { type: "image/png" });

    await wrapper.findComponent({ name: "FileUpload" }).vm.$emit("select", { files: [mockFile] });

    const payload = wrapper.emitted("update:modelValue")![0][0] as any;
    expect(payload.username).toBe("alice");
    expect(payload.email).toBe("alice@x.com");
    expect(payload.image).toBe(mockFile);
  });

  it("does NOT emit 'next' on file selection", async () => {
    const wrapper = mountComponent();
    const mockFile = new File(["img"], "photo.png", { type: "image/png" });

    await wrapper.findComponent({ name: "FileUpload" }).vm.$emit("select", { files: [mockFile] });

    expect(wrapper.emitted("next")).toBeUndefined();
  });
});

// ── onFormSubmit emits ────────────────────────────────────────────────────────

describe("SignUpStep2 – onFormSubmit emits", () => {
  it('emits "next" when form is valid', async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: true, values: {} });

    expect(wrapper.emitted("next")).toBeTruthy();
    expect(wrapper.emitted("next")!.length).toBe(1);
  });

  it('does NOT emit "next" when form is invalid', async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: false, values: {} });

    expect(wrapper.emitted("next")).toBeUndefined();
  });

  it('does NOT emit "update:modelValue" on submit (only "next")', async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "Form" }).vm.$emit("submit", { valid: true, values: {} });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});

// ── Back button ───────────────────────────────────────────────────────────────

describe("SignUpStep2 – back button", () => {
  it('emits "back" when the Back button is clicked', async () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAllComponents({ name: "Button" });
    const backBtn = buttons.find((b) => b.props("label") === "signup.back");

    await backBtn!.trigger("click");

    expect(wrapper.emitted("back")).toBeTruthy();
    expect(wrapper.emitted("back")!.length).toBe(1);
  });

  it('does NOT emit "next" when Back is clicked', async () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAllComponents({ name: "Button" });
    const backBtn = buttons.find((b) => b.props("label") === "signup.back");

    await backBtn!.trigger("click");

    expect(wrapper.emitted("next")).toBeUndefined();
  });
});

// ── triggerUpload ─────────────────────────────────────────────────────────────

describe("SignUpStep2 – triggerUpload", () => {
  it("calls click() on the hidden file input when the avatar area is clicked", async () => {
    const wrapper = mountComponent();
    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, "click");

    await wrapper.find(".group").trigger("click");

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});

// ── Props ─────────────────────────────────────────────────────────────────────

describe("SignUpStep2 – props", () => {
  it("mounts without errors with a full modelValue", () => {
    const wrapper = mountComponent({
      ...defaultModelValue,
      first_name: "John",
      last_name: "Doe",
    });
    expect(wrapper.exists()).toBe(true);
  });
});