import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const forgotPasswordSchema = z.object({
  email: z.email(t("schema.email.invalid")).min(1, t("schema.email.required")),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, t("schema.password.minLength"))
      .regex(/[A-Z]/, t("schema.password.upperCase"))
      .regex(/\d/, t("schema.password.number")),
    confirm_password: z.string().min(1, t("schema.confirmPassword.required")),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({
        code: "custom",
        message: t("schema.confirmPassword.mismatch"),
        path: ["confirm_password"],
      });
    }
  });
