import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  handleRegister,
  handleLogin,
  oauthLogin,
  refreshToken,
  forgotPassword,
} from "../../../repositories/auth/authRepository";

const { mockPost, mockSetTokens, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockSetTokens: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    post: mockPost,
    get: mockGet,
  },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    setTokens: mockSetTokens,
    logout: vi.fn(),
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

  // refreshToken
  it("refreshToken calls API with correct token and sets tokens", async () => {
    mockPost.mockResolvedValueOnce({ data: { access: "new-access-token" } });

    await refreshToken("my-refresh-token");

    expect(mockPost).toHaveBeenCalledWith("/auth/refresh/", {
      refresh_token: "my-refresh-token",
    });
    expect(mockSetTokens).toHaveBeenCalledWith(
      "new-access-token",
      "my-refresh-token",
    );
  });

  it("refreshToken throws when API fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Token expired"));

    await expect(refreshToken("bad-token")).rejects.toThrow("Token expired");
  });

  // forgotPassword
  it("forgotPassword calls API with correct email", async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: "Password reset successful" },
    });

    const result = await forgotPassword("john.doe@example.com");

    expect(mockGet).toHaveBeenCalledWith("/auth/forgot-password/", {
      params: {
        email: "john.doe@example.com",
        lang: "en",
      },
    });
    expect(result).toEqual("Password reset successful");
  });

  it("forgotPassword throws error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Email not found"));

    await expect(forgotPassword("nonexistent@example.com")).rejects.toThrow(
      "Email not found",
    );
  });
});
