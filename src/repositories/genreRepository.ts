import { api } from "@/composables/useAPI";
import type { Genre } from "@/types";

export const fetchGenres = async () => {
  try {
    const { data }: { data: Genre[] } = await api.get("genres");
    return data;
  } catch (error: any) {
    throw error;
  }
};
