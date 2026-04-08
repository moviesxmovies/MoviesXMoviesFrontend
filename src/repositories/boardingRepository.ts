import { api } from "@/composables/useAPI";
import { refreshToken } from "./auth/authRepository";


export const completeBoarding = async () => {
    const { data } = await api.post("/users/onboarding/")
    await refreshToken();
    return data;

}