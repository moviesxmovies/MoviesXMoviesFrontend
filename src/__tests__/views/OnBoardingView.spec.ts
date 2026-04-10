import { vi, describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import Onboarding from "@/views/OnBoardingView.vue";
import { completeBoarding } from "@/repositories/boardingRepository";
import { useRouter } from "vue-router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Button from "primevue/button";

// --- Mocks ---
vi.mock("@/repositories/boardingRepository", () => ({
  completeBoarding: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

const mockT = (key: string) => key;

describe("Onboarding Component", () => {
  let wrapper: any;
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (completeBoarding as any).mockResolvedValue({ success: true });

    document.getElementById = vi
      .fn()
      .mockReturnValue(document.createElement("div"));

    wrapper = mount(Onboarding, {
      global: {
        plugins: [PrimeVue, ToastService],
        stubs: {
          HomeView: true,
          Button: true,
        },
        mocks: {
          $t: mockT,
        },
      },
    });
  });

  it("renders the first step by default", () => {
    const firstCard = wrapper.find(".pos-bottom-left");
    expect(firstCard.classes()).toContain("visible-boarding");
    expect(firstCard.text()).toContain("onboarding.step1");
  });

  it("advances to the next step when clicking continue", async () => {
    const continueBtn = wrapper.find(".current-step .pointer-events-auto");
    await continueBtn.trigger("click");

    const secondCard = wrapper.find(".pos-top-left");
    expect(secondCard.classes()).toContain("visible-boarding");
    expect(secondCard.text()).toContain("onboarding.step2");
  });

  it("triggers animation on the target element when advancing", async () => {
    const spy = vi.spyOn(document, "getElementById");
    const continueBtn = wrapper.find(".current-step .pointer-events-auto");

    await continueBtn.trigger("click");

    expect(spy).toHaveBeenCalledWith("stars");
  });

  it("go to latest step and verifies final state", async () => {
    for (let i = 0; i < 4; i++) {
      const currentStepWrapper = wrapper.findAll(".step-card")[i];
      const btn = currentStepWrapper.getComponent(Button);

      await btn.trigger("click");
      await wrapper.vm.$nextTick();
    }

    const finalStep = wrapper.findAll(".step-card")[4];
    expect(finalStep.classes()).toContain("current-step");

    const finishBtn = finalStep.getComponent(Button);

    await finishBtn.trigger("click");

    await flushPromises();

    expect(completeBoarding).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("calls completeBoarding when clicking skip", async () => {
    const skipBtn = wrapper.find(".skip-button");
    await skipBtn.trigger("click");

    expect(completeBoarding).toHaveBeenCalled();
    await flushPromises();
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
  });
});
