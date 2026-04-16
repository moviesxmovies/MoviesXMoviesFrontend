import { api } from "@/composables/useAPI";
import { useAuthStore } from "@/stores/authStore";
import type { MovieList } from "@/types";

const authStore = useAuthStore();

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

export const createList = async (listName: string) => {
  try {
    await api.post("/movies-lists/", {
      name: listName,
    });
  } catch (error: any) {
    throw error;
  }
};
