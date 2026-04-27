import { api } from "@/composables/useAPI";

export const fetchPersons = async (type: "actors" | "directors") => {
  try {
    const { data } = await api.get(type);
    return data;
  } catch (error: any) {
    throw error;
  }
};
