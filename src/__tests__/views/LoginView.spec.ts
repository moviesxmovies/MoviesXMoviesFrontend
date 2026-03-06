import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import LoginView from "../../views/LoginView.vue";
import { api } from "../../composables/useAPI";
import { Button, InputText, Password } from "primevue";
import { useAuthStore } from "../../stores/authStore";
import i18n from "../../i18n";

let vi_storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: vi.fn((key: string) => vi_storage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    vi_storage[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete vi_storage[key];
  }),
  clear: vi.fn(() => {
    vi_storage = {};
  }),
});

vi.mock("@/composables/useAPI", () => ({ api: { post: vi.fn() } }));
const mockPush = vi.fn();
vi.mock("vue-router", () => ({ useRouter: () => ({ push: mockPush }) }));
const mockToast = { add: vi.fn() };
vi.mock("primevue/usetoast", () => ({ useToast: () => mockToast }));
const mockSetTokens = vi.fn();
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    token: null,
    refreshToken: null,
    setTokens: mockSetTokens,
    isAuthenticated: false,
  }),
}));

describe("LoginView.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  const factory = () => {
    return mount(LoginView, {
      global: {
        plugins: [PrimeVue, ToastService, i18n],
        components: { Button, InputText, Password },
      },
    });
  };

  it("should fill inputs and call api on success", async () => {
    const wrapper = factory();

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access: "ok", refresh: "ok" },
    });

    const usernameInput = wrapper.findComponent(InputText);
    const passwordInput = wrapper.findComponent(Password);

    await usernameInput.setValue("my-user");
    await passwordInput.find("input").setValue("my-password");

    await wrapper.find("button").trigger("click");

    await flushPromises();

    expect(api.post).toHaveBeenCalled();
    const authStore = useAuthStore();
    expect(authStore.setTokens).toHaveBeenCalledWith("ok", "ok");
  });

  it("should show error toast on 403 (Cloudflare/CSRF)", async () => {
    const wrapper = factory();

    vi.mocked(api.post).mockRejectedValueOnce({
      response: { status: 403 },
    });

    await wrapper.findComponent(InputText).setValue("user");
    await wrapper.findComponent(Password).find("input").setValue("pass");
    await wrapper.find("button").trigger("click");

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: "Access denied (Check Cloudflare/CSRF)",
      }),
    );
  });

  it("should show error toast on 401 (Invalid credentials)", async () => {
    const wrapper = factory();

    vi.mocked(api.post).mockRejectedValueOnce({
      response: { status: 401 },
    });

    await wrapper.findComponent(InputText).setValue("user");
    await wrapper.findComponent(Password).find("input").setValue("pass");
    await wrapper.find("button").trigger("click");

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: "Incorrect username or password",
      }),
    );
  });

  it("should return if validation fails", async () => {
    const wrapper = factory();

    await wrapper.find("button").trigger("click");

    expect(api.post).not.toHaveBeenCalled();
  });
  it("should clear username error when user types (@input)", async () => {
    const wrapper = factory();
    const vm = wrapper.vm as any;
    await wrapper.find("button").trigger("click");
    expect(vm.errors.username).toBeDefined();

    const usernameInput = wrapper.findComponent(InputText);
    await usernameInput.setValue("admin");

    await usernameInput.vm.$emit("input");

    expect(vm.errors.username).toBe("");
  });

  it("should flatten Zod array errors into a single string (coverage for Array.isArray)", async () => {
    const wrapper = factory();
    const vm = wrapper.vm as any;

    await wrapper.find("button").trigger("click");

    const usernameError = vm.errors.username;
    expect(typeof usernameError).toBe("string");
    expect(Array.isArray(usernameError)).toBe(false);
    expect(usernameError).toBe("Username is required");
  });
});
