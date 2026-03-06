import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import OauthButtonComponent from "@/components/oauthButtonComponent.vue";
import i18n from "@/i18n";

describe("oauthButtonComponent", () => {
  const factory = () => {
    return mount(OauthButtonComponent, {
      global: {
        plugins: [i18n],
      },
    });
  };

  it("handleGoogleLogin emites click", () => {
    const wrapper = factory();

    wrapper.vm.handleGoogleLogin();

    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("Emits click event when button is clicked", async () => {
    const wrapper = factory();

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });
});
