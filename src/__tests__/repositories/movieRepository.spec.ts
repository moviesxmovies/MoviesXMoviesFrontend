import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getRecommendedMovies,
  submitRating,
  setAsNotSeen,
  friendsRatings,
  movieSearching,
  type searchData,
} from "@/repositories/movieRepository";
import type { MoviePagination } from "@/types";
import TranslatedError from "@/exceptions/TranslatedError";

// ── Mocks ────────────────────────────────────────────────────────────────────
const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
    post: mockPost,
  },
}));

describe("MovieRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getRecommendedMovies ───────────────────────────────────────────────────
  describe("getRecommendedMovies", () => {
    it("calls API with correct endpoint and returns movie list", async () => {
      const mockMovies = [
        { id: 1, title: "Inception", slug: "inception" },
        { id: 2, title: "Interstellar", slug: "interstellar" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockMovies });

      const result = await getRecommendedMovies();

      expect(mockGet).toHaveBeenCalledWith("/movies/");
      expect(result).toEqual(mockMovies);
    });

    it("throws when getRecommendedMovies API fails", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValueOnce(networkError);

      await expect(getRecommendedMovies()).rejects.toThrow("Network error");
    });
  });

  // ── submitRating ───────────────────────────────────────────────────────────
  describe("submitRating", () => {
    it("calls API with correct endpoint and payload", async () => {
      const movieSlug = "inception";
      const rating = 5;

      mockPost.mockResolvedValueOnce({ data: {} });

      await submitRating(movieSlug, rating);

      expect(mockPost).toHaveBeenCalledWith(`/movies/${movieSlug}/ratings/`, {
        rating,
      });
    });

    it("throws when submitRating API fails", async () => {
      mockPost.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(submitRating("slug", 5)).rejects.toThrow("Unauthorized");
    });
  });

  // ── setAsNotSeen ───────────────────────────────────────────────────────────
  describe("setAsNotSeen", () => {
    it("calls API with correct endpoint", async () => {
      const movieSlug = "inception";

      mockPost.mockResolvedValueOnce({ data: {} });

      await setAsNotSeen(movieSlug);

      expect(mockPost).toHaveBeenCalledWith(`/movies/${movieSlug}/unseen/`);
    });

    it("throws when setAsNotSeen API fails", async () => {
      mockPost.mockRejectedValueOnce(new Error("Server error"));

      await expect(setAsNotSeen("slug")).rejects.toThrow("Server error");
    });
  });

  // ── movieSearching ───────────────────────────────────────────────────────────
  describe("movieSearching", () => {
    const mockPaginationResponse: MoviePagination = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, title: "Inception", slug: "inception" } as any,
        { id: 2, title: "The Dark Knight", slug: "the-dark-knight" } as any,
      ],
    };

    it("Should call API with correct params and default limit", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });
      const params: searchData = { name: "Inception", page: 1 };
      const result = await movieSearching(params);

      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: {
          name: "Inception",
          page: 1,
          limit: 15,
        },
      });
      expect(result).toEqual(mockPaginationResponse);
    });

    it("Should render specific number of movies if given", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });
      const params: searchData = { genres: ["Sci-Fi"] };
      const customLimit = 5;
      await movieSearching(params, customLimit);
      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: {
          genres: ["Sci-Fi"],
          limit: 5,
        },
      });
    });

    it("Manages complex data params", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });
      const params: searchData = {
        name: "Interstellar",
        showUnseen: true,
        actors: ["Matthew McConaughey"],
        stars: 1,
      };
      await movieSearching(params);
      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: {
          ...params,
          limit: 15,
        },
      });
    });

    it("Throws error if petition fails", async () => {
      const apiError = {
        response: {
          data: { message: "Invalid parameters" },
        },
      };
      const translatedApiError = new TranslatedError(apiError, undefined);
      mockGet.mockRejectedValueOnce(apiError);
      const params: searchData = { name: "Error" };
      await expect(movieSearching(params)).rejects.toEqual(translatedApiError);
    });

    it("Throws error if anything goes wrong", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));
      await expect(movieSearching({})).rejects.toThrow("Network Error");
    });
  });
  
  // ── friendsRatings ─────────────────────────────────────────────────────────
  describe("friendsRatings", () => {
    it("calls API with correct endpoint and returns ratings", async () => {
      const movieSlug = "inception";
      const mockRatings = [
        { user: "Alice", rating: 5, movie: "Inception", createdAt: "2024-01-01T00:00:00Z" },
        { user: "Bob", rating: 4, movie: "Inception", createdAt: "2024-01-01T00:00:00Z" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockRatings });

      const result = await friendsRatings(movieSlug, 5, 10);

      expect(mockGet).toHaveBeenCalledWith(`/movies/${movieSlug}/friends-ratings/`, {
        params: { limit: 5, page: 10 },

      });
      expect(result).toEqual(mockRatings);
    });
    it("throws when friendsRatings API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      await expect(friendsRatings("slug", 5, 10)).rejects.toThrow("Not found");
    });
  });
});
