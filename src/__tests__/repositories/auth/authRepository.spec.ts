import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  handleRegister,
  handleLogin,
  oauthLogin,
  refreshToken,
  forgotPassword,
  resetPassword,
  FieldMsg,
} from "../../../repositories/auth/authRepository";
import { api } from "@/composables/useAPI";
import { mount } from "@vue/test-utils";

const { mockPost, mockSetTokens, mockLogout, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockSetTokens: vi.fn(),
  mockLogout: vi.fn(),
  mockGet: vi.fn(),
}));
const mockStoreState = {
  refreshToken: "",
};
vi.mock("@/composables/useAPI", () => ({
  api: {
    post: mockPost,
    get: mockGet,
  },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    setTokens: mockSetTokens,
    logout: mockLogout,
    get refreshToken() { return mockStoreState.refreshToken },
    set refreshToken(val) { mockStoreState.refreshToken = val }
  })),
}));

vi.mock("@/config", () => ({
  config: {
    apiUrl: "http://localhost:8000/api",
  },
}));

describe("AuthRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.refreshToken = "";
  });

  // handleRegister
  it("handleRegister calls API with correct parameters and returns data", async () => {
    const userData = {
      first_name: "John",
      last_name: "Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    mockPost.mockResolvedValueOnce({ data: userData });

    const result = await handleRegister(userData);

    expect(mockPost).toHaveBeenCalledWith("/auth/signup/", userData);
    expect(result).toEqual(userData);
  });

  it("handleRegister throws when API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"));

    await expect(handleRegister({} as any)).rejects.toThrow("Network error");
  });

  // handleLogin
  it("handleLogin calls API with correct parameters and sets tokens", async () => {
    mockPost.mockResolvedValueOnce({
      data: { access: "access-token", refresh: "refresh-token" },
    });

    await handleLogin({ username: "johndoe", password: "Password123!" });

    expect(mockPost).toHaveBeenCalledWith("/auth/login/", {
      username: "johndoe",
      password: "Password123!",
    });
    expect(mockSetTokens).toHaveBeenCalledWith("access-token", "refresh-token");
  });

  it("handleLogin throws when API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(
      handleLogin({ username: "johndoe", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");
  });

  // oauthLogin
  it("oauthLogin calls API with correct code and sets tokens", async () => {
    mockPost.mockResolvedValueOnce({
      data: { access: "access-token", refresh: "refresh-token" },
    });

    await oauthLogin("oauth-code-123");

    expect(mockPost).toHaveBeenCalledWith("/oauth/google/", {
      code: "oauth-code-123",
    });
    expect(mockSetTokens).toHaveBeenCalledWith("access-token", "refresh-token");
  });

  it("oauthLogin throws when API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("OAuth error"));

    await expect(oauthLogin("bad-code")).rejects.toThrow("OAuth error");
  });

  it("refreshToken calls API with correct token and sets tokens", async () => {
    mockPost.mockResolvedValueOnce({ data: { access: "new-access-token" } });

    mockStoreState.refreshToken = "my-refresh-token";

    await refreshToken();

    expect(mockPost).toHaveBeenCalledWith("/auth/refresh/", {
      refresh: "my-refresh-token",
    });
    expect(mockSetTokens).toHaveBeenCalledWith("new-access-token");
  });

  it("refreshToken throws when API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Token expired"));

    await expect(refreshToken()).rejects.toThrow("Token expired");
  });

  // forgotPassword
  it("forgotPassword calls API with correct email", async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: "Code sent to your mail" },
    });

    const result = await forgotPassword("john.doe@example.com");

    expect(mockGet).toHaveBeenCalledWith("/auth/forgot-password/", {
      params: {
        email: "john.doe@example.com",
        lang: "en",
        _t: expect.any(Number),
      },
    });
    expect(result).toEqual("Code sent to your mail");
  });

  it("forgotPassword throws error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Email not found"));

    await expect(forgotPassword("nonexistent@example.com")).rejects.toThrow(
      "Email not found",
    );
  });

  // resetPassword
  it("resetPassword calls API with correct parameters", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: "Password reset successful" },
    });

    const result = await resetPassword("123", "new-pass", "test@test.com");

    expect(api.post).toHaveBeenCalledWith(
      "/auth/forgot-password/",
      expect.any(Object),
    );
    expect(result).toBe("Password reset successful");
  });

  it("resetPassword throws error", async () => {
    mockPost.mockRejectedValueOnce(new Error("Email not found"));

    await expect(resetPassword("123", "new-pass", "test@test.com")).rejects.toThrow(
      "Email not found",
    );
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function mountFieldMsg(field: Record<string, any> | undefined) {
  return mount(FieldMsg, { props: { field } });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FieldMsg", () => {
  describe("when field is undefined / null", () => {
    it("renders nothing when field is undefined", () => {
      const wrapper = mountFieldMsg(undefined);
      expect(wrapper.html()).toBe("");
    });

    it("renders nothing when field is null", () => {
      const wrapper = mountFieldMsg(undefined); // null cast as undefined
      expect(wrapper.html()).toBe("");
    });
  });

  describe("when field.dirty is false", () => {
    it("renders nothing when dirty=false and invalid=false", () => {
      const wrapper = mountFieldMsg({
        dirty: false,
        invalid: false,
        error: null,
      });
      expect(wrapper.html()).toBe("");
    });

    it("renders nothing when dirty=false even if there is an error", () => {
      const wrapper = mountFieldMsg({
        dirty: false,
        invalid: true,
        error: { message: "Required" },
      });
      expect(wrapper.html()).toBe("");
    });
  });

  describe("when field.dirty is true and field.invalid is true", () => {
    it("renders a div.field-msg.error", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: { message: "Invalid email" },
      });
      const div = wrapper.find("div.field-msg.error");
      expect(div.exists()).toBe(true);
    });

    it("renders the error icon inside the div", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: { message: "Required" },
      });
      expect(wrapper.find("i.pi.pi-times-circle.msg-icon").exists()).toBe(true);
    });

    it("renders the error message text", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: { message: "Field is required" },
      });
      expect(wrapper.text()).toContain("Field is required");
    });

    it("renders nothing for the message when error is null", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: null,
      });
      const div = wrapper.find("div.field-msg.error");
      expect(div.exists()).toBe(true);
      // icon exists but no text beyond it
      expect(div.text()).toBe("");
    });

    it("renders nothing for the message when error.message is undefined", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: {},
      });
      expect(wrapper.find("div.field-msg.error").exists()).toBe(true);
      expect(wrapper.text()).toBe("");
    });
  });

  describe("when field.dirty is true and field.invalid is false", () => {
    it("renders nothing (valid dirty field shows no message)", () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: false,
        error: null,
      });
      expect(wrapper.html()).toBe("");
    });
  });

  describe("reactivity – field prop changes", () => {
    it("shows error message after field becomes dirty+invalid", async () => {
      const wrapper = mountFieldMsg({
        dirty: false,
        invalid: false,
        error: null,
      });
      expect(wrapper.html()).toBe("");

      await wrapper.setProps({
        field: {
          dirty: true,
          invalid: true,
          error: { message: "Too short" },
        },
      });

      expect(wrapper.find("div.field-msg.error").exists()).toBe(true);
      expect(wrapper.text()).toContain("Too short");
    });

    it("hides error message after field becomes valid", async () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: { message: "Required" },
      });
      expect(wrapper.find("div.field-msg.error").exists()).toBe(true);

      await wrapper.setProps({
        field: { dirty: true, invalid: false, error: null },
      });

      expect(wrapper.html()).toBe("");
    });

    it("updates message text when error changes", async () => {
      const wrapper = mountFieldMsg({
        dirty: true,
        invalid: true,
        error: { message: "Too short" },
      });
      expect(wrapper.text()).toContain("Too short");

      await wrapper.setProps({
        field: {
          dirty: true,
          invalid: true,
          error: { message: "Invalid format" },
        },
      });

      expect(wrapper.text()).toContain("Invalid format");
      expect(wrapper.text()).not.toContain("Too short");
    });
  });
});
