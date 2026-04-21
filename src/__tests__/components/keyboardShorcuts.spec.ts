import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ShortcutFab from "@/components/keyboardShorcuts.vue";

describe("ShortcutFab", () => {
  const mockHandler = vi.fn();
  const options = [
    { label: "Save", icon: "i-save", handler: mockHandler, shortcut: "ctrl+s" },
    { label: "Delete", danger: true, handler: vi.fn(), shortcut: "ctrl+d", disabled: true },
    { label: "Space Action", handler: vi.fn(), shortcut: "space" }
  ];

  const factory = (props = { options }) => {
    return mount(ShortcutFab, {
      props,
      global: {
        mocks: {
          $t: (msg: string) => msg 
        },
            stubs: {
                Transition: true,
            },
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the floating button but not the menu by default", () => {
    const wrapper = factory();
    expect(wrapper.find(".fab-button").exists()).toBe(true);
    expect(wrapper.find(".fab-menu").exists()).toBe(false);
  });

  it("toggles the menu when the button is clicked", async () => {
    const wrapper = factory();
    const button = wrapper.find(".fab-button");
    
    await button.trigger("click");
    expect(wrapper.find(".fab-menu").exists()).toBe(true);
    
    await button.trigger("click");
    expect(wrapper.find(".fab-menu").exists()).toBe(false);
  });

  it("renders grouped options correctly and calls handler on click", async () => {
    const wrapper = factory();
    await wrapper.find(".fab-button").trigger("click");

    const menuItem = wrapper.find(".menu-item");
    expect(menuItem.text()).toContain("Save");
    expect(menuItem.find(".i-save").exists()).toBe(true);

    await menuItem.trigger("click");
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".fab-menu").exists()).toBe(false);
  });

  it("disables the button if the option is disabled", async () => {
    const wrapper = factory();
    await wrapper.find(".fab-button").trigger("click");

    const deleteBtn = wrapper.findAll(".menu-item").find(b => b.text().includes("Delete"));
    expect(deleteBtn?.attributes()).toHaveProperty("disabled");
  });

  it("executes handler on keyboard shortcut (ctrl+s)", async () => {
    factory();
    
    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true
    });
    
    window.dispatchEvent(event);
    
    expect(mockHandler).toHaveBeenCalled();
  });

  it("handles the 'space' shortcut key correctly", async () => {
    const spaceHandler = vi.fn();
    factory({
      options: [{ label: "Space", handler: spaceHandler, shortcut: "space" }]
    });

    const event = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true
    });

    window.dispatchEvent(event);
    expect(spaceHandler).toHaveBeenCalled();
  });

  it("does not execute shortcut if user is typing in an input", async () => {
    factory();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true
    });

    Object.defineProperty(event, 'target', { writable: false, value: input });
    
    window.dispatchEvent(event);
    expect(mockHandler).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });

  it("closes the menu when clicking outside", async () => {
    const wrapper = factory();
    await wrapper.find(".fab-button").trigger("click");
    expect(wrapper.find(".fab-menu").exists()).toBe(true);

    const outsideClick = new MouseEvent("mousedown", { bubbles: true });
    document.dispatchEvent(outsideClick);
    
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".fab-menu").exists()).toBe(false);
  });

  it("removes event listeners on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const windowRemoveSpy = vi.spyOn(window, "removeEventListener");
    
    const wrapper = factory();
    wrapper.unmount();

    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(windowRemoveSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});