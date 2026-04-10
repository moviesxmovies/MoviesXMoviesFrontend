import { vi, describe, it, expect, beforeEach } from "vitest";
import { completeBoarding } from "@/repositories/boardingRepository";

const { mockPost, mockSetTokens, mockLogout } = vi.hoisted(() => ({
    mockPost: vi.fn(),
    mockSetTokens: vi.fn(),
    mockLogout: vi.fn(),
    mockRefreshToken: vi.fn(),
}));
const mockStoreState = {
    refreshToken: "",
};

vi.mock("@/composables/useAPI", () => ({
    api: {
        post: mockPost,
    },
}));

vi.mock("@/stores/authStore", () => ({
    useAuthStore: vi.fn(() => ({
        setTokens: mockSetTokens,
        logout: mockLogout,
        get refreshToken() { return mockStoreState.refreshToken },
        set refreshToken(val) { mockStoreState.refreshToken = val }
    })),
}));
describe("BoardingRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // completeBoarding
    it("completeBoarding calls API and refreshes token", async () => {
        const mockBoardingData = { success: true };
        const mockRefreshData = { access: "new-token" };

        mockPost
            .mockResolvedValueOnce({ data: mockBoardingData }) 
            .mockResolvedValueOnce({ data: mockRefreshData }); 

        const result = await completeBoarding();

        expect(mockPost).toHaveBeenCalledWith("/users/onboarding/");
        expect(mockPost).toHaveBeenCalledWith("/auth/refresh/", expect.any(Object));

        expect(result).toEqual(mockBoardingData);
    });
    it("completeBoarding throws when API fails", async () => {
        mockPost.mockRejectedValueOnce(new Error("Network error"));

        await expect(completeBoarding()).rejects.toThrow("Network error");
    });
});