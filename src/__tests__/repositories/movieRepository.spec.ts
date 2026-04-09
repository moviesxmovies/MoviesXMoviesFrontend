import { vi, describe, it, expect, beforeEach } from "vitest";
import { 
  getRecommendedMovies, 
  submitRating, 
  setAsNotSeen 
} from "@/repositories/movieRepository";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Usamos vi.hoisted para asegurar que los mocks estén disponibles antes de las importaciones
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
});