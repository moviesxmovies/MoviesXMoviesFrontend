import { vi, describe, it, expect, beforeEach } from "vitest";
import { fetchPlatforms } from "@/repositories/platformRepository";

// ── Mocks ────────────────────────────────────────────────────────────────────
const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
  },
}));

const mockPlatform = {
  id: "1",
  name: "Netflix",
  image: "https://example.com/netflix.png",
};

describe("PlatformRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls API with correct endpoint and returns platform data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockPlatform });
    const result = await fetchPlatforms();

    expect(mockGet).toHaveBeenCalledWith("platforms");
    expect(result).toEqual(mockPlatform);
  });

  it("throws when API fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Not found"));
    await expect(fetchPlatforms()).rejects.toThrow("Not found");
  });
});
