import { api } from "@/composables/useAPI";


export const getUserProfile = async () => {
  try {
    const { data } = await api.get("/users/");
    return data;
  } catch (error: any) {
    throw error;
  }
}