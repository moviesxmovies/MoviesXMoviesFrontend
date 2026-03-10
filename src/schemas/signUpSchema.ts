import { useI18n } from "vue-i18n";
import { z } from "zod";

const { t } = useI18n();

export const schema = z
  .object({
    first_name: z.string().min(1, t("schema.firstName.required")),
    last_name: z.string().min(1, t("schema.lastName.required")),
    username: z.string().min(1, t("schema.username.required")),
    email: z
      .email(t("schema.email.invalid"))
      .min(1, t("schema.email.required")),
    confirm_password: z.string().min(1, t("schema.confirmPassword.required")),
    password: z
      .string()
      .min(10, t("schema.password.minLength"))
      .regex(/[A-Z]/, t("schema.password.upperCase"))
      .regex(/\d/, t("schema.password.number")),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({
        code: "custom",
        message: t("schema.confirmPassword.mismatch"),
        path: ["confirm_password"],
      });
    }

    const pwd = data.password.toLowerCase();
    const checks = [
      { value: data.username, label: t("schema.checks.username") },
      { value: data.first_name, label: t("schema.checks.first_name") },
      { value: data.last_name, label: t("schema.checks.last_name") },
      { value: data.email, label: t("schema.checks.email") },
    ];

    for (const { value, label } of checks) {
      if (value?.toLowerCase() === pwd) {
        ctx.addIssue({
          code: "custom",
          message: t("schema.checks.samePasswordAs", { field: label }),
          path: ["password"],
        });
      }
    }
  });
