import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PrimeVue from "primevue/config";
import ToggleSwitch from "primevue/toggleswitch";
import { useRoute } from "vue-router";
import filterPreferencesComponent from "@/components/filterPreferencesComponent.vue";
import { reactive } from "vue";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("filterPreferencesComponent", () => {
  let mockRoute: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute = reactive({
      query: {
        marked_unseen: "false",
        reviewed: "false",
      },
    });
    vi.mocked(useRoute).mockReturnValue(mockRoute);
  });

  const mountComponent = () =>
    mount(filterPreferencesComponent, {
      global: {
        plugins: [PrimeVue],
        components: { ToggleSwitch },
      },
    });

  it("initializes refs based on route query parameters", () => {
    mockRoute.query = { marked_unseen: "true", reviewed: "true" };
    const wrapper = mountComponent();

    const [switchUnseen, switchReviewed] =
      wrapper.findAllComponents(ToggleSwitch);

    expect(switchUnseen.props("modelValue")).toBe(true);
    expect(switchReviewed.props("modelValue")).toBe(true);
  });

  it("emits 'filterUnseen' when marked_unseen toggle changes", async () => {
    const wrapper = mountComponent();
    const switchUnseen = wrapper.findAllComponents(ToggleSwitch).at(0);

    switchUnseen.vm.$emit("update:modelValue", true);
    switchUnseen.vm.$emit("change");

    expect(wrapper.emitted("filterUnseen")).toBeTruthy();
  });

  it("emits 'filterReviewed' when reviewed toggle changes", async () => {
    const wrapper = mountComponent();
    const switchReviewed = wrapper.findAllComponents(ToggleSwitch).at(1);

    switchReviewed.vm.$emit("update:modelValue", true);
    switchReviewed.vm.$emit("change");

    expect(wrapper.emitted("filterReviewed")).toBeTruthy();
  });

  it("updates internal refs when route query changes (watch)", async () => {
    const wrapper = mountComponent();

    mockRoute.query.marked_unseen = "true";
    await wrapper.vm.$nextTick();

    const switchUnseen = wrapper.findAllComponents(ToggleSwitch).at(0);
    expect(switchUnseen.props("modelValue")).toBe(true);
  });

  it("renders labels correctly using i18n", () => {
    const wrapper = mountComponent();
    const labels = wrapper.findAll(".preference-info");

    expect(labels[0].text()).toBe("components.filter.unseen");
    expect(labels[1].text()).toBe("components.filter.reviewed");
  });
});
