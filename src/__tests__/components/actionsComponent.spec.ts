import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ActionsComponent from "@/components/actionsComponent.vue";
import { setAsNotSeen } from "@/repositories/movieRepository";

vi.mock("@/repositories/movieRepository", () => ({
  setAsNotSeen: vi.fn(),
}));

function mountComponent(movieSlug: string, loading: boolean) {
  return mount(ActionsComponent, {
    props: { movieSlug, loading },
  });
}

describe("ActionsComponent", () => {
  it("accepts props correctly", () => {
    const wrapper = mountComponent("inception", false);
    expect(wrapper.props().movieSlug).toBe("inception");
    expect(wrapper.props().loading).toBe(false);
  });

  it("calls setAsNotSeen and emits showNextMovie when button is clicked", async () => {
    const movieSlug = "inception";
    const wrapper = mountComponent(movieSlug, false);
    
    const notSeenButton = wrapper.find("#unseen-button");
    await notSeenButton.trigger("click");

    expect(setAsNotSeen).toHaveBeenCalledWith(movieSlug);

    expect(wrapper.emitted()).toHaveProperty("showNextMovie");
    expect(wrapper.emitted("showNextMovie")).toHaveLength(1);
  });
});