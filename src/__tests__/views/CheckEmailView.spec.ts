import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import i18n from "../../i18n";
import CheckEmailView from "../../views/CheckEmailView.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const factory = () => {
  return mount(CheckEmailView, {
    global: {
      plugins: [PrimeVue, i18n],
    },
  });
};

describe("CheckEmailView logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to login on button click", async () => {
    const wrapper = factory();
    await wrapper.find("button").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
