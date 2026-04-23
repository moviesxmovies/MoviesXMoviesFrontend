import { api } from "@/composables/useAPI";

export const getSelfUserProfile = async () => {
  try {
    const { data } = await api.get(`/users/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getUserProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/users/${slug}/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};



export const getPersonProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/persons/${slug}/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getPersonMovieListsFromMovie = async (slug: string) => {
  try {
    const { data } = await api.get(`/movies/${slug}/movie-lists/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getPersonFilmography = async (slug: string, type: 'acted' | 'directed', lastId?: number) => {
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
export const getUserReviews = async (slug: string, lastId?: number) => {
  try {
    const { data } = await api.get(`/users/${slug}/reviews/`, {
      params: {
        last_id: lastId,
      },
    });
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const getFriendsRequests = async (lastId?: number) => {
  try {
    const { data } = await api.get(`/users/friend-requests/`, {
      params: {
        last_id: lastId,
      },
    });
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const completeFriendRequest = async (fromUsername: string, accept: boolean) => {
  try {
    if (accept) {
      const { data } = await api.post(`/users/${fromUsername}/friend-requests/`);
      return data;
    } else {
      const { data } = await api.delete(`/users/${fromUsername}/friend-requests/`);
      return data;
    }
  } catch (error: any) {
    throw error;
  }
};