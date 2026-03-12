import { availableCountries } from "@/types";

export const defaultLanguage = "en";

export const getValidLocale = () => {
  const languageObtained =
    localStorage.getItem("locale") || navigator.language?.split("-")[0];
  const exists = availableCountries.some(
    ({ value }) => value === languageObtained,
  );
  console.log(exists, languageObtained);
  return exists ? languageObtained : defaultLanguage;
};
