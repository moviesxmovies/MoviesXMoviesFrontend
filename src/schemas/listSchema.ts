import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const defaultListSchema = z.object({
  listName: z.string().min(1, t("schema.listName.min")),
  privacity: z.enum(["public", "private", "friends"], {
    required_error: t("schema.privacity.required"),
  }),
});
