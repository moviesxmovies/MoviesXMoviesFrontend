import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditProfileModal from "@/components/editProfileModal.vue";
import type { SelfUser } from "@/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockGetSelfUserProfile = vi.fn();
const mockUpdateSelfUserProfile = vi.fn();
const mockToastAdd = vi.fn();

vi.mock("@/repositories/userRepository", () => ({
  getSelfUserProfile: (...a: unknown[]) => mockGetSelfUserProfile(...a),
  updateSelfUserProfile: (...a: unknown[]) => mockUpdateSelfUserProfile(...a),
}));

vi.mock("@/schemas/editProfileSchema", () => ({
  editProfileSchema: {
    safeParse: (data: any) => {
      const errors: { path: string[]; message: string }[] = [];
      if (
        data.password &&
        data.confirm_password &&
        data.password !== data.confirm_password
      ) {
        errors.push({ path: ["confirm_password"], message: "schema.confirmPassword.mismatch" });
      }
      if (data.password && data.password.length < 10) {
        errors.push({ path: ["password"], message: "schema.password.minLength" });
      }
      if (errors.length > 0) {
        return { success: false, error: { issues: errors } };
      }
      return { success: true, data };
    },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (k: string, args?: unknown[]) => (args ? `${k}:${args}` : k),
  }),
}));

vi.mock("primevue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    Dialog: defineComponent({
      name: "Dialog",
      props: ["visible", "modal", "draggable", "dismissableMask", "header", "style", "pt"],
      emits: ["update:visible"],
      setup(props, { slots }) {
        return () =>
          props.visible
            ? h("div", { "data-testid": "Dialog" }, [
              slots.default?.(),
              slots.footer?.(),
            ])
            : null;
      },
    }),
    useToast: () => ({ add: mockToastAdd }),
  };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockSelfUser: SelfUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  bio: "My bio",
  picture: "https://example.com/pic.jpg",
} as SelfUser;

// ── Mount helper ──────────────────────────────────────────────────────────────

const mountComponent = async (visible = true) => {
  const wrapper = mount(EditProfileModal, {
    props: {
      visible: false,
      "onUpdate:visible": vi.fn(),
    },
    global: { stubs: { teleport: true } },
  });

  if (visible) {
    await wrapper.setProps({ visible: true });
  }

  return wrapper;
};


