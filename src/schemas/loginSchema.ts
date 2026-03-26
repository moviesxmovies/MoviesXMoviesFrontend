import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const loginSchema = z
  .object({
    username: z.string().min(1, t("components.form.requiredUsername")),
    password: z
      .string()
      .min(10, t("schema.password.minLength"))
      .regex(/[A-Z]/, t("schema.password.upperCase"))
      .regex(/\d/, t("schema.password.number")),
  })
  .superRefine((data, ctx) => {
    if (data.username.toLowerCase() === data.password.toLowerCase()) {
      ctx.addIssue({
        code: "custom",
        message: t("schema.checks.samePasswordAs", [
          t("schema.checks.username"),
        ]),
        path: ["password"],
      });
    }
  });
