import { api } from "@/composables/useAPI";
import TranslatedError from "@/exceptions/TranslatedError";

export const fetchPersons = async (type: "actors" | "directors") => {
  try {
    const { data } = await api.get(type);
    return data;
  } catch (error: any) {
    throw error;
  }
};


export const celebritySearching = async (
  search_query: string,
  page?: number,
  limit=15,
) => {
  try {
    const response = await api.get(`/persons/searching/`, {
      params: {
        search_query,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};