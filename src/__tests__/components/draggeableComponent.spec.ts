import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DraggeableComponent from "@/components/draggeableComponent.vue";

describe("DraggeableComponent", () => {
  const swipeThreshold = 100;

  const factory = (props = {}) => {
    return mount(DraggeableComponent, {
      props: {
        swipeThreshold,
        ...props,
      },
      slots: {
        default: '<div id="content">Card Content</div>',
      },
    });
  };

  it("renders slot content", () => {
    const wrapper = factory();
    expect(wrapper.text()).toContain("Card Content");
  });

  it("starts dragging on mousedown", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });

    expect(wrapper.emitted("update:isDragging")?.[0]).toEqual([true]);
  });

  it("updates direction model while dragging right", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });

    await container.trigger("mousemove", {
      clientX: swipeThreshold + 50,
      clientY: 0,
    });

    expect(wrapper.emitted("update:direction")?.[0]).toEqual(["right"]);
  });

  it("emits 'right' event and resets on mouseup", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: swipeThreshold + 1,
      clientY: 0,
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted()).toHaveProperty("right");

    expect(wrapper.emitted("update:isDragging")?.at(-1)).toEqual([false]);
    expect(wrapper.emitted("update:direction")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("update:direction")?.at(0)).toEqual(["right"]);
  });

  it("emits 'left' event and resets on mouseup", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: -(swipeThreshold + 1),
      clientY: 0,
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted()).toHaveProperty("left");

    expect(wrapper.emitted("update:isDragging")?.at(-1)).toEqual([false]);
    expect(wrapper.emitted("update:direction")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("update:direction")?.at(0)).toEqual(["left"]);
  });

  it("emits 'up' event and resets on mouseup", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: 0,
      clientY: -(swipeThreshold + 1),
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted()).toHaveProperty("up");

    expect(wrapper.emitted("update:isDragging")?.at(-1)).toEqual([false]);
    expect(wrapper.emitted("update:direction")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("update:direction")?.at(0)).toEqual(["up"]);
  });

  it("emits 'down' event and resets on mouseup", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: 0,
      clientY: swipeThreshold + 1,
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted()).toHaveProperty("down");

    expect(wrapper.emitted("update:isDragging")?.at(-1)).toEqual([false]);
    expect(wrapper.emitted("update:direction")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("update:direction")?.at(0)).toEqual(["down"]);
  });

  it("detects upward swipe", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: 0,
      clientY: -(swipeThreshold + 50),
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted()).toHaveProperty("up");
  });

  it("applies correct styles during dragging", async () => {
    const wrapper = factory({ maxDragDistance: 500 });
    const container = wrapper.find(".draggable-container");
    const wrapperDiv = wrapper.find(".draggable-wrapper");

    await wrapper.setProps({ isDragging: true });
    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", { clientX: 100, clientY: 0 });

    const style = (wrapperDiv.element as HTMLElement).style;

    expect(style.transition).toBe("none");
    expect(style.cursor).toBe("grabbing");
    expect(style.transform).toContain("translateX");
  });

  it("supports touch events", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("touchstart", {
      touches: [{ clientX: 0, clientY: 0 }],
    });

    await container.trigger("touchmove", {
      touches: [{ clientX: swipeThreshold + 50, clientY: 0 }],
    });

    await container.trigger("touchend");

    expect(wrapper.emitted()).toHaveProperty("right");
  });

  it("does not trigger swipe if threshold is not met", async () => {
    const wrapper = factory();
    const container = wrapper.find(".draggable-container");

    await container.trigger("mousedown", { clientX: 0, clientY: 0 });
    await container.trigger("mousemove", {
      clientX: swipeThreshold - 10,
      clientY: 0,
    });
    await container.trigger("mouseup");

    expect(wrapper.emitted("right")).toBeUndefined();
    expect(wrapper.emitted("update:direction")?.[0]).toBeFalsy();
  });
});
