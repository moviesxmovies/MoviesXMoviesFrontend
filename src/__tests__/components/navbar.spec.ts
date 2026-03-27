import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import NavbarComponent from "@/components/navbar.vue";
import i18n from "@/i18n";
import { useAuthStore } from "@/stores/authStore";

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

const factory = (isAuthenticated = false) => {
  vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated } as any);

  return mount(NavbarComponent, {
    global: {
      plugins: [createPinia(), i18n],
      stubs: {
        LangComponent: true,
        ThemeComponent: true,
      },
    },
  });
};

describe("NavbarComponent", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ── Render ───────────────────────────────────────────────────────────────

  it("renders the logo text", () => {
    const wrapper = factory();
    expect(wrapper.find(".logo-text").text()).toContain("Movies");
  });

  it("renders the logo image", () => {
    const wrapper = factory();
    expect(wrapper.find(".logo-icon img").exists()).toBe(true);
  });

  it("renders LangComponent", () => {
    const wrapper = factory();
    expect(wrapper.findComponent({ name: "LangComponent" }).exists()).toBe(true);
  });

  it("renders ThemeComponent", () => {
    const wrapper = factory();
    expect(wrapper.findComponent({ name: "ThemeComponent" }).exists()).toBe(true);
  });

  // ── Not authenticated ────────────────────────────────────────────────────

  it("shows login button when not authenticated", () => {
    const wrapper = factory(false);
    const buttons = wrapper.findAll(".btn-ghost");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].text()).toContain("Login");
  });

  it("does not show profile button when not authenticated", () => {
    const wrapper = factory(false);
    wrapper.findAll(".btn-ghost").forEach((btn) => {
      expect(btn.text()).not.toContain("profile");
    });
  });

  it("navigates to /login when login button is clicked", async () => {
    const wrapper = factory(false);
    await wrapper.find(".btn-ghost").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  // ── Authenticated ────────────────────────────────────────────────────────

  it("shows profile button when authenticated", () => {
    const wrapper = factory(true);
    const buttons = wrapper.findAll(".btn-ghost");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].find("span").classes()).toContain("pi");
    expect(buttons[0].find("span").classes()).toContain("pi-user");
  });

  it("does not show login button when authenticated", () => {
    const wrapper = factory(true);
    wrapper.findAll(".btn-ghost").forEach((btn) => {
      expect(btn.text()).not.toContain("Login");
    });
  });

  it("navigates to /profile when profile button is clicked", async () => {
    const wrapper = factory(true);
    await wrapper.find(".btn-ghost").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/profile");
  });
});