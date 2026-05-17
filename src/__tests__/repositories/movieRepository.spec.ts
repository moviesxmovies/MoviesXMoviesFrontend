import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getRecommendedMovies,
  submitRating,
  setAsNotSeen,
  friendsRatings,
  movieSearching,
  getMovie,
  getMovieReviews,
  submitReview,
  updateReview,
  deleteReview,
  getReview,
  updateRating,
  getRating,
  type searchData,
} from "@/repositories/movieRepository";
import type { Movie, Pagination } from "@/types";
import TranslatedError from "@/exceptions/TranslatedError";

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeApiError = (message = "API error") => ({
  response: { data: { message, status: "ERROR" } },
});

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

    it("throws TranslatedError when API fails", async () => {
      const apiError = makeApiError("Network error");
      mockGet.mockRejectedValueOnce(apiError);

      await expect(getRecommendedMovies()).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── submitRating ───────────────────────────────────────────────────────────

  describe("submitRating", () => {
    it("calls API with correct endpoint and payload", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await submitRating("inception", 5);

      expect(mockPost).toHaveBeenCalledWith("/movies/inception/ratings/", { rating: 5 });
    });

    it("throws TranslatedError when API fails", async () => {
      mockPost.mockRejectedValue(makeApiError("Unauthorized"));

      await expect(submitRating("inception", 5)).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── setAsNotSeen ───────────────────────────────────────────────────────────

  describe("setAsNotSeen", () => {
    it("calls API with correct endpoint", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await setAsNotSeen("inception");

      expect(mockPost).toHaveBeenCalledWith("/movies/inception/unseen/");
    });

    it("throws TranslatedError when API fails", async () => {
      mockPost.mockRejectedValue(makeApiError("Server error"));

      await expect(setAsNotSeen("inception")).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── movieSearching ─────────────────────────────────────────────────────────

  describe("movieSearching", () => {
    const mockPaginationResponse: Pagination<Movie> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, title: "Inception", slug: "inception" } as any,
        { id: 2, title: "The Dark Knight", slug: "the-dark-knight" } as any,
      ],
    };

    it("calls API with correct params and default limit", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });
      const params: searchData = { name: "Inception", page: 1 };

      const result = await movieSearching(params);

      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: { name: "Inception", page: 1, limit: 15 },
      });
      expect(result).toEqual(mockPaginationResponse);
    });

    it("uses custom limit when provided", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });

      await movieSearching({ genres: ["Sci-Fi"] }, 5);

      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: { genres: ["Sci-Fi"], limit: 5 },
      });
    });

    it("handles complex search params", async () => {
      mockGet.mockResolvedValueOnce({ data: mockPaginationResponse });
      const params: searchData = {
        name: "Interstellar",
        stars: [1],
        celebrities: ["Matthew McConaughey"],
      };

      await movieSearching(params);

      expect(mockGet).toHaveBeenCalledWith("movies/searching/", {
        params: { ...params, limit: 15 },
      });
    });

    it("throws TranslatedError when API fails with response", async () => {
      const apiError = makeApiError("Invalid parameters");
      mockGet.mockRejectedValueOnce(apiError);

      await expect(movieSearching({ name: "Error" })).rejects.toBeInstanceOf(TranslatedError);
    });

    it("throws TranslatedError when API fails without response", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(movieSearching({})).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── friendsRatings ─────────────────────────────────────────────────────────

  describe("friendsRatings", () => {
    it("calls API with correct endpoint and params", async () => {
      const mockRatings = [
        { user: "Alice", rating: 5, movie: "Inception", createdAt: "2024-01-01T00:00:00Z" },
        { user: "Bob", rating: 4, movie: "Inception", createdAt: "2024-01-01T00:00:00Z" },
      ];
      mockGet.mockResolvedValueOnce({ data: mockRatings });

      const result = await friendsRatings("inception", 5, 10);

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/friends-ratings/", {
        params: { limit: 5, page: 10 },
      });
      expect(result).toEqual(mockRatings);
    });

    it("throws TranslatedError when API fails", async () => {
      mockGet.mockRejectedValueOnce(makeApiError("Not found"));

      await expect(friendsRatings("inception", 5, 10)).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── getMovie ───────────────────────────────────────────────────────────────

  describe("getMovie", () => {
    it("calls API with correct endpoint and returns movie", async () => {
      const mockMovie = { id: 1, title: "Inception", slug: "inception" };
      mockGet.mockResolvedValueOnce({ data: mockMovie });

      const result = await getMovie("inception");

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/");
      expect(result).toEqual(mockMovie);
    });

    it("throws TranslatedError when API fails", async () => {
      mockGet.mockRejectedValueOnce(makeApiError("Not found"));

      await expect(getMovie("inception")).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── getMovieReviews ────────────────────────────────────────────────────────

  describe("getMovieReviews", () => {
    const mockReviews = [
      { id: 1, content: "Great movie!", title: "Amazing", isPositive: true },
      { id: 2, content: "Not bad", title: "Fine", isPositive: true },
    ];

    it("calls API with correct endpoint and default limit", async () => {
      mockGet.mockResolvedValueOnce({ data: mockReviews });

      const result = await getMovieReviews("inception");

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/reviews/", {
        params: { last_id: undefined, limit: 10 },
      });
      expect(result).toEqual(mockReviews);
    });

    it("calls API with lastId and custom limit when provided", async () => {
      mockGet.mockResolvedValueOnce({ data: mockReviews });

      await getMovieReviews("inception", 42, 5);

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/reviews/", {
        params: { last_id: 42, limit: 5 },
      });
    });

    it("throws TranslatedError when API fails", async () => {
      mockGet.mockRejectedValueOnce(makeApiError("Server error"));

      await expect(getMovieReviews("inception")).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── submitReview ───────────────────────────────────────────────────────────

  describe("submitReview", () => {
    const reviewBody = { content: "Great film", title: "Amazing", isPositive: true };

    it("calls API with correct endpoint and mapped payload", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await submitReview("inception", reviewBody);

      expect(mockPost).toHaveBeenCalledWith("/movies/inception/reviews/", {
        content: "Great film",
        title: "Amazing",
        is_positive: true,
      });
    });

    it("throws the original error (not TranslatedError) when API fails", async () => {
      const rawError = new Error("Validation failed");
      mockPost.mockRejectedValue(rawError);

      await expect(submitReview("inception", reviewBody)).rejects.toThrow("Validation failed");
      await expect(submitReview("inception", reviewBody)).rejects.not.toBeInstanceOf(TranslatedError);
    });
  });

  // ── updateReview ───────────────────────────────────────────────────────────

  describe("updateReview", () => {
    const reviewBody = { content: "Updated content", title: "Updated title", isPositive: false };

    it("calls API with correct endpoint and mapped payload", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });

      await updateReview(1, reviewBody);

      expect(mockPut).toHaveBeenCalledWith("/reviews/1/", {
        content: "Updated content",
        title: "Updated title",
        is_positive: false,
      });
    });

    it("throws the original error (not TranslatedError) when API fails", async () => {
      const rawError = new Error("Forbidden");
      mockPut.mockRejectedValue(rawError);

      await expect(updateReview(1, reviewBody)).rejects.toThrow("Forbidden");
      await expect(updateReview(1, reviewBody)).rejects.not.toBeInstanceOf(TranslatedError);
    });
  });

  // ── deleteReview ───────────────────────────────────────────────────────────

  describe("deleteReview", () => {
    it("calls API with correct endpoint", async () => {
      mockDelete.mockResolvedValueOnce({});

      await deleteReview(1);

      expect(mockDelete).toHaveBeenCalledWith("/reviews/1/");
    });

    it("throws TranslatedError when API fails", async () => {
      mockDelete.mockRejectedValueOnce(makeApiError("Not found"));

      await expect(deleteReview(1)).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  // ── getReview ──────────────────────────────────────────────────────────────

  describe("getReview", () => {
    it("calls API with correct endpoint and returns review", async () => {
      const mockReview = { id: 1, content: "Great film", title: "Amazing", isPositive: true };
      mockGet.mockResolvedValueOnce({ data: mockReview });

      const result = await getReview(1);

      expect(mockGet).toHaveBeenCalledWith("/reviews/1/");
      expect(result).toEqual(mockReview);
    });

    it("throws TranslatedError when API fails", async () => {
      mockGet.mockRejectedValueOnce(makeApiError("Not found"));

      await expect(getReview(1)).rejects.toBeInstanceOf(TranslatedError);
    });
  });

  //  ── updateRating ──────────────────────────────────────────────────────────────
  describe("updateRating", () => {
    it("calls API with correct endpoint and payload", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });

      await updateRating("inception", 4);

      expect(mockPut).toHaveBeenCalledWith("/movies/inception/ratings/", { rating: 4 });
    });

  });
  //  ── getRating ──────────────────────────────────────────────────────────────
  describe("getRating", () => {
    it("calls API with correct endpoint and returns rating", async () => {
      const mockRating = { rating: 5 };
      mockGet.mockResolvedValueOnce({ data: mockRating });

      const result = await getRating("inception");

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/ratings/");
      expect(result).toEqual(mockRating);
    });
  });
});