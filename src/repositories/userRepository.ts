import { api } from "@/composables/useAPI";

export const getUserProfile = async (slug: string) => {
  try {
    const { data } = await api.get(`/persons/${slug}/`);
    return data;
  } catch (error: any) {
    throw error;
  }
};
