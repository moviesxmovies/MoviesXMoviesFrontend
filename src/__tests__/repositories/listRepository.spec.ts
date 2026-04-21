import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  fetchUserLists,
  fetchMovieListsFromMovie,
  addMovieToList,
  removeMovieFromList,
  createList,
} from "@/repositories/listRepository";

// ── Mocks ────────────────────────────────────────────────────────────────────
const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

vi.mock("@/i18n", () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}));

describe("ListRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── fetchUserLists ────────────────────────────────────────────────────────
  describe("fetchUserLists", () => {
    it("calls API with correct user slug and returns data", async () => {
      const userSlug = "user-123";
      const mockLists = [{ id: 1, name: "Favorites" }];
      mockGet.mockResolvedValueOnce({ data: mockLists });

      const result = await fetchUserLists(userSlug);

      expect(mockGet).toHaveBeenCalledWith(`/movies-lists/${userSlug}/`);
      expect(result).toEqual(mockLists);
    });

    it("throws error when fetchUserLists fails", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValueOnce(networkError);
      await expect(fetchUserLists("slug")).rejects.toThrow("Network error");
    });
  });

  // ── fetchMovieListsFromMovie ──────────────────────────────────────────────
  describe("fetchMovieListsFromMovie", () => {
    it("calls API with correct movie slug", async () => {
      const movieSlug = "inception";
      const mockData = [{ id: 1, name: "Watchlist" }];
      mockGet.mockResolvedValueOnce({ data: mockData });

      const result = await fetchMovieListsFromMovie(movieSlug);

      expect(mockGet).toHaveBeenCalledWith(`/movies/${movieSlug}/movie-lists/`);
      expect(result).toEqual(mockData);
    });

    it("returns empty array if movieSlug is empty", async () => {
      const result = await fetchMovieListsFromMovie("");
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("throws error when fetchMovieListsFromMovie fails", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValueOnce(networkError);
      await expect(fetchMovieListsFromMovie("slug")).rejects.toThrow(
        "Network error",
      );
    });
  });

  // ── addMovieToList ────────────────────────────────────────────────────────
  describe("addMovieToList", () => {
    it("calls POST with constructed path", async () => {
      const user = "diego";
      const list = "action-movies";
      const movie = "die-hard";

      mockPost.mockResolvedValueOnce({ data: {} });

      await addMovieToList(user, list, movie);

      expect(mockPost).toHaveBeenCalledWith(
        `/movies-lists/${user}/${list}/${movie}/`,
      );
    });

    it("throws error when addMovieToList fails", async () => {
      const networkError = new Error("Network error");
      mockPost.mockRejectedValueOnce(networkError);
      await expect(addMovieToList("user", "list", "movie")).rejects.toThrow(
        "Network error",
      );
    });
  });

  // ── removeMovieFromList ───────────────────────────────────────────────────
  describe("removeMovieFromList", () => {
    it("calls DELETE with constructed path", async () => {
      const user = "diego";
      const list = "action-movies";
      const movie = "die-hard";

      mockDelete.mockResolvedValueOnce({ data: {} });

      await removeMovieFromList(user, list, movie);

      expect(mockDelete).toHaveBeenCalledWith(
        `/movies-lists/${user}/${list}/${movie}/`,
      );
    });

    it("throws error when removeMovieFromList fails", async () => {
      const networkError = new Error("Network error");
      mockDelete.mockRejectedValueOnce(networkError);
      await expect(
        removeMovieFromList("user", "list", "movie"),
      ).rejects.toThrow("Network error");
    });
  });

  // ── createList ────────────────────────────────────────────────────────────
  describe("createList", () => {
    it("calls POST with list payload and returns created data", async () => {
      const newList = { name: "New List", privacy: "P" };
      const mockResponse = { data: { id: 99, ...newList } };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await createList(newList as any);

      expect(mockPost).toHaveBeenCalledWith("/movies-lists/", newList);
      expect(result).toEqual(mockResponse);
    });

    it("throws error when createList fails", async () => {
      const networkError = new Error("Network error");
      mockPost.mockRejectedValueOnce(networkError);
      await expect(createList({} as any)).rejects.toThrow("Network error");
    });
  });
});
