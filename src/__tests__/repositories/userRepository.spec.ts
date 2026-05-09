import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getSelfUserProfile,
  getPersonProfile,
  getPersonMovieListsFromMovie,
  getPersonFilmography,
  getUserProfile,
  getFriendsRequests,
  getUserReviews,
  completeFriendRequest,
  getUserFriends,
  getSuggestedFriends,
  getUserMoviesLists,
  userSearching,
  getUserTranslations,
} from "@/repositories/userRepository";

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

describe("UserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getUserProfile ──────────────────────────────────────────────────────────
  describe("getUserProfile", () => {
    it("calls API with correct endpoint and returns user data", async () => {
      const mockProfile = {
        id: "1",
        name: "Christopher Nolan",
        slug: "christopher-nolan",
      };

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
  // // ── updateUserProfile ──────────────────────────────────────────────────────────

  // ── getPersonProfile ──────────────────────────────────────────────────────────
  describe("getPersonProfile", () => {
    it("calls API with correct endpoint and returns profile data", async () => {
      const mockProfile = {
        id: "1",
        name: "Christopher Nolan",
        slug: "christopher-nolan",
      };

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

      await expect(getPersonProfile("unknown-slug")).rejects.toThrow(
        "Not found",
      );
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

      await expect(getPersonMovieListsFromMovie("inception")).rejects.toThrow(
        "Server error",
      );
    });
  });

  // ── getPersonFilmography ──────────────────────────────────────────────────────

  describe("getPersonFilmography", () => {
    it("calls API with correct endpoint for 'acted' type", async () => {
      const mockFilmography = [{ id: "1", title: "Inception" }];

      mockGet.mockResolvedValueOnce({ data: mockFilmography });
      const result = await getPersonFilmography("leonardo-dicaprio", "acted");

      expect(mockGet).toHaveBeenCalledWith(
        "/persons/leonardo-dicaprio/acted-movies/",
        {
          params: { last_id: undefined },
        },
      );
      expect(result).toEqual(mockFilmography);
    });

    it("calls API with correct endpoint for 'directed' type", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonFilmography("christopher-nolan", "directed");

      expect(mockGet).toHaveBeenCalledWith(
        "/persons/christopher-nolan/directed-movies/",
        {
          params: { last_id: undefined },
        },
      );
    });

    it("passes lastId as param when provided", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await getPersonFilmography("christopher-nolan", "directed", 42);

      expect(mockGet).toHaveBeenCalledWith(
        "/persons/christopher-nolan/directed-movies/",
        {
          params: { last_id: 42 },
        },
      );
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

  // ── getUserProfile ──────────────────────────────────────────────────────────
  describe("getUserProfile", () => {
    it("calls API with correct endpoint and returns user profile", async () => {
      const mockProfile = {
        id: "1",
        name: "Christopher Nolan",
        slug: "christopher-nolan",
      };

      mockGet.mockResolvedValueOnce({ data: mockProfile });
      const result = await getUserProfile(mockProfile.slug);

      expect(mockGet).toHaveBeenCalledWith(`/users/${mockProfile.slug}/`);
      expect(result).toEqual(mockProfile);
    });
    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      await expect(getUserProfile()).rejects.toThrow("Not found");
    });
  });

  // ── getFriendsRequests ─────────────────────────────────────────────────────────
  describe("getFriendsRequests", () => {
    it("calls API with correct endpoint and returns friend requests", async () => {
      const mockRequests = [
        { id: 1, from_user: "user1", to_user: "user2", status: "pending" },
        { id: 2, from_user: "user2", to_user: "user3", status: "pending" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockRequests });
      const result = await getFriendsRequests(1, 10);

      expect(mockGet).toHaveBeenCalledWith("/users/friend-requests/", {
        params: { last_id: 1, limit: 10 },
      });
      expect(result).toEqual(mockRequests);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getFriendsRequests(1, 10)).rejects.toThrow("Server error");
    });
  });
  // ── getUserReviews ───────────────────────────────────────────────────────────────
  describe("getUserReviews", () => {
    it("calls API with correct endpoint and returns user reviews", async () => {
      const mockReviews = [
        { id: 1, movie: "Inception", rating: 5, comment: "Great movie!" },
        { id: 2, movie: "Interstellar", rating: 4, comment: "Very good!" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockReviews });
      const result = await getUserReviews("testuser", 1, 10);

      expect(mockGet).toHaveBeenCalledWith("/users/testuser/reviews/", {
        params: { last_id: 1, limit: 10 },
      });
      expect(result).toEqual(mockReviews);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));

      await expect(getUserReviews("testuser", 1, 10)).rejects.toThrow(
        "Network error",
      );
    });
  });
  // ── getFriendsRequests ───────────────────────────────────────────────────────────────
  describe("getFriendsRequests", () => {
    it("calls API with correct endpoint and returns friend requests", async () => {
      const mockRequests = [
        { id: 1, from_user: "user1", to_user: "user2", status: "pending" },
        { id: 2, from_user: "user2", to_user: "user3", status: "pending" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockRequests });
      const result = await getFriendsRequests(1, 10);

      expect(mockGet).toHaveBeenCalledWith("/users/friend-requests/", {
        params: { last_id: 1, limit: 10 },
      });
      expect(result).toEqual(mockRequests);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getFriendsRequests(1, 10)).rejects.toThrow("Server error");
    });
  });
  // ── completeFriendRequest ───────────────────────────────────────────────────────────────
  describe("completeFriendRequest", () => {
    it("calls API with correct endpoint and payload to accept request", async () => {
      const fromUsername = "user1";
      const accept = true;

      mockPost.mockResolvedValueOnce({ data: {} });
      await completeFriendRequest(fromUsername, accept);

      expect(mockPost).toHaveBeenCalledWith(
        `/users/${fromUsername}/friend-requests/`,
      );
    });

    it("calls API with correct endpoint and payload to reject request", async () => {
      const fromUsername = "user1";
      const accept = false;

      mockDelete.mockResolvedValueOnce({ data: {} });
      await completeFriendRequest(fromUsername, accept);

      expect(mockDelete).toHaveBeenCalledWith(
        `/users/${fromUsername}/friend-requests/`,
      );
    });
    it("throws when API fails on accept", async () => {
      const fromUsername = "user1";
      const accept = true;

      mockPost.mockRejectedValueOnce(new Error("Network error"));
      await expect(completeFriendRequest(fromUsername, accept)).rejects.toThrow(
        "Network error",
      );
    });

    it("throws when API fails on reject", async () => {
      const fromUsername = "user1";
      const accept = false;

      mockDelete.mockRejectedValueOnce(new Error("Server error"));
      await expect(completeFriendRequest(fromUsername, accept)).rejects.toThrow(
        "Server error",
      );
    });
  });

  // ── getUserFriends ───────────────────────────────────────────────────────────────
  describe("getUserFriends", () => {
    it("calls API with correct endpoint and returns user friends", async () => {
      const mockFriends = [
        { id: 1, username: "friend1" },
        { id: 2, username: "friend2" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockFriends });
      const result = await getUserFriends("testuser", 1, 10);

      expect(mockGet).toHaveBeenCalledWith("/users/testuser/friends/", {
        params: { last_id: 1, limit: 10 },
      });
      expect(result).toEqual(mockFriends);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));

      await expect(getUserFriends("testuser", 1, 10)).rejects.toThrow(
        "Network error",
      );
    });
  });
  // ── getUserMoviesLists ───────────────────────────────────────────────────────────────
  describe("getUserMoviesLists", () => {
    it("calls API with correct endpoint and returns user movie lists", async () => {
      const mockLists = [
        { id: 1, name: "Favourites" },
        { id: 2, name: "Watch Later" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockLists });
      const result = await getUserMoviesLists("testuser");

      expect(mockGet).toHaveBeenCalledWith("/movies-lists/testuser/", {
        params: { limit: 6, last_id: undefined },
      });
      expect(result).toEqual(mockLists);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getUserMoviesLists("testuser")).rejects.toThrow(
        "Server error",
      );
    });
  });
  // ── getSuggestedFriends ───────────────────────────────────────────────────────────────
  describe("getSuggestedFriends", () => {
    it("calls API with correct endpoint and returns suggested friends", async () => {
      const mockSuggestions = [
        { id: 1, username: "suggestion1" },
        { id: 2, username: "suggestion2" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockSuggestions });
      const result = await getSuggestedFriends("testuser", 1, 10);

      expect(mockGet).toHaveBeenCalledWith("/users/suggested-users/", {
        params: { last_id: 1, limit: 10, recomender_for: "testuser" },
      });
      expect(result).toEqual(mockSuggestions);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getSuggestedFriends("testuser", 1, 10)).rejects.toThrow(
        "Server error",
      );
    });
  });
  // ── getUserSearching ───────────────────────────────────────────────────────────────
  describe("userSearching", () => {
    it("calls API with correct endpoint and returns users", async () => {
      const apiParams = {
        page: 1,
        name: "testUser",
      };
      const mockResults = [
        { id: 1, username: "testUser1" },
        { id: 2, username: "testUser2" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockResults });
      const result = await userSearching(apiParams);

      expect(mockGet).toHaveBeenCalledWith("/users/searching/", {
        params: {
          page: 1,
          search_query: "testUser",
          name: "testUser",
        },
      });
      expect(result).toEqual(mockResults);
    });

    it("throws when API fails", async () => {
      const apiParams = {
        page: 1,
        name: "testUser",
      };
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(userSearching(apiParams)).rejects.toThrow("Server error");
    });
  });
  // ── getUserTranslations ───────────────────────────────────────────────────────────────
  describe("getUserTranslations", () => {
    it("calls API with correct endpoint and returns translations", async () => {
      const mockTranslations = [
        { id: 1, language: "en", content: "Hello" },
        { id: 2, language: "es", content: "Hola" },
      ];

      mockGet.mockResolvedValueOnce({ data: mockTranslations });
      const result = await getUserTranslations("testuser");

      expect(mockGet).toHaveBeenCalledWith("/users/testuser/translations/");
      expect(result).toEqual(mockTranslations);
    });

    it("throws when API fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("Server error"));

      await expect(getUserTranslations("testuser")).rejects.toThrow(
        "Server error",
      );
    });
  });
});
