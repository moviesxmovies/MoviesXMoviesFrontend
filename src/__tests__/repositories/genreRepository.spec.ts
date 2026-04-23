import { vi, describe, it, expect, beforeEach } from "vitest";
import { fetchGenres } from "@/repositories/genreRepository";

// ── Mocks ────────────────────────────────────────────────────────────────────
const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
  },
}));

const mockGenre = { id: 1, name: "Sci-Fi" };

describe("GenreRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls API with correct endpoint and returns genre data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockGenre });
    const result = await fetchGenres();

    expect(mockGet).toHaveBeenCalledWith("genres");
    expect(result).toEqual(mockGenre);
  });

  it("throws when API fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Not found"));
    await expect(fetchGenres()).rejects.toThrow("Not found");
  });
});
