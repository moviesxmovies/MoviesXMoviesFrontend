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
        // 1. Definimos la respuesta para el POST de onboarding
        const mockBoardingData = { success: true };
        // 2. Definimos la respuesta para el POST de refresh (que llama internamente)
        const mockRefreshData = { access: "new-token" };

        // Usamos mockResolvedValueOnce en cadena
        mockPost
            .mockResolvedValueOnce({ data: mockBoardingData }) // Primera llamada: /users/onboarding/
            .mockResolvedValueOnce({ data: mockRefreshData }); // Segunda llamada: /auth/refresh/

        const result = await completeBoarding();

        // Verificamos ambas llamadas
        expect(mockPost).toHaveBeenCalledWith("/users/onboarding/");
        expect(mockPost).toHaveBeenCalledWith("/auth/refresh/", expect.any(Object));

        expect(result).toEqual(mockBoardingData);
    });
    it("completeBoarding throws when API fails", async () => {
        mockPost.mockRejectedValueOnce(new Error("Network error"));

        await expect(completeBoarding()).rejects.toThrow("Network error");
    });
});