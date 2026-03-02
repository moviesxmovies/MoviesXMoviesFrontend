import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { useRouter, useRoute } from "vue-router";
import OauthCallback from "@/views/OauthCallbackView.vue";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "primevue/usetoast";
import { api } from "@/composables/useAPI";

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

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: vi.fn(() => ({ query: {} })),
}));

vi.mock("primevue/usetoast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    handleLogin: mockHandleLogin,
  })),
}));

describe("OauthCallback logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_URL_PROTOCOL", "http://localhost:8000");
  });

  it("Should redirect to /login if URL doesn't return code", async () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} } as any);

    mount(OauthCallback);

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("Should login successfully", async () => {
    vi.mocked(useRoute).mockReturnValue({
      query: { code: "google-code-123" },
    } as any);

    vi.mocked(api.post).mockResolvedValue({
      data: { access: "token-acc", refresh: "token-ref" },
    });

    mount(OauthCallback);
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/oauth/google/",
      { code: "google-code-123" },
    );

    expect(mockHandleLogin).toHaveBeenCalledWith("token-acc", "token-ref");

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Success" }),
    );
  });

  it("Should show error and redirect on 400 failure", async () => {
    vi.mocked(useRoute).mockReturnValue({ query: { code: "bad-code" } } as any);

    vi.mocked(api.post).mockRejectedValue({
      response: { status: 400 },
    });

    mount(OauthCallback);
    await flushPromises();

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    );
  });
});
