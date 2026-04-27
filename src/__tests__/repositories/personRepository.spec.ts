import { vi, describe, it, expect, beforeEach } from "vitest";
import { fetchPersons } from "@/repositories/personRepository";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
  api: {
    get: mockGet,
  },
}));

describe("PersonRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch persons of a given type", async () => {
    const type = "actors";
    const mockData = [{ id: 1, name: "John Doe" }];
    mockGet.mockResolvedValue({ data: mockData });

    const result = await fetchPersons(type);

    expect(mockGet).toHaveBeenCalledWith(type);
    expect(result).toEqual(mockData);
  });
 
  it("should throw an error if API call fails", async () => {
    const type = "actors";
    const error = new Error("API error");
    mockGet.mockRejectedValueOnce(error);

    await expect(fetchPersons(type)).rejects.toThrow("API error");
  });
});
