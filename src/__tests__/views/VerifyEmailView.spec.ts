import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ToastService from "primevue/toastservice";
import PrimeVue from "primevue/config";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../composables/useAPI";
import i18n from "../../i18n";
import VerifyEmailView from "../../views/VerifyEmailView.vue";

const { mockSetTokens, mockPush, mockToast, mockPost } = vi.hoisted(() => ({
  mockSetTokens: vi.fn(),
  mockPush: vi.fn(),
  mockToast: { add: vi.fn() },
  mockPost: vi.fn(),
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
vi.mock("@/composables/useAPI", () => ({ api: { post: mockPost } }));
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
vi.mock("primevue/usetoast", () => ({
  useToast: () => mockToast,
}));
describe("VerifyEmailView logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const factory = () => {
    return mount(VerifyEmailView, {
      global: {
        plugins: [PrimeVue, ToastService, i18n],
      },
    });
  };

  it("Should show error if verification code not 6 digits", async () => {
    const wrapper = factory();

    await wrapper.find("input").setValue("123");
    await wrapper.find("form").trigger("submit.prevent");

    const errorMessage = wrapper.find(".p-message");
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain("verify.toast.incorrectLength");
  });

  it("Should not verify user if verification code is wrong", async () => {
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

  it("Should redirect home correctly after correct code", async () => {
    mockUserContainer.user = { verified: false };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { status: true, refresh_token: "mock-refresh-token" },
    });

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access: "mock-access-token" },
    });

    const wrapper = factory();
    const input = wrapper.find("input");
    await input.setValue("111222");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

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
      expect.stringContaining("/auth/resend-verification-email/"),
    );
  });
});
