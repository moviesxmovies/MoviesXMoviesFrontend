import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import WelcomeView from "@/views/WelcomeView.vue";
import i18n from "@/i18n";
import { Button } from 'primevue'

const mockPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

const factory = () => {
  return mount(WelcomeView, {
    global: {
      plugins: [createPinia(), i18n],
    },
  });
};

describe("Router logic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("Should navigate to login when button is clicked", async () => {
    const wrapper = factory();
    await wrapper.findComponent(Button).trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
