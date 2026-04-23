import { api } from "@/composables/useAPI";
import type { Platform } from "@/types";

export const fetchPlatforms = async () => {
  try {
    const { data }: { data: Platform[] } = await api.get("platforms");
    return data;
  } catch (error: any) {
    throw error;
  }
};
