import { availableCountries } from "@/types";

export const DEFAULT_LANGUAGE = "en";

export const getValidLocale = () => {
  const languageObtained =
    localStorage.getItem("locale") || navigator.language?.split("-")[0];
  const exists = availableCountries.some(
    ({ value }) => value === languageObtained,
  );
  return exists ? languageObtained : DEFAULT_LANGUAGE;
};
