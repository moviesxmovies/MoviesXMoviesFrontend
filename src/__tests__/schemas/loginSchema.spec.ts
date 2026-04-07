import { describe, it, expect } from "vitest";
import { loginSchema } from "@/schemas/loginSchema";

describe("Login schema", () => {
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
