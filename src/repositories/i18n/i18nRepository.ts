import { availableCountries } from "@/types";

export const DEFAULT_LANGUAGE = "en";

export const getValidLocale = () => {
  let savedLanguage: string | null = null;
  try {
    savedLanguage = localStorage.getItem("language");
  } catch {
    // Testing environment without localStorage, or SSR. Tokens will be null, which is fine.
  }

  const languageObtained =
    savedLanguage || navigator.language?.split("-")[0];

  const exists = availableCountries.some(
    ({ value }) => value === languageObtained,
  );
  return exists ? languageObtained : DEFAULT_LANGUAGE;
};