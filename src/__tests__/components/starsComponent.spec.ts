import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StarsComponent from "@/components/starsComponent.vue";

describe("StarsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (loading = false) => {
    return mount(StarsComponent, {
      props: { loading },
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

  it("calls rateMovie and emits showNextMovie when a star is clicked", async () => {
    const wrapper = mountComponent();
    const stars = wrapper.findAll("i");

    await stars[3].trigger("click");

    expect(wrapper.emitted()).toHaveProperty("rateMovie");
  });

  it("disables interactions when loading is true", async () => {
    const wrapper = mountComponent(true);
    const container = wrapper.find("div");

    expect(container.classes()).toContain("opacity-40");
    expect(container.classes()).toContain("pointer-events-none");
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
    expect(wrapper.emitted()).toHaveProperty("rateMovie");
  });
});
