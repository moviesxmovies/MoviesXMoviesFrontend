import { describe, it, expect, vi, beforeEach } from "vitest";
import { schema, step1Schema, step2Schema } from "@/schemas/signUpSchema";

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

describe("Signup schema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData = {
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "Password123",
    confirm_password: "Password123",
  };

  it("Should accept valid data", () => {
    expect(schema.safeParse(validData).success).toBe(true);
  });
  it("Should fail if passwords do not match", () => {
    const result = step1Schema.safeParse({
      ...validData,
      confirm_password: "WrongPassword123",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirm_password).toContain("Passwords do not match");
  });

  it("Should fail if password is equal to username", () => {
    const result = step1Schema.safeParse({
      ...validData,
      password: validData.username,
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toBeDefined();
  });
  it("Should fail if password is equal to first_name", () => {
    const result = schema.safeParse({
      ...validData,
      password: validData.first_name,
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toBeDefined();
  });
  it("Should fail if password is equal to last_name", () => {
    const result = schema.safeParse({
      ...validData,
      password: validData.last_name,
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toBeDefined();
  });
  it("Should fail if password is equal to email", () => {
    const result = schema.safeParse({
      ...validData,
      password: validData.email,
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toBeDefined();
  });
  it("Should fail if password is equal to email in step 1", () => {
    const result = step1Schema.safeParse({
      ...validData,
      password: validData.email,
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toBeDefined();
  });
  it("Should fail if first_name is missing", () => {
    const result = step2Schema.safeParse({ ...validData, first_name: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.first_name).toContain("First name is required");
  });

  it("Should fail if last_name is missing", () => {
    const result = step2Schema.safeParse({ ...validData, last_name: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.last_name).toContain("Last name is required");
  });

  it("Should fail if username is missing", () => {
    const result = step1Schema.safeParse({ ...validData, username: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.username).toContain("Username is required");
  });

  it("Should fail if email is missing", () => {
    const result = step1Schema.safeParse({ ...validData, email: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Email is required");
  });

  it("Should fail if email is invalid", () => {
    const result = step1Schema.safeParse({ ...validData, email: "notanemail" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Invalid email address");
  });

  it("Should fail if confirm_password is missing", () => {
    const result = step1Schema.safeParse({ ...validData, confirm_password: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirm_password).toContain("Please confirm your password");
  });

  it("Should fail if password is too short", () => {
    const result = step1Schema.safeParse({ ...validData, password: "Short1" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("At least 10 characters");
  });

  it("Should fail if password has no uppercase letter", () => {
    const result = step1Schema.safeParse({ ...validData, password: "password123" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("Password must include an uppercase letter");
  });

  it("Should fail if password has no number", () => {
    const result = step1Schema.safeParse({ ...validData, password: "PasswordABC" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("Password must include a number");
  });
});
