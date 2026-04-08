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

export const submitRating = async (movieSlug: string, rating: number) => {
  try {
    await api.post(`/movies/${movieSlug}/ratings/`, { rating });
  } catch (error: any) {
    throw error;
  }
};
