import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import VerifyEmailView from "@/views/VerifyEmailView.vue";
import { mount } from "@vue/test-utils";
import ToastService from "primevue/toastservice";
import { Button, InputOtp, Message } from "primevue";
import PrimeVue from "primevue/config";
import { api } from "@/composables/useAPI";
import { useAuthStore } from "../../stores/authStore";
import i18n from "@/i18n";

const mockPush = vi.fn();
const mockToast = { add: vi.fn() };
const mockHandleLogin = vi.fn();

const mockUser = { verified: false };

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    handleLogin: mockHandleLogin,
  })),
}));
vi.mock("@/composables/useAPI", () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));
vi.mock("@/config", () => ({
  config: {
    googleClientId: "test-client-id",
    callbackUri: "http://localhost:5173",
    apiUrl: "http://localhost:8000/api",
  },
}));
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: vi.fn(() => ({ query: {} })),
}));
vi.mock("primevue/usetoast", () => ({ useToast: () => mockToast }));
describe("VerifyEmailView logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const factory = () => {
    return mount(VerifyEmailView, {
      global: {
        plugins: [PrimeVue, ToastService, i18n],
        components: { InputOtp, Message, Button },
      },
    });
  };

  it("Should send toast error if verification code not 6 digits", async () => {
    const wrapper = factory();

    await wrapper.find("input").setValue("123");
    await wrapper.find("form").trigger("submit.prevent");

    const errorMessage = wrapper.find(".p-message");
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain(
      "Please enter the full 6-digit code.",
    );
  });

  it("Should send toast error if verification code is wrong", async () => {
    const wrapper = factory();
    const authStore = useAuthStore();

    vi.mocked(api.post).mockRejectedValue({
      response: {
        status: false,
        data: { message: "Invalid verification code. Please try again." },
      },
    });

    const input = wrapper.find("input");
    await input.setValue("111222");

    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    expect(authStore.user?.verified).toBe(false);
  });

  it("Should redirect home correctly and show toast", async () => {
    const wrapper = factory();
    const authStore = useAuthStore();

    vi.mocked(api.post).mockResolvedValue({ data: { status: true } });

    const input = wrapper.find("input");
    await input.setValue("111222");

    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    expect(authStore.user?.verified).toBe(true);
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("Should send resend-verification-email and show success toast", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const wrapper = factory();

    const resendBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Resend code"));
    await resendBtn?.trigger("click");

    await flushPromises();

    expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/resend-verification-email/"),
    );
  });
});
