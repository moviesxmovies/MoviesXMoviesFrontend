import { api } from "@/composables/useAPI";
import TranslatedError from "@/exceptions/TranslatedError";

export const getSelfUserProfile = async () => {
  try {
    const { data } = await api.get(`/users/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const updateSelfUserProfile = async (formData: FormData) => {
  const { data } = await api.put("/users/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const getUserProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/users/${slug}/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getPersonProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/persons/${slug}/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getPersonMovieListsFromMovie = async (slug: string) => {
  try {
    const { data } = await api.get(`/movies/${slug}/movie-lists/`);
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getPersonFilmography = async (
  slug: string,
  type: "acted" | "directed",
  lastId?: number,
) => {
  try {
    const { data } = await api.get(`/persons/${slug}/${type}-movies/`, {
      params: {
        last_id: lastId,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};
export const getUserReviews = async (
  slug: string,
  lastId?: number,
  limit: number = 5,
) => {
  try {
    const { data } = await api.get(`/users/${slug}/reviews/`, {
      params: {
        last_id: lastId,
        limit: limit,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getFriendsRequests = async (
  lastId?: number,
  limit: number = 5,
) => {
  try {
    const { data } = await api.get(`/users/friend-requests/`, {
      params: {
        last_id: lastId,
        limit: limit,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const completeFriendRequest = async (
  fromUsername: string,
  accept: boolean,
) => {
  try {
    if (accept) {
      const { data } = await api.post(
        `/users/${fromUsername}/friend-requests/`,
      );
      return data;
    } else {
      const { data } = await api.delete(
        `/users/${fromUsername}/friend-requests/`,
      );
      return data;
    }
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getUserFriends = async (
  slug: string,
  lastId?: number,
  limit: number = 5,
) => {
  try {
    const { data } = await api.get(`/users/${slug}/friends/`, {
      params: {
        last_id: lastId,
        limit: limit,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};
export const getUserMoviesLists = async (
  slug: string,
  lastId?: number,
  limit: number = 6,
) => {
  try {
    const { data } = await api.get(`/movies-lists/${slug}/`, {
      params: {
        last_id: lastId,
        limit: limit,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export const getSuggestedFriends = async (
  slug: string,
  lastId?: number,
  limit: number = 5,
) => {
  try {
    const { data } = await api.get(`/users/suggested-users/`, {
      params: {
        last_id: lastId,
        recomender_for: slug,
        limit: limit,
      },
    });
    return data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};

export type userSearchingData = {
  name?: string;
  is_friend?: boolean;
  page?: number;
};

export const userSearching = async (
  data: userSearchingData,
  limit?: number,
) => {
  try {
    const response = await api.get(`/users/searching/`, {
      params: {
        ...data,
        limit,
        search_query: data.name || undefined,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new TranslatedError(error, error.response?.data?.status);
  }
};
