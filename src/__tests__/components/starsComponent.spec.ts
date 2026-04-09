import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StarsComponent from "@/components/starsComponent.vue";
import { submitRating } from "@/repositories/movieRepository";

vi.mock("@/repositories/movieRepository", () => ({
  submitRating: vi.fn(),
}));

describe("StarsComponent", () => {
  const movieSlug = "the-matrix";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (loading = false) => {
    return mount(StarsComponent, {
      props: { movieSlug, loading },
    });
  };

  it("updates stars color on mouse enter and resets on leave", async () => {
    const wrapper = mountComponent();
    const stars = wrapper.findAll("i");

    await stars[2].trigger("mouseenter");

    const filledStars = wrapper.findAll(".pi-star-fill");
    expect(filledStars.length).toBe(3);

    await wrapper.find("div").trigger("mouseleave");

    expect(wrapper.findAll(".pi-star-fill").length).toBe(0);
  });

  it("calls submitRating and emits showNextMovie when a star is clicked", async () => {
    const wrapper = mountComponent();
    const stars = wrapper.findAll("i");

    await stars[3].trigger("click");

    expect(submitRating).toHaveBeenCalledWith(movieSlug, 4);
    expect(wrapper.emitted()).toHaveProperty("showNextMovie");
  });

  it("disables interactions when loading is true", async () => {
    const wrapper = mountComponent(true);
    const container = wrapper.find("div");
    const stars = wrapper.findAll("i");

    expect(container.classes()).toContain("opacity-40");
    expect(container.classes()).toContain("pointer-events-none");

    await stars[4].trigger("click");

    expect(submitRating).not.toHaveBeenCalled();
  });

  it("calculates rating correctly during touch move", async () => {
    const wrapper = mountComponent();
    const container = wrapper.find({ ref: "starsContainer" });

    vi.spyOn(container.element, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 200,
      top: 0,
      bottom: 0,
      right: 200,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    await container.trigger("touchmove", {
      touches: [{ clientX: 125 }],
    });

    expect(wrapper.findAll(".pi-star-fill").length).toBe(4);
  });

  it("submits the focused rating on touchend", async () => {
    const wrapper = mountComponent();
    const stars = wrapper.findAll("i");
    const container = wrapper.find({ ref: "starsContainer" });

    await stars[1].trigger("mouseenter");

    await container.trigger("touchend");

    expect(submitRating).toHaveBeenCalledWith(movieSlug, 2);
    expect(wrapper.emitted()).toHaveProperty("showNextMovie");
  });

  it("does not submit if the rating is 0", async () => {
    const wrapper = mountComponent();
    const container = wrapper.find({ ref: "starsContainer" });

    await container.trigger("touchend");

    expect(submitRating).not.toHaveBeenCalled();
    expect(wrapper.emitted("showNextMovie")).toBeFalsy();
  });
});
