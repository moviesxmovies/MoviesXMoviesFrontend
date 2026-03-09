import { z } from "zod";

export const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    password: z
      .string()
      .min(10, "At least 10 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/\d/, "Must include a number"),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }

    const pwd = data.password.toLowerCase();
    const checks = [
      { value: data.username, label: "username" },
      { value: data.first_name, label: "first name" },
      { value: data.last_name, label: "last name" },
      { value: data.email, label: "email" },
    ];
    for (const { value, label } of checks) {
      if (value && pwd === value.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password cannot be the same as your ${label}`,
          path: ["password"],
        });
      }
    }
  });
