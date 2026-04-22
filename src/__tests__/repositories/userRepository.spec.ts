import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getSelfUserProfile,
  getPersonProfile,
  getPersonMovieListsFromMovie,
  getPersonFilmography,
} from "@/repositories/userRepository";

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
  },
}));

describe("UserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getUserProfile ──────────────────────────────────────────────────────────
  describe("getUserProfile", () => {
    it("calls API with correct endpoint and returns user data", async () => {
      const mockProfile = { id: "1", name: "Christopher Nolan", slug: "christopher-nolan" };

      mockGet.mockResolvedValueOnce({ data: mockProfile });
      const result = await getSelfUserProfile();

      expect(mockGet).toHaveBeenCalledWith("/users/");
      expect(result).toEqual(mockProfile);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      await expect(getSelfUserProfile()).rejects.toThrow("Not found");
    });
  });

  // ── getPersonProfile ──────────────────────────────────────────────────────────
  describe("getPersonProfile", () => {
    it("calls API with correct endpoint and returns profile data", async () => {
      const mockProfile = { id: "1", name: "Christopher Nolan", slug: "christopher-nolan" };

      mockGet.mockResolvedValueOnce({ data: mockProfile });
      const result = await getPersonProfile("christopher-nolan");

      expect(mockGet).toHaveBeenCalledWith("/persons/christopher-nolan/");
      expect(result).toEqual(mockProfile);
    });

    it("calls API with the slug provided", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await getPersonProfile("quentin-tarantino");

      expect(mockGet).toHaveBeenCalledWith("/persons/quentin-tarantino/");
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      await expect(getPersonProfile("unknown-slug")).rejects.toThrow("Not found");
    });
  });

  // ── getPersonMovieListsFromMovie ───────────────────────────────────────────────

  describe("getPersonMovieListsFromMovie", () => {
    it("calls API with correct endpoint and returns movie lists", async () => {
      const mockLists = [
        { id: "1", name: "Favourites" },
        { id: "2", name: "Pending" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockLists });
      const result = await getPersonMovieListsFromMovie("inception");

      expect(mockGet).toHaveBeenCalledWith("/movies/inception/movie-lists/");
      expect(result).toEqual(mockLists);
    });

    it("calls API with the slug provided", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonMovieListsFromMovie("interstellar");

      expect(mockGet).toHaveBeenCalledWith("/movies/interstellar/movie-lists/");
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getPersonMovieListsFromMovie("inception")).rejects.toThrow("Server error");
    });
  });

  // ── getPersonFilmography ──────────────────────────────────────────────────────

  describe("getPersonFilmography", () => {
    it("calls API with correct endpoint for 'acted' type", async () => {
      const mockFilmography = [{ id: "1", title: "Inception" }];

      mockGet.mockResolvedValueOnce({ data: mockFilmography });
      const result = await getPersonFilmography("leonardo-dicaprio", "acted");

      expect(mockGet).toHaveBeenCalledWith("/persons/leonardo-dicaprio/acted-movies/", {
        params: { last_id: undefined },
      });
      expect(result).toEqual(mockFilmography);
    });

    it("calls API with correct endpoint for 'directed' type", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonFilmography("christopher-nolan", "directed");

      expect(mockGet).toHaveBeenCalledWith("/persons/christopher-nolan/directed-movies/", {
        params: { last_id: undefined },
      });
    });

    it("passes lastId as param when provided", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonFilmography("christopher-nolan", "directed", 42);

      expect(mockGet).toHaveBeenCalledWith("/persons/christopher-nolan/directed-movies/", {
        params: { last_id: 42 },
      });
    });

    it("does not pass lastId when undefined", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonFilmography("christopher-nolan", "acted");

      expect(mockGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { last_id: undefined } }),
      );
    });

    it("throws when API fails on 'acted' type", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        getPersonFilmography("leonardo-dicaprio", "acted"),
      ).rejects.toThrow("Network error");
    });

    it("throws when API fails on 'directed' type", async () => {
      mockGet.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(
        getPersonFilmography("christopher-nolan", "directed", 10),
      ).rejects.toThrow("Unauthorized");
    });
  });
});