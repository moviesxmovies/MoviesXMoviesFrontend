import { vi, describe, it, expect } from "vitest";
import { api } from "@/composables/useAPI";
import { handleRegister } from "@/repositories/auth/authRepository";
import { config } from "@/config";

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/config", () => ({
  config: {
    apiUrl: "http://localhost:8000/api",
  },
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("AuthRepository", () => {
  it("register calls API with correct parameters", async () => {
    const userData = {
      first_name: "John",
      last_name: "Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "Password123!",
    };

    vi.mocked(api.post).mockResolvedValue({ data: { ...userData } });

    const result = await handleRegister(userData);

    expect(api.post).toHaveBeenCalledWith(config.apiUrl + "/auth/signup/", userData);
    expect(result).toEqual({ ...userData });
  });
});
