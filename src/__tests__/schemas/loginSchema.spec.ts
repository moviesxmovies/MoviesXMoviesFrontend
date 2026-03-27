import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginSchema } from "@/schemas/loginSchema";

const { mockSetTokens, mockPush, mockToast } = vi.hoisted(() => ({
  mockSetTokens: vi.fn(),
  mockPush: vi.fn(),
  mockToast: { add: vi.fn() },
}));

vi.mock("@/config", () => ({
  config: {
    googleClientId: "test-client-id",
    callbackUri: "http://localhost:5173",
    apiUrl: "http://localhost:8000/api",
  },
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

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: vi.fn(() => ({ query: {} })),
}));

vi.mock("primevue/usetoast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    setTokens: mockSetTokens,
  })),
}));

describe("Login schema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData = {
    username: "johndoe",
    password: "Password123",
  };

  it("Should accept valid data", () => {
    expect(loginSchema.safeParse(validData).success).toBe(true);
  });
  it("Should fail if username is missing", () => {
    const result = loginSchema.safeParse({ ...validData, username: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.username).toContain("Username is required");
  });
  it("Should fail if password is too short", () => {
    const result = loginSchema.safeParse({ ...validData, password: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("Password is required");
  });
});
