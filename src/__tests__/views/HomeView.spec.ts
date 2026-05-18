import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import HomeView from "@/views/HomeView.vue";
import {
  getRecommendedMovies,
  submitRating,
  setAsNotSeen,
} from "@/repositories/movieRepository";
import { setActivePinia, createPinia } from "pinia";
import { useLangStore } from "@/stores/langStore";

vi.mock("@/repositories/movieRepository", () => ({
  getRecommendedMovies: vi.fn(),
  setAsNotSeen: vi.fn(),
  submitRating: vi.fn(),
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
    (submitRating as any).mockResolvedValue({});
    (setAsNotSeen as any).mockResolvedValue({});

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });
  describe("updateGlow", () => {
    it("sets opacity to 0 and scale to 0.95 when direction is empty", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("0");
      expect((glowEl.element as HTMLElement).style.transform).toBe("scale(0.95)");
    });

    it("sets correct color and opacity when direction is 'right'", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("right");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("var(--yellow)");
      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("1");
      expect((glowEl.element as HTMLElement).style.transform).toBe("scale(1.04)");
    });

    it("sets correct color when direction is 'left'", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("left");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("var(--red)");
      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("1");
    });

    it("sets correct color when direction is 'up'", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("up");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("var(--primary)");
      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("1");
    });

    it("sets correct color when direction is 'down'", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("down");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("var(--gray)");
      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("1");
    });

    it("sets transparent color for unknown direction", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const glowEl = wrapper.find("#glow-container");
      await (wrapper.vm as any).updateGlow("unknown");

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("transparent");
      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-opacity")).toBe("1");
    });

    it("updates glow when direction model changes", async () => {
      const wrapper = mountWrapper();
      await flushPromises();

      const draggable = wrapper.findComponent({ name: "DraggeableComponent" });
      const glowEl = wrapper.find("#glow-container");

      await draggable.vm.$emit("update:direction", "right");
      await flushPromises();

      expect((glowEl.element as HTMLElement).style.getPropertyValue("--glow-color")).toBe("var(--yellow)");
    });
  });

  const mountWrapper = () => {
    return mount(HomeView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          MovieComponent: true,
          ActionsComponent: true,
          starsComponent: {
            name: 'starsComponent',
            template: '<div />',
            methods: {
              triggerAnimation: vi.fn(), // ← add this
            },
          },

          DraggeableComponent: false,
          MovieInfoDrawer: true,
          AddToListDialog: true,
        },
      },
    });
  };

  it("prevents multiple simultaneous fetchMovies calls if already loading", async () => {
    const longPendingPromise = new Promise((resolve) => { });
    (getRecommendedMovies as any).mockReturnValue(longPendingPromise);
    mountWrapper();
    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);

    const langStore = useLangStore();
    langStore.language = "fr";
    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);
  });

  it("fetches movies on mount and displays the first one", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);
    const movieComp = wrapper.findComponent({ name: "movieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[0]);
  });

  it("gets an error toast if fetching movies fails", async () => {
    (getRecommendedMovies as any).mockRejectedValue(new Error("Network error"));
    mountWrapper();
    await flushPromises();

    expect(mockAddToast).toHaveBeenCalledWith({
      severity: "error",
      summary: "toast.error",
      detail: "home.fetchMoviesError",
      life: 3000,
    });
  });

  it("doesn't update movies if change lang is the same", async () => {
    mountWrapper();
    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);

    const langStore = useLangStore();
    langStore.language = "en";
    await flushPromises();

    expect(getRecommendedMovies).toHaveBeenCalledTimes(1);
  });

  it("doesn't call setAsNotSeen if there's no actualMovie", async () => {
    (getRecommendedMovies as any).mockResolvedValue([]);
    const wrapper = mountWrapper();
    await flushPromises();

    await (wrapper.vm as any).markAsNotSeen();
    await flushPromises();

    expect(setAsNotSeen).not.toHaveBeenCalled();
  });

  it("doesn't give rating if tried to rate 0 stars", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    await (wrapper.vm as any).rateMovie(0);
    await flushPromises();

    expect(submitRating).not.toHaveBeenCalled();
  });

  it("doesn't give rating if there's no actualMovie", async () => {
    (getRecommendedMovies as any).mockResolvedValue([]);
    const wrapper = mountWrapper();
    await flushPromises();

    await (wrapper.vm as any).rateMovie(5);
    await flushPromises();

    expect(submitRating).not.toHaveBeenCalled();
  });

  it("advances to the next movie when an action is triggered", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const actionsComp = wrapper.findComponent({ name: "actionsComponent" });
    await actionsComp.vm.$emit("markAsNotSeen");
    await flushPromises();

    const movieComp = wrapper.findComponent({ name: "movieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[1]);
  });

  it("refetches movies when reaching the end of the list", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const actionsComp = wrapper.findComponent({ name: "actionsComponent" });
    await actionsComp.vm.$emit("markAsNotSeen");
    await actionsComp.vm.$emit("markAsNotSeen");
    await flushPromises();

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

  it("gives 5 star rating if dragged to right", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const draggable = wrapper.findComponent({ name: "draggeableComponent" });
    await draggable.vm.$emit("right");
    await flushPromises();

    expect(submitRating).toHaveBeenCalledWith(mockMovies[0].slug, 5);

    const movieComp = wrapper.findComponent({ name: "movieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[1]);
  });

  it("gives 1 star rating if dragged to right", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const draggable = wrapper.findComponent({ name: "draggeableComponent" });
    await draggable.vm.$emit("left");
    await flushPromises();

    expect(submitRating).toHaveBeenCalledWith(mockMovies[0].slug, 1);

    const movieComp = wrapper.findComponent({ name: "movieComponent" });
    expect(movieComp.props("movie")).toEqual(mockMovies[1]);
  });

  it("shows addToListDialog when dragged up", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const draggable = wrapper.findComponent({ name: "draggeableComponent" });
    await draggable.vm.$emit("up");
    await flushPromises();

    const dialog = wrapper.findComponent({ name: "AddToListDialog" });

    expect(dialog.props("visible")).toBe(true);
  });

  it("alternates info drawer visibility", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const drawer = wrapper.findComponent({ name: "MovieInfoDrawer" });

    expect(drawer.props("visible")).toBe(false);
    await drawer.vm.$emit("update:visible", true);
    expect(drawer.props("visible")).toBe(true);
  });

  it("updates visibleDrawer when MovieInfoDrawer emits update:visible", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const drawer = wrapper.findComponent({ name: "MovieInfoDrawer" });

    await drawer.vm.$emit("update:visible", true);
    expect(drawer.props("visible")).toBe(true);

    await drawer.vm.$emit("update:visible", false);
    expect(drawer.props("visible")).toBe(false);
  });

  it("updates visibleDialog when AddToListDialog emits update:visible", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const dialog = wrapper.findComponent({ name: "AddToListDialog" });

    await dialog.vm.$emit("update:visible", true);
    expect(dialog.props("visible")).toBe(true);

    await dialog.vm.$emit("update:visible", false);
    expect(dialog.props("visible")).toBe(false);
  });

  it("updates direction and dragging state when DraggeableComponent emits update events", async () => {
    const wrapper = mountWrapper();
    await flushPromises();

    const draggable = wrapper.findComponent({ name: "DraggeableComponent" });

    await draggable.vm.$emit("update:direction", "right");
    expect(draggable.props("direction")).toBe("right");

    await draggable.vm.$emit("update:isDragging", true);
    expect(draggable.props("isDragging")).toBe(true);
  });
});
