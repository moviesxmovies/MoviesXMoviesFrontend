import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import HomeView from "@/views/HomeView.vue";
import { getRecommendedMovies } from "@/repositories/movieRepository";
import { setActivePinia, createPinia } from "pinia";
import { useLangStore } from "@/stores/langStore";

vi.mock("@/repositories/movieRepository", () => ({
  getRecommendedMovies: vi.fn(),
  setAsNotSeen: vi.fn(),
}));

const mockAddToast = vi.fn();
vi.mock("primevue", () => ({
  useToast: () => ({
    add: mockAddToast,
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("HomeView", () => {
  const mockMovies = [
    { slug: "movie-1", cover: "img1.jpg", title: "Movie 1" },
    { slug: "movie-2", cover: "img2.jpg", title: "Movie 2" },
    { slug: "movie-3", cover: "img3.jpg", title: "Movie 3" },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    (getRecommendedMovies as any).mockResolvedValue(mockMovies);
  });

  const mountWrapper = () => {
    return mount(HomeView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          MovieComponent: true,
          ActionsComponent: true,
          StarsComponent: true,
        },
      },
    });
  };

  it("fetches movies on mount and displays the first one", async () => {
    const wrapper = mountWrapper();

    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);
    const movieComp = wrapper.findComponent({ name: "MovieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[0]);
  });

  it("advances to the next movie when an action is triggered", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const actionsComp = wrapper.findComponent({ name: "ActionsComponent" });
    // Emitimos un evento que sí existe y dispara showNextRecommendedMovie()
    await actionsComp.vm.$emit("markAsNotSeen");
    await flushPromises(); // Importante para que se procesen las promesas de la API

    const movieComp = wrapper.findComponent({ name: "MovieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[1]);
  });

  it("refetches movies when reaching the end of the list", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const actionsComp = wrapper.findComponent({ name: "ActionsComponent" });
    await actionsComp.vm.$emit("markAsNotSeen");
    await actionsComp.vm.$emit("markAsNotSeen");
    await actionsComp.vm.$emit("markAsNotSeen");

    expect(getRecommendedMovies).toHaveBeenCalledTimes(2);
  });

  it("reloads movies when language changes", async () => {
    mountWrapper();
    await flushPromises();

    const langStore = useLangStore();

    langStore.language = "es";
    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(2);
  });

  it("shows error toast if fetch fails", async () => {
    (getRecommendedMovies as any).mockRejectedValueOnce(new Error("API Error"));

    mountWrapper();
    await flushPromises();

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "toast.error",
      }),
    );
  });
});
