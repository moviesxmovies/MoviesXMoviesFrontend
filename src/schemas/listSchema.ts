import i18n from "@/i18n";
import z from "zod";

const t = i18n.global.t;

export const defaultListSchema = z.object({
  name: z.string().min(1, t("schema.listName.min")),
  description: z.string().optional(),
  privacity: z.enum(["P", "R", "F"], {
    error: t("schema.privacity.required"),
  }),
});
