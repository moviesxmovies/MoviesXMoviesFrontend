import { api } from "@/composables/useAPI";
import type { MoviePagination } from "@/types";

export type searchData = {
  name?: string;
  showUnseen?: boolean;
  showReviewed?: boolean;
  actors?: string[];
  directors?: string[];
  genres?: string[];
  platforms?: string[];
  stars?: number[];
  page?: number;
};

export const movieSearching = async (params: searchData, limit: number = 12) => {
  try {
    const { data }: { data: MoviePagination } = await api.get(
      "movies/searching/",
      {
        params: { ...params, limit },
      },
    );
    return data;
  } catch (error: any) {
    throw error;
  }
};
