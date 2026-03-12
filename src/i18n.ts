import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import { DEFAULT_LANGUAGE, getValidLocale } from "./repositories/i18n/i18nRepository";

const i18n = createI18n({
  legacy: false,
  locale: getValidLocale(),
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: { en, es, fr, de },
});

export default i18n;
