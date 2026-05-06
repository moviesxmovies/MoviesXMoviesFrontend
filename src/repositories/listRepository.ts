import { api } from "@/composables/useAPI";
import TranslatedError from "@/exceptions/TranslatedError";
import i18n from "@/i18n";
import type {
  CreateList,
  DynamicPagination,
  MovieList,
  Pagination,
} from "@/types";

const { t } = i18n.global;

export const privacityConfig: Record<
  string,
  { text: string; icon: string; class: string; value: string }
> = {
  P: {
    text: t("components.lists.public"),
    icon: "pi pi-globe",
    class: "badge-public",
    value: "P",
  },
  R: {
    text: t("components.lists.private"),
    icon: "pi pi-lock",
    class: "badge-private",
    value: "R",
  },
  F: {
    text: t("components.lists.friends"),
    icon: "pi pi-users",
    class: "badge-friends",
    value: "F",
  },
};

export const fetchUserLists = async (
  userSlug: string,
  lastId?: number,
  limit: number = 6,
) => {
  try {
    const { data }: { data: DynamicPagination<MovieList> } = await api.get(
      `/movies-lists/${userSlug}/`,
      {
        params: {
          last_id: lastId,
          limit,
        },
      },
    );
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const fetchMovieListsFromMovie = async (movieSlug: string) => {
  if (!movieSlug) return [];
  try {
    const { data } = await api.get(`/movies/${movieSlug}/movie-lists/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const addMovieToList = async (
  userSlug: string,
  movieListSlug: string,
  movieSlug: string,
) => {
  try {
    await api.post(`/movies-lists/${userSlug}/${movieListSlug}/${movieSlug}/`);
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const removeMovieFromList = async (
  userSlug: string,
  movieListSlug: string,
  movieSlug: string,
) => {
  try {
    await api.delete(
      `/movies-lists/${userSlug}/${movieListSlug}/${movieSlug}/`,
    );
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const createList = async (list: CreateList) => {
  try {
    const data = await api.post("/movies-lists/", list);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getMovieList = async (user: string, slug: string) => {
  try {
    const { data }: { data: MovieList } = await api.get(`/movies-lists/${user}/${slug}/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const listSearching = async (
  query: string,
  page?: number,
  limit?: number,
) => {
  try {
    const { data }: { data: Pagination<MovieList> } = await api.get(
      "/movies-lists/searching/",
      {
        params: {
          query,
          page,
          limit,
        },
      },
    );
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};