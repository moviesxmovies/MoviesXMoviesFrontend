import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const editProfileSchema = z.object({
  username: z.string().min(1, t("schema.username.required")).or(z.literal("")),
  email: z.email(t("schema.email.invalid")).or(z.literal("")),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bio: z.string().optional(),
  password: z.union([
    z.literal(""),
    z.string()
      .min(10, t("schema.password.minLength"))
      .regex(/[A-Z]/, t("schema.password.upperCase"))
      .regex(/\d/, t("schema.password.number")),
  ]),
  confirm_password: z.string().optional().or(z.literal("")),
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: t("schema.confirmPassword.mismatch"),
    path: ["confirm_password"],
  }
);
export type EditProfileForm = z.infer<typeof editProfileSchema>;