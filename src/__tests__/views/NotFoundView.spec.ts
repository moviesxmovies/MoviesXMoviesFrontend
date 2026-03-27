import { describe, it, vi, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import NotFoundView from "@/views/NotFoundView.vue";
import PrimeVue from "primevue/config";
import i18n from "@/i18n";

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("NotFoundView", () => {
  it("Should redirect home when button clicked", async () => {
    const wrapper = mount(NotFoundView, {
      global: {
        plugins: [PrimeVue, i18n],
      },
    });

    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
