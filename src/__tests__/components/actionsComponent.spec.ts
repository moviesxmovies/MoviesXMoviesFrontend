import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ActionsComponent from "@/components/actionsComponent.vue";

vi.mock("@/repositories/movieRepository", () => ({
  setAsNotSeen: vi.fn(),
}));

function mountComponent(loading: boolean) {
  return mount(ActionsComponent, {
    props: { loading },
  });
}

describe("ActionsComponent", () => {
  it("accepts props correctly", () => {
    const wrapper = mountComponent(false);
    expect(wrapper.props().loading).toBe(false);
  });

  it("Emits markAsNotSeen function when button is clicked", async () => {
    const wrapper = mountComponent(false);

    const notSeenButton = wrapper.find("#unseen-button");
    await notSeenButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("markAsNotSeen");
  });

  it("Emits showMoreInfo function when button is clicked", async () => {
    const wrapper = mountComponent(false);

    const moreInfoButton = wrapper.find("#more-info");
    await moreInfoButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("showMoreInfo");
  });

  it("Emits addToList function when button is clicked", async () => {
    const wrapper = mountComponent(false);

    const addToListButton = wrapper.find("#add-to-list-button");
    await addToListButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("addToList");
  });
});
