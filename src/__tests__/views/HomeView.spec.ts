import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import HomeView from "@/views/HomeView.vue";
import { getRecommendedMovies } from "@/repositories/movieRepository";
import { setActivePinia, createPinia } from 'pinia';
import { useLangStore } from "@/stores/langStore";

// 1. Mocks de dependencias externas
vi.mock("@/repositories/movieRepository", () => ({
  getRecommendedMovies: vi.fn(),
}));

// Mock de PrimeVue Toast
const mockAddToast = vi.fn();
vi.mock("primevue", () => ({
  useToast: () => ({
    add: mockAddToast,
  }),
}));

// Mock de i18n
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
    
    // Esperamos a que se resuelvan las promesas del onMounted
    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);
    // Verificamos que el componente hijo reciba la primera película
    const movieComp = wrapper.findComponent({ name: "MovieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[0]);
  });

  it("advances to the next movie when showNextMovie is emitted", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    // El hijo emite el evento para avanzar
    const actionsComp = wrapper.findComponent({ name: "ActionsComponent" });
    await actionsComp.vm.$emit("showNextMovie");

    // Ahora el MovieComponent debería tener la segunda película
    const movieComp = wrapper.findComponent({ name: "MovieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[1]);
  });

  it("refetches movies when reaching the end of the list", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    // Avanzamos hasta la última película (tenemos 3, estamos en índice 0)
    const actionsComp = wrapper.findComponent({ name: "ActionsComponent" });
    await actionsComp.vm.$emit("showNextMovie"); // índice 1
    await actionsComp.vm.$emit("showNextMovie"); // índice 2

    // Al estar cerca del final, debería volver a disparar fetchMovies
    expect(getRecommendedMovies).toHaveBeenCalledTimes(2);
  });

  it("reloads movies when language changes", async () => {
    mountWrapper();
    await flushPromises();
    
    const langStore = useLangStore();
    
    // Simulamos cambio de idioma en el store
    langStore.language = "es";
    await flushPromises();

    // Debería haberse llamado una vez por el mount y otra por el watch del lang
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
      })
    );
  });
});