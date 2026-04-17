import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import WelcomeView from "@/views/WelcomeView.vue";
import i18n from "@/i18n";

const mockPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

const factory = () =>
  mount(WelcomeView, {
    global: {
      plugins: [createPinia(), i18n],
      stubs: { OauthButtonComponent: true },
    },
  });

describe("WelcomeView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ── Render ──────────────────────────────────────────────────────────────
  it("renders the hero title", () => {
    const wrapper = factory();
    expect(wrapper.find(".hero-title").text()).toContain("Movies");
  });

  it("renders the email input", () => {
    const wrapper = factory();
    expect(wrapper.find(".email-input").exists()).toBe(true);
  });

  it("renders the signup button", () => {
    const wrapper = factory();
    expect(wrapper.find(".btn-signup").exists()).toBe(true);
  });

  it("renders the OauthButtonComponent", () => {
    const wrapper = factory();
    expect(
      wrapper.findComponent({ name: "OauthButtonComponent" }).exists(),
    ).toBe(true);
  });

  it("renders the 3 feature items", () => {
    const wrapper = factory();
    expect(wrapper.findAll(".feature-item")).toHaveLength(3);
  });

  // ── Signup button ────────────────────────────────────────────────────────
  it("shows error class when clicking signup with empty email", async () => {
    const wrapper = factory();
    await wrapper.find(".btn-signup").trigger("click");
    expect(wrapper.find(".email-input").classes()).toContain(
      "email-input--error",
    );
  });

  it("shows error class when clicking signup with invalid email", async () => {
    const wrapper = factory();
    await wrapper.find(".email-input").setValue("notanemail");
    await wrapper.find(".btn-signup").trigger("click");
    expect(wrapper.find(".email-input").classes()).toContain(
      "email-input--error",
    );
  });

  it("navigates to /signup with email query when valid email is entered", async () => {
    const wrapper = factory();
    await wrapper.find(".email-input").setValue("test@example.com");
    await wrapper.find(".btn-signup").trigger("click");
    expect(mockPush).toHaveBeenCalledWith({
      path: "/signup",
      query: { email: "test@example.com" },
    });
  });

  it("does not navigate if email has no @", async () => {
    const wrapper = factory();
    await wrapper.find(".email-input").setValue("invalidemail");
    await wrapper.find(".btn-signup").trigger("click");
    expect(mockPush).not.toHaveBeenCalled();
  });

  // ── Enter key ────────────────────────────────────────────────────────────
  it("triggers signup on Enter key in the input", async () => {
    const wrapper = factory();
    await wrapper.find(".email-input").setValue("user@test.com");
    await wrapper.find(".email-input").trigger("keydown", { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith({
      path: "/signup",
      query: { email: "user@test.com" },
    });
  });

  it("does not trigger signup on other keys", async () => {
    const wrapper = factory();
    await wrapper.find(".email-input").setValue("user@test.com");
    await wrapper.find(".email-input").trigger("keydown", { key: "Tab" });
    expect(mockPush).not.toHaveBeenCalled();
  });


});
