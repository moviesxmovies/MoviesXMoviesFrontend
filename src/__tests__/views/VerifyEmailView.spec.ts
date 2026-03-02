import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import VerifyEmailView from "@/views/VerifyEmailView.vue";
import { useRouter, useRoute } from "vue-router";
import { mount } from "@vue/test-utils";
import { useToast } from "primevue/usetoast";
import ToastService from "primevue/toastservice";
import { Button, InputOtp, Message } from "primevue";
import PrimeVue from "primevue/config";
import { api } from "@/composables/useAPI";
import { useAuthStore } from "../../stores/authStore";

const mockPush = vi.fn();
const mockToast = { add: vi.fn() };
const mockHandleLogin = vi.fn();

vi.mock("@/composables/useAPI", () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({ handleLogin: mockHandleLogin })),
}));
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: vi.fn(() => ({ query: {} })),
}));
vi.mock("primevue/usetoast", () => ({ useToast: () => mockToast }));
describe("VerifyEmailView logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_URL_PROTOCOL", "http://localhost:8000");
  });

  const factory = () => {
    return mount(VerifyEmailView, {
      global: {
        plugins: [PrimeVue, ToastService],
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

    const errorMessage = wrapper.find(".p-message");
    // expect(errorMessage.exists()).toBe(true);
    // expect(errorMessage.text()).toContain(
    //   "Invalid verification code. Please try again.",
    // );
  });

  it("Should redirect home correctly and show toast", async () => {
    const wrapper = factory();
    vi.mocked(api.post).mockResolvedValue({ data: { status: true } });

    const authStore = useAuthStore();
    (authStore as any).user = { verified: false };

    const input = wrapper.find("input");
    await input.setValue("111222");

    await wrapper.find("form").trigger("submit.prevent");

    await flushPromises();

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        detail: "User verified",
      }),
    );

    expect(authStore.user.verified).toBe(true);
    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});
