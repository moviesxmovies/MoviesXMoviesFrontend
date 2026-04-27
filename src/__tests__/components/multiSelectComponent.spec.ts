import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import PrimeVue from "primevue/config";
import MultiSelectComponent from "@/components/multiSelectComponent.vue";
import { MultiSelect } from "primevue";

describe("MultiSelectComponent", () => {
  const items = [
    { id: 1, name: "Option 1" },
    { id: 2, name: "Option 2" },
  ];

  const mountComponent = (props = {}) =>
    mount(MultiSelectComponent, {
      global: {
        plugins: [PrimeVue],
      },
      props: {
        modelValue: [],
        isLoading: false,
        items,
        message: "Select items",
        ...props,
      },
    });

  it("renders correctly with given props", () => {
    const wrapper = mountComponent();
    const multiselect = wrapper.findComponent(MultiSelect);

    expect(multiselect.props("placeholder")).toBe("Select items");
    expect(multiselect.props("options")).toEqual(items);
  });

  it("emits update:modelValue and change events when selection changes", async () => {
    const wrapper = mountComponent();
    const multiselect = wrapper.findComponent(MultiSelect);

    multiselect.vm.$emit("update:model-value", items);

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("change")).toBeTruthy();
  });

  it("sets disabled and loading state correctly", async () => {
    const wrapper = mountComponent({ isLoading: true });
    const multiselect = wrapper.findComponent(MultiSelect);

    expect(multiselect.props("loading")).toBe(true);
    expect(multiselect.props("disabled")).toBe(true);
  });
});
