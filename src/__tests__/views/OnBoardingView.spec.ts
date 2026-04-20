import { vi, describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import Onboarding from "@/views/OnBoardingView.vue";
import { completeBoarding } from "@/repositories/boardingRepository";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import ToastService from "primevue/toastservice";

const { mockToastAdd } = vi.hoisted(() => ({
  mockToastAdd: vi.fn(),
}));

vi.mock("@/repositories/boardingRepository", () => ({
  completeBoarding: vi.fn(),
}));
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));
vi.mock("primevue", () => ({
  useToast: vi.fn(() => ({ add: mockToastAdd })),
  Button: { template: "<button type='submit'><slot /></button>" },
}));

describe("Onboarding Component", () => {
  let wrapper: any;
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (completeBoarding as any).mockResolvedValue({ success: true });
    document.getElementById = vi.fn().mockReturnValue(document.createElement("div"));
    wrapper = mount(Onboarding, {
      global: {
        plugins: [PrimeVue, ToastService],
        stubs: { HomeView: true, Transition: true },
        mocks: { $t: (key: string) => key },
      },
    });
  });

  it("renders the first step by default", () => {
    expect(wrapper.text()).toContain("onboarding.step1");
    expect(wrapper.find("#step-span").text()).toContain("1 / 5");
  });

  it("advances to the next step when clicking continue", async () => {
    const continueBtn = wrapper.findComponent('#continue-button');
    await continueBtn.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("onboarding.step2");
    expect(wrapper.find("#step-span").text()).toContain("2 / 5");
  });

  it("completes onboarding after the last step", async () => {
    for (let i = 0; i < 4; i++) {
      const btn = wrapper.findComponent('#continue-button');
      expect(wrapper.find("#step-span").text()).toContain(i + 1 + " / 5");
      await btn.trigger("click");
      await flushPromises();

    }

    expect(wrapper.find("#step-span").text()).toContain("5 / 5");

    await wrapper.findComponent('#continue-button').trigger("click");
    await flushPromises();
    expect(completeBoarding).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("calls completeBoarding when clicking skip", async () => {
    const skipBtn = wrapper.find(".skip-button");
    await skipBtn.trigger("click");
    await flushPromises();
    expect(completeBoarding).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("shows toast error if completeBoarding fails", async () => {
    (completeBoarding as any).mockRejectedValueOnce({
      response: { data: { detail: "Server Error" } },
    });
    const skipBtn = wrapper.find(".skip-button");
    await skipBtn.trigger("click");
    await flushPromises();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({
      severity: "error",
      detail: "Server Error",
    }));
  });
});