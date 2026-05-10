import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import NavbarComponent from "@/components/navbar.vue";
import i18n from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { getSelfUserProfile, getFriendsRequests } from "@/repositories/userRepository";

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
    logout: vi.fn(),
  })),
}));

const factory = (isAuthenticated = false) => {
  vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated } as any);
  return mount(NavbarComponent, {
    global: {
      plugins: [i18n],
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

  it("renders search button", () => {
    const wrapper = factory();
    expect(wrapper.find('#search-btn').exists()).toBe(true);
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

  it("navigates to /search when search is clicked", async () => {
    const wrapper = factory();
    await wrapper.find("#search-btn").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/search");
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
      expect(btn.text()).not.toContain("Profile");
    });
  });

  it("navigates to /login when login button is clicked", async () => {
    const wrapper = factory(false);
    await wrapper.find(".btn-ghost").trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  // ── Authenticated ────────────────────────────────────────────────────────

  it("does not show login button when authenticated", () => {
    const wrapper = factory(true);
    wrapper.findAll(".btn-ghost").forEach((btn) => {
      expect(btn.text()).not.toContain("Login");
    });
  });

  it("does not show login button when authenticated", () => {
    const wrapper = factory(true);
    const loginBtns = wrapper.findAll(".btn-ghost").filter(btn =>
      btn.text().includes("Login")
    );
    expect(loginBtns).toHaveLength(0);
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
    await wrapper.find("#profile-btn-mobile").trigger("click");
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("navigates and closes menu when mobile profile button is clicked", async () => {
    const wrapper = factory(true);
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find("#profile-btn-mobile").trigger("click");
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith("/users");
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("navigates and closes menu when mobile search button is clicked", async () => {
    const wrapper = factory(false);
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    await wrapper.find("#search-btn-mobile").trigger("click");
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith("/search");
    expect(wrapper.find(".mobile-menu").exists()).toBe(false);
  });

  it("has correct aria-label when menu is closed", () => {
    const wrapper = factory();
    expect(wrapper.find(".hamburger").attributes("aria-label")).toBe("Open menu");
  });

  it("has correct aria-label when menu is open", async () => {
    const wrapper = factory();
    await wrapper.find(".hamburger").trigger("click");
    await nextTick();
    expect(wrapper.find(".hamburger").attributes("aria-label")).toBe("Close menu");
  });
  // ── menuItems ────────────────────────────────────────────────────────────────
  describe("menuItems computed", () => {
    it("has 3 items (profile, separator, logout)", () => {
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      expect(vm.menuItems).toHaveLength(3);
    });

    it("first item has profile label and icon", () => {
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      expect(vm.menuItems[0].icon).toBe("pi pi-user");
      expect(typeof vm.menuItems[0].command).toBe("function");
    });

    it("second item is a separator", () => {
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      expect(vm.menuItems[1].separator).toBe(true);
    });

    it("third item has logout icon", () => {
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      expect(vm.menuItems[2].icon).toBe("pi pi-sign-out");
      expect(typeof vm.menuItems[2].command).toBe("function");
    });

    it("profile command navigates to /profile", () => {
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      vm.menuItems[0].command();
      expect(mockPush).toHaveBeenCalledWith("/users");
    });

    it("logout command calls authStore.logout and navigates to /", () => {
      const mockLogout = vi.fn();
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        logout: mockLogout,
      } as any);
      const wrapper = mount(NavbarComponent, {
        global: {
          plugins: [i18n],
          stubs: { LangComponent: true, ThemeComponent: true, Transition: true },
        },
      });
      const vm = wrapper.vm as any;
      vm.menuItems[2].command();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  // ── loadProfilePicture ───────────────────────────────────────────────────────
  vi.mock("@/repositories/userRepository", () => ({
    getSelfUserProfile: vi.fn(),
    getFriendsRequests: vi.fn(),

  }));


  describe("loadProfilePicture", () => {
    it("sets profilePicture to null when not authenticated", async () => {
      const wrapper = factory(false);
      const vm = wrapper.vm as any;
      await vm.loadProfilePicture();
      expect(vm.profilePicture).toBeNull();
    });

    it("sets profilePicture from profile when authenticated", async () => {
      vi.mocked(getSelfUserProfile).mockResolvedValue({ picture: "https://example.com/pic.jpg" } as any);
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      await vm.loadProfilePicture();
      expect(vm.profilePicture).toBe("https://example.com/pic.jpg");
    });

    it("sets profilePicture to null when profile has no picture", async () => {
      vi.mocked(getSelfUserProfile).mockResolvedValue({ picture: null } as any);
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      await vm.loadProfilePicture();
      expect(vm.profilePicture).toBeNull();
    });

    it("sets profilePicture to null when getUserProfile throws", async () => {
      vi.mocked(getSelfUserProfile).mockRejectedValue(new Error("Network error"));
      const wrapper = factory(true);
      const vm = wrapper.vm as any;
      await vm.loadProfilePicture();
      expect(vm.profilePicture).toBeNull();
    });

    it("reloads profilePicture when isAuthenticated changes to true", async () => {
      vi.mocked(getSelfUserProfile).mockResolvedValue({ picture: "https://example.com/pic.jpg" } as any);

      const authState = reactive({ isAuthenticated: false, logout: vi.fn() });
      vi.mocked(useAuthStore).mockReturnValue(authState as any);

      const wrapper = mount(NavbarComponent, {
        global: {
          plugins: [i18n],
          stubs: { LangComponent: true, ThemeComponent: true, Transition: true },
        },
      });

      authState.isAuthenticated = true;   // triggers the watcher
      await nextTick();
      await nextTick(); // second tick lets the async watcher callback resolve

      expect((wrapper.vm as any).profilePicture).toBe("https://example.com/pic.jpg");
    });
  });
  // ── Notification badge ───────────────────────────────────────────────────

  describe("notification badge", () => {
    beforeEach(() => {
      vi.mocked(getSelfUserProfile).mockResolvedValue({ picture: null } as any)
    })

    it("does not show badge when there are no pending requests", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 0 } as any)
      const wrapper = factory(true)
      await flushPromises()
      expect(wrapper.find(".notification-badge").exists()).toBe(false)
    })

    it("shows badge when there are pending requests", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 3 } as any)
      const wrapper = factory(true)
      await flushPromises()
      expect(wrapper.find(".notification-badge").exists()).toBe(true)
    })

    it("shows the exact count when less than 6", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 4 } as any)
      const wrapper = factory(true)
      await flushPromises()
      expect(wrapper.find(".notification-badge").text()).toBe("4")
    })

    it("shows '5+' when count is 6 or more", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 6 } as any)
      const wrapper = factory(true)
      await flushPromises()
      expect(wrapper.find(".notification-badge").text()).toBe("5+")
    })

    it("shows '5+' when count is greater than 6", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 12 } as any)
      const wrapper = factory(true)
      await flushPromises()
      expect(wrapper.find(".notification-badge").text()).toBe("5+")
    })

    it("does not show badge when not authenticated", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 5 } as any)
      const wrapper = factory(false)
      await flushPromises()
      expect(wrapper.find(".notification-badge").exists()).toBe(false)
    })

    it("resets badge to 0 when user logs out", async () => {
      vi.mocked(getFriendsRequests).mockResolvedValue({ count: 3 } as any)

      const authState = reactive({ isAuthenticated: true, logout: vi.fn() })
      vi.mocked(useAuthStore).mockReturnValue(authState as any)

      const wrapper = mount(NavbarComponent, {
        global: {
          plugins: [i18n],
          stubs: { LangComponent: true, ThemeComponent: true, Transition: true },
        },
      })
      await flushPromises()

      // ← accede al store en vez de vm
      const { useNotificationsStore } = await import("@/stores/notificationStore")
      const notificationsStore = useNotificationsStore()
      expect(notificationsStore.pendingFriendRequests).toBe(3)

      authState.isAuthenticated = false
      await nextTick()

      expect(notificationsStore.pendingFriendRequests).toBe(0)
      expect(wrapper.find(".notification-badge").exists()).toBe(false)
    })


    it("sets pendingFriendsRequests to 0 when getFriendsRequests throws", async () => {
      vi.mocked(getFriendsRequests).mockRejectedValue(new Error("Network error"))
      const wrapper = factory(true)
      await flushPromises()

      // ← accede al store en vez de vm
      const { useNotificationsStore } = await import("@/stores/notificationStore")
      const notificationsStore = useNotificationsStore()
      expect(notificationsStore.pendingFriendRequests).toBe(0)
      expect(wrapper.find(".notification-badge").exists()).toBe(false)
    })

  })
});