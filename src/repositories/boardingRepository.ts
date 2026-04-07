import { api } from "@/composables/useAPI";
import { useAuthStore } from "@/stores/authStore";
import { refreshToken } from "./auth/authRepository";


export const completeBoarding = async () => {
    try {
        const { data } = await api.post("/users/onboarding/")
        await refreshToken();
        return data;
    } catch (error) {
        throw error;
    }
}