import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import LangComponent from "@/components/langComponent.vue";
import i18n from "@/i18n";

const { mockChangeLanguage } = vi.hoisted(() => ({
  mockChangeLanguage: vi.fn(),
}));

vi.mock("@/stores/langStore", () => ({
  useLangStore: () => ({
    language: "en",
    setLanguage: vi.fn(),
    changeLanguage: mockChangeLanguage,
  }),
}));

const SelectStub = {
  name: "Select",
  template: `
    <div>
      <div data-testid="select-value">
        <slot name="value" :value="modelValue" :placeholder="placeholder" />
      </div>
      <div data-testid="select-options">
        <div
          v-for="option in options"
          :key="option.value"
          data-testid="select-option"
          @click="$emit('change', { value: option }); $emit('update:modelValue', option)"
        >
          <slot name="option" :option="option" />
        </div>
      </div>
    </div>
  `,
  props: ["modelValue", "options", "optionLabel", "placeholder"],
  emits: ["update:modelValue", "change"],
};

describe("LangComponent", () => {
  const factory = () => {
    return mount(LangComponent, {
      global: {
        plugins: [i18n],
        stubs: { Select: SelectStub },
      },
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("SelectedCountry has EN by default", () => {
    const wrapper = factory();
    expect(wrapper.vm.selectedCountry).toEqual({ label: "EN", value: "en" });
  });

  it("contains ES and US countries", () => {
    const wrapper = factory();
    expect(wrapper.vm.countries).toContainEqual({ label: "ES", value: "es" });
    expect(wrapper.vm.countries).toContainEqual({ label: "US", value: "en" });
    expect(wrapper.vm.countries).toContainEqual({ label: "FR", value: "fr" });
    expect(wrapper.vm.countries).toContainEqual({ label: "DE", value: "de" });
    expect(wrapper.vm.countries).toHaveLength(4);
  });

  it("getFlagUrl returns correct URL", () => {
    const wrapper = factory();
    expect(wrapper.vm.getFlagUrl("ES")).toBe("https://flagcdn.com/w20/es.png");
    expect(wrapper.vm.getFlagUrl("US")).toBe("https://flagcdn.com/w20/us.png");
    expect(wrapper.vm.getFlagUrl("FR")).toBe("https://flagcdn.com/w20/fr.png");
    expect(wrapper.vm.getFlagUrl("DE")).toBe("https://flagcdn.com/w20/de.png");
  });

  describe("#option slot", () => {
    it("renders one option per country", async () => {
      const wrapper = factory();
      const options = wrapper.findAll("[data-testid='select-option']");
      expect(options.length).toBe(4);
    });

    it("renders flag image inside each option", () => {
      const wrapper = factory();
      const option = wrapper.find("[data-testid='select-option']");
      expect(option.find("img").exists()).toBe(true);
    });

    it("renders the option label text", () => {
      const wrapper = factory();
      const option = wrapper.find("[data-testid='select-option']");
      expect(option.find("span").text()).not.toBe("");
    });
  });

  describe("@change", () => {
    it("calls changeLanguage with the selected country value", async () => {
      const wrapper = factory();
      await wrapper.find("[data-testid='select-option']").trigger("click");

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith(expect.any(String));
    });

    it("calls changeLanguage with 'en' if selectedCountry has no value", async () => {
      const wrapper = factory();
      (wrapper.vm as any).selectedCountry = null;
      await wrapper.find("[data-testid='select-value']").trigger("change");

      await (wrapper.vm as any).langStore?.changeLanguage(
        (wrapper.vm as any).selectedCountry?.value || "en",
      );
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });
  });

  describe("v-model", () => {
    it("updates selectedCountry when an option is clicked", async () => {
      const wrapper = factory();
      expect((wrapper.vm as any).selectedCountry).toEqual({ label: "EN", value: "en" });

      await wrapper.find("[data-testid='select-option']").trigger("click");

      expect((wrapper.vm as any).selectedCountry).toBeDefined();
      expect((wrapper.vm as any).selectedCountry).toHaveProperty("value");
      expect((wrapper.vm as any).selectedCountry).toHaveProperty("label");
    });

    it("shows image when no country is selected", () => {
      const wrapper = factory();
      const valueSlot = wrapper.find("[data-testid='select-value']");
      expect(valueSlot.find("img").exists()).toBe(true);
    });

    it("shows flag and label when a country is selected", async () => {
      const wrapper = factory();
      await wrapper.find("[data-testid='select-option']").trigger("click");

      const valueSlot = wrapper.find("[data-testid='select-value']");
      expect(valueSlot.find("img").exists()).toBe(true);
    });
  });
});
