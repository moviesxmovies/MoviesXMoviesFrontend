import { api } from "@/composables/useAPI";
import TranslatedError from "@/exceptions/TranslatedError";
import type { Movie, MoviePagination } from "@/types";

export type searchData = {
  name?: string;
  marked_unseen?: string;
  reviewed?: string;
  actors?: string[];
  directors?: string[];
  genres?: string[];
  platforms?: string[];
  stars?: number[];
  page?: number;
};

export const getRecommendedMovies = async () => {
  try {
    const { data }: { data: Movie[] } = await api.get("/movies/");
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const submitRating = async (movieSlug: string, rating: number) => {
  try {
    await api.post(`/movies/${movieSlug}/ratings/`, { rating });
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const setAsNotSeen = async (movieSlug: string) => {
  try {
    await api.post(`/movies/${movieSlug}/unseen/`);
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const movieSearching = async (
  params: searchData,
  limit: number = 15,
) => {
  try {
    const { data }: { data: MoviePagination } = await api.get(
      "movies/searching/",
      {
        params: { ...params, limit },
      },
    );
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const friendsRatings = async (
  movieSlug: string,
  limit: number,
  page: number,
) => {
  try {
    const { data }: { data: any } = await api.get(
      `/movies/${movieSlug}/friends-ratings/`,
      {
        params: { limit, page },
      },
    );
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getMovie = async (movieSlug: string) => {
  try {
    const { data }: { data: Movie } = await api.get(`/movies/${movieSlug}/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getMovieReviews = async (movieSlug: string, lastId?: number, limit: number = 10) => {
  try {    const { data }: { data: any } = await api.get(`/movies/${movieSlug}/reviews/`, {
      params: { last_id: lastId, limit },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
}