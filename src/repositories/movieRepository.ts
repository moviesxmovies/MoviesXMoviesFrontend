import { api } from "@/composables/useAPI";
import type { Movie } from "@/types";

export const getRecommendedMovies = async () => {
  try {
    const { data }: { data: Movie[] } = await api.get("/movies/");
    return data;
  } catch (error: any) {
    throw error;
  }
};