// ─────────────────────────────────────────────────────────────────────────────
describe("EditProfileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSelfUserProfile.mockResolvedValue(mockSelfUser);
    mockUpdateSelfUserProfile.mockResolvedValue(mockSelfUser);
  });

  // ── Visibility ────────────────────────────────────────────────────────────
  describe("visibility", () => {
    it("renders the Dialog when visible is true", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(true);
    });

    it("does not render the Dialog when visible is false", async () => {
      const wrapper = await mountComponent(false);
      await flushPromises();
      expect(wrapper.find("[data-testid='Dialog']").exists()).toBe(false);
    });
  });

  // ── Initial data loading ──────────────────────────────────────────────────
  describe("initial data loading", () => {
    it("calls getSelfUserProfile when dialog becomes visible", async () => {
      await mountComponent(true);
      await flushPromises();
      expect(mockGetSelfUserProfile).toHaveBeenCalledTimes(1);
    });

    it("populates form fields with user data", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      const vm = wrapper.vm as any;
      expect(vm.form.username).toBe("testuser");
      expect(vm.form.email).toBe("test@example.com");
      expect(vm.form.first_name).toBe("Test");
      expect(vm.form.last_name).toBe("User");
      expect(vm.form.bio).toBe("My bio");
    });

    it("sets picturePreview from user data", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      const vm = wrapper.vm as any;
      expect(vm.picturePreview).toBe("https://example.com/pic.jpg");
    });

    it("resets password fields to empty on open", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      const vm = wrapper.vm as any;
      expect(vm.form.password).toBe("");
      expect(vm.form.confirm_password).toBe("");
    });

    it("clears errors on open", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      const vm = wrapper.vm as any;
      expect(vm.fieldErrors).toEqual({});
      expect(vm.serverErrors).toEqual([]);
    });
  });

  // ── Form reset ────────────────────────────────────────────────────────────
  describe("reset button", () => {
    it("calls getSelfUserProfile again when reset is clicked", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();
      mockGetSelfUserProfile.mockClear();

      await wrapper.find(".btn-reset").trigger("click");
      await flushPromises();

      expect(mockGetSelfUserProfile).toHaveBeenCalledTimes(1);
    });

    it("restores original form values after reset", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      // Modify the form
      const vm = wrapper.vm as any;
      vm.form.username = "changed";
      await wrapper.vm.$nextTick();

      await wrapper.find(".btn-reset").trigger("click");
      await flushPromises();

      expect(vm.form.username).toBe("testuser");
    });
  });

  // ── Client-side validation ────────────────────────────────────────────────
  describe("client-side validation", () => {
    it("shows error when passwords do not match", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.form.password = "ValidPass1234";
      vm.form.confirm_password = "DifferentPass1";

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(vm.fieldErrors.confirm_password).toContain("schema.confirmPassword.mismatch");
      expect(mockUpdateSelfUserProfile).not.toHaveBeenCalled();
    });

    it("shows error when password is too short", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.form.password = "short";
      vm.form.confirm_password = "short";

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(vm.fieldErrors.password).toContain("schema.password.minLength");
      expect(mockUpdateSelfUserProfile).not.toHaveBeenCalled();
    });

    it("does not submit when validation fails", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.form.password = "short";
      vm.form.confirm_password = "nomatch";

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(mockUpdateSelfUserProfile).not.toHaveBeenCalled();
    });
  });

  // ── clearError ────────────────────────────────────────────────────────────
  describe("clearError", () => {
    it("clears field error on input", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.fieldErrors = { username: ["Some error"] };
      await wrapper.vm.$nextTick();

      await wrapper.find("#username").trigger("input");
      expect(vm.fieldErrors.username).toEqual([]);
    });

    it("clears serverErrors on any input", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.serverErrors = ["Server error"];
      await wrapper.vm.$nextTick();

      await wrapper.find("#username").trigger("input");
      expect(vm.serverErrors).toEqual([]);
    });
  });

  // ── Successful submit ─────────────────────────────────────────────────────
  describe("successful submit", () => {
    it("calls updateSelfUserProfile with correct FormData fields", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(mockUpdateSelfUserProfile).toHaveBeenCalledTimes(1);
      const formData: FormData = mockUpdateSelfUserProfile.mock.calls[0][0];
      expect(formData.get("username")).toBe("testuser");
      expect(formData.get("email")).toBe("test@example.com");
    });

    it("emits 'updated' with the returned user", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("updated")).toBeTruthy();
    });

    it("closes the dialog on success", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("update:visible")).toBeTruthy();
    });

    it("shows success toast on success", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" })
      );
    });

    it("does not send password field when empty", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      const formData: FormData = mockUpdateSelfUserProfile.mock.calls[0][0];
      expect(formData.get("password")).toBeNull();
    });
  });

  // ── Server errors ─────────────────────────────────────────────────────────
  describe("server errors", () => {
    it("shows server error messages from 'error' key", async () => {
      mockUpdateSelfUserProfile.mockRejectedValue({
        response: { data: { error: ["This password is too short.", "Too common."] } },
      });
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.serverErrors).toContain("This password is too short.");
      expect(vm.serverErrors).toContain("Too common.");
    });

    it("shows field-level server errors", async () => {
      mockUpdateSelfUserProfile.mockRejectedValue({
        response: { data: { username: ["Username already taken."] } },
      });
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.fieldErrors.username).toContain("Username already taken.");
    });

    it("shows generic toast when response has no data", async () => {
      mockUpdateSelfUserProfile.mockRejectedValue(new Error("network"));
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });

    it("sets loading to false after failed submit", async () => {
      mockUpdateSelfUserProfile.mockRejectedValue(new Error("fail"));
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.loading).toBe(false);
    });
  });

  // ── Cancel button ─────────────────────────────────────────────────────────
  describe("cancel button", () => {
    it("closes the dialog when cancel is clicked", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-cancel").trigger("click");

      expect(wrapper.emitted("update:visible")).toBeTruthy();
    });
  });

  // ── File change ───────────────────────────────────────────────────────────
  describe("picture upload", () => {
    it("updates picturePreview when a file is selected", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      const file = new File(["content"], "avatar.jpg", { type: "image/jpeg" });

      // Simulate onFileChange directly
      const fakeEvent = { target: { files: [file] } } as unknown as Event;
      vm.onFileChange(fakeEvent);
      await wrapper.vm.$nextTick();

      expect(vm.pictureFile).toBe(file);
      expect(vm.picturePreview).toMatch(/^blob:/);
    });

    it("appends picture to FormData when file is selected", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      const file = new File(["content"], "avatar.jpg", { type: "image/jpeg" });
      vm.pictureFile = file;

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      const formData: FormData = mockUpdateSelfUserProfile.mock.calls[0][0];
      expect(formData.get("picture")).toBe(file);
    });
  });
  // ── Email change ──────────────────────────────────────────────────────────
  describe("email change", () => {
    it("emits 'emailChanged' when the returned user has a different email", async () => {
      const updatedUser = { ...mockSelfUser, email: "new@example.com" };
      mockUpdateSelfUserProfile.mockResolvedValue(updatedUser);

      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("emailChanged")).toBeTruthy();
    });

    it("does not emit 'emailChanged' when email is unchanged", async () => {
      mockUpdateSelfUserProfile.mockResolvedValue(mockSelfUser);

      const wrapper = await mountComponent(true);
      await flushPromises();

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("emailChanged")).toBeFalsy();
    });

    it("does not emit 'emailChanged' when email field is empty", async () => {
      const wrapper = await mountComponent(true);
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.form.email = "";

      await wrapper.find(".btn-save").trigger("click");
      await flushPromises();

      expect(wrapper.emitted("emailChanged")).toBeFalsy();
    });
  });
});