import { api } from "@/composables/useAPI";
import i18n from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import type { MovieList } from "@/types";

const authStore = useAuthStore();
const { t } = i18n.global;

export const privacityConfig: Record<
  string,
  { text: string; icon: string; class: string, value: string }
> = {
  P: {
    text: t("components.lists.public"),
    icon: "pi pi-globe",
    class: "badge-public",
    value: "P"
  },
  R: {
    text: t("components.lists.private"),
    icon: "pi pi-lock",
    class: "badge-private",
    value: "R"
  },
  F: {
    text: t("components.lists.friends"),
    icon: "pi pi-users",
    class: "badge-friends",
    value: "F"
  },
};

export const fetchUserLists = async (
  userSlug: string = authStore.user?.username || "",
) => {
  try {
    const { data }: { data: MovieList[] } = await api.get(
      `/movies-lists/${userSlug}/`,
    );
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const fetchMovieListsFromMovie = async (movieSlug: string) => {
  if (!movieSlug) return [];
  try {
    const { data } = await api.get(`/movies/${movieSlug}/movie-lists/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const addMovieToList = async (
  movieListSlug: string,
  movieSlug: string,
) => {
  try {
    await api.post(
      `/movies-lists/${authStore.user?.username || ""}/${movieListSlug}/${movieSlug}/`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const removeMovieFromList = async (
  movieListSlug: string,
  movieSlug: string,
) => {
  try {
    await api.delete(
      `/movies-lists/${authStore.user?.username || ""}/${movieListSlug}/${movieSlug}/`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const createList = async (listName: string) => {
  try {
    await api.post("/movies-lists/", {
      name: listName,
    });
  } catch (error: any) {
    throw error;
  }
};
