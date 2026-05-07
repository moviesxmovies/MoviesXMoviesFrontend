import { vi, describe, it, expect, beforeEach } from "vitest";
import { fetchPersons,celebritySearching } from "@/repositories/personRepository";

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

  it("should search for celebrities with given query and pagination", async () => {
    const search_query = "john";
    const page = 2;
    const limit = 10;
    const mockResponse = { results: [{ id: 1, name: "John Doe" }] };
    mockGet.mockResolvedValue({ data: mockResponse });

    const result = await celebritySearching(search_query, page, limit);

    expect(mockGet).toHaveBeenCalledWith("/persons/searching/", {
      params: { search_query, page, limit },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should throw a TranslatedError if API call fails during celebrity search", async () => {
    const search_query = "john";
    const error = new Error("API error");
    error.response = { data: { status: "error" } };
    mockGet.mockRejectedValueOnce(error);

    await expect(celebritySearching(search_query)).rejects.toThrow("API error");
  });
});
