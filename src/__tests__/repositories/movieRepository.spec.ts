import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getRecommendedMovies,
  submitRating,
  setAsNotSeen,
  friendsRatings
} from "@/repositories/movieRepository";

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