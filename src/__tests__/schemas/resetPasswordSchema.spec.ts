import { describe, it, expect } from "vitest";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/resetPasswordSchema";

describe("Forgot password schema", () => {
  const validData = {
    email: "john@example.com",
  };

  it("Should accept valid data", () => {
    expect(forgotPasswordSchema.safeParse(validData).success).toBe(true);
  });
  it("Should fail if email is missing", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Email is required");
  });
  it("Should fail if email is invalid", () => {
    const result = forgotPasswordSchema.safeParse({ email: "notanemail" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Invalid email address");
  });
});

describe("Reset password schema", () => {
  const validData = {
    forgot_password_code: "123456",
    email: "john@example.com",
    password: "Password123",
    confirm_password: "Password123",
  };

  it("Should accept valid data", () => {
    expect(resetPasswordSchema.safeParse(validData).success).toBe(true);
  });

  // Forgot password
  it("Should fail if forgot password code is missing", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      forgot_password_code: "",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.forgot_password_code).toContain(
      "Password reset code is required",
    );
  });
  it("Should fail if forgot password code is not 6 digits long", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      forgot_password_code: "123",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.forgot_password_code).toContain(
      "Password reset code is required",
    );
  });

  // Email
  it("Should fail if email is missing", () => {
    const result = resetPasswordSchema.safeParse({ ...validData, email: "" });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Email is required");
  });
  it("Should fail if email is invalid", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      email: "notanemail",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.email).toContain("Invalid email address");
  });

  // Password
  it("Should fail if password is too short", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: "Short1",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("At least 10 characters");
  });
  it("Should fail if password has no uppercase letter", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: "password123",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain(
      "Password must include an uppercase letter",
    );
  });
  it("Should fail if password has no number", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: "PasswordABC",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.password).toContain("Password must include a number");
  });

  // Confirm password
  it("Should fail if confirm_password is missing", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      confirm_password: "",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirm_password).toContain("Please confirm your password");
  });
  it("Should fail if passwords do not match", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      confirm_password: "WrongPassword123",
    });
    const errors = result.error?.flatten().fieldErrors;
    expect(errors?.confirm_password).toContain("Passwords do not match");
  });
});
