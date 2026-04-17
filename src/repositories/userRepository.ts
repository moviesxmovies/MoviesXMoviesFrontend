import { api } from "@/composables/useAPI";

export const getUserProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/persons/${slug}/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getUserMovieListsFromMovie = async (slug: string) => {
  try {
    const { data } = await api.get(`/movies/${slug}/movie-lists/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getUserFilmography = async (slug: string, type: 'acted' | 'directed', lastId?: number) => {
  try {
    const { data } = await api.get(`/persons/${slug}/${type}-movies/`, {
      params: {
        last_id: lastId,
      },
    });
    return data;
  } catch (error: any) {
    throw error;
  }
};
