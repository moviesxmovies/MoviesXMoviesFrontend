import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";
import OauthCallback from "@/views/OauthCallbackView.vue";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "primevue/usetoast";

const mockPush = vi.fn();
vi.mock("axios");
vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
  useRoute: vi.fn(() => ({
    query: {},
  })),
}));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: mockPush }) }));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({ handleLogin: mockPush }),
}));

describe("OauthCallback logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_URL_PROTOCOL", "http://localhost:8000");
  });

  it("Should redirect to /login if URL doesn't return code", async () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} });

    mount(OauthCallback);

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("Should login succesfully", async () => {
    vi.mocked(useRoute).mockReturnValue({ query: { code: "google-code-123" } });

    vi.mocked(axios.post).mockResolvedValue({
      data: { access: "token-acc", refresh: "token-ref" },
    });

    mount(OauthCallback);

    await flushPromises();

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/oauth/google/",
      { code: "google-code-123" },
    );

    const { handleLogin } = useAuthStore();
    expect(handleLogin).toHaveBeenCalledWith("token-acc", "token-ref");

    const { add } = useToast();
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    );
  });

  it("Should show 400 error and redirect to /login", async () => {
    vi.mocked(useRoute).mockReturnValue({ query: { code: "bad-code" } });

    vi.mocked(axios.post).mockRejectedValue({
      response: { status: 400 },
    });

    mount(OauthCallback);
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith("/login", {
      query: { error: "failed_google_auth" },
    });
  });
});
