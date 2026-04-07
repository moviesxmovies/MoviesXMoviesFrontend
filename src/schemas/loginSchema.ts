import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const loginSchema = z.object({
  username: z.string().min(1, t("components.form.requiredUsername")),
  password: z.string().min(1, t("schema.password.required")),
});
