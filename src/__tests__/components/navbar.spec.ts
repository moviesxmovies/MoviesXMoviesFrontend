import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue"; // ← desde vue, no vitest
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
        Transition: true,
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

  it("navigates to / when logo is clicked", async () => {
    const wrapper = factory();
    await wrapper.find(".nav-logo").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  // ── Not authenticated ────────────────────────────────────────────────────
  it("shows login button when not authenticated", () => {
    const wrapper = factory(false);
    const buttons = wrapper.findAll(".btn-ghost");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].text()).toContain("Login"); // valor resuelto por i18n
  });

  it("does not show profile button when not authenticated", () => {
    const wrapper = factory(false);
    wrapper.findAll(".btn-ghost").forEach((btn) => {
      expect(btn.text()).not.toContain("Profile");
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
    expect(buttons[0].text()).toContain("home.profile");
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

  // ── Hamburger ────────────────────────────────────────────────────────────
  it("renders hamburger button", () => {
    const wrapper = factory();
    expect(wrapper.find(".hamburger").exists()).toBe(true);
  });

  it("mobile menu is hidden by default", () => {
    const wrapper = factory();
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".mobile-menu").exists()).toBe(true);
  });

  it("closes mobile menu when hamburger is clicked again", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("adds open class to hamburger when menu is open", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".hamburger").classes()).toContain("open");
  });

  it("removes open class from hamburger when menu is closed", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".hamburger").classes()).not.toContain("open");
  });

  it("shows overlay when mobile menu is open", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".overlay").exists()).toBe(true);
  });

  it("hides overlay when mobile menu is closed", () => {
    const wrapper = factory();
    expect(wrapper.find(".overlay").exists()).toBe(false);
  });

  it("closes mobile menu when overlay is clicked", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find(".overlay").trigger("click");
    await nextTick();
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("navigates and closes menu when mobile login button is clicked", async () => {
    const wrapper = factory(false);
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find(".mobile-menu .btn-ghost").trigger("click");
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("navigates and closes menu when mobile profile button is clicked", async () => {
    const wrapper = factory(true);
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find(".mobile-menu .btn-ghost").trigger("click");
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith("/profile");
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("has correct aria-label when menu is closed", () => {
    const wrapper = factory();
    expect(wrapper.find(".hamburger").attributes("aria-label")).toBe("Abrir menú");
  });

  it("has correct aria-label when menu is open", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".hamburger").attributes("aria-label")).toBe("Cerrar menú");
  });
});