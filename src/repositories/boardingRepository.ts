import { api } from "@/composables/useAPI";
import { refreshToken } from "./auth/authRepository";
import TranslatedError from "@/exceptions/TranslatedError";


export const completeBoarding = async () => {
    try {
        const { data } = await api.post("/users/onboarding/")
        await refreshToken();
        return data;
    } catch (error: any) {
        throw new TranslatedError(error, error.response?.data?.status);
    }
}