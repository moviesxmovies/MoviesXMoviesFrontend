import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import HandleFrienshipComponent from "@/components/handleFriendshipComponent.vue";
import {
  completeFriendRequest,
  removeFriend,
} from "@/repositories/userRepository";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";

// --- Mocks ---

vi.mock("@/repositories/userRepository", () => ({
  completeFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
}));

const mockToast = { add: vi.fn() };
const mockConfirm = { require: vi.fn() };

vi.mock("primevue", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useToast: () => mockToast,
    useConfirm: () => mockConfirm,
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/friendWithFollow.vue", () => ({
  default: {
    name: "FriendWithFollow",
    template:
      '<div class="friend-stub"><button @click="$props.onAddFriend" class="add-btn">Add</button><button @click="$props.onRemoveFriend" class="remove-btn">Remove</button><button @click="$props.onRemovePending" class="pending-btn">Cancel</button></div>',
    props: ["user", "onAddFriend", "onRemoveFriend", "onRemovePending"],
  },
}));

describe("HandleFriendshipComponent", () => {
  const mockUsers = [
    {
      id: 1,
      username: "user1",
      friendship: { is_friend: false, status: null },
    },
    { id: 2, username: "user2", friendship: { is_friend: true, status: null } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const factory = (props: any) => {
    return mount(HandleFrienshipComponent, {
      props,
      global: {
        plugins: [ConfirmationService, ToastService],
        stubs: {
          // Use a functional stub to keep content in the DOM and capture props
          Dialog: {
            name: 'Dialog',
            props: ['visible'],
            template: '<div v-if="visible" class="p-dialog-stub"><slot name="header"></slot><slot></slot><slot name="footer"></slot></div>'
          }
        },
      },
    });
  };

  describe("handleFriendRequest (Accept)", () => {
    it("sends a friend request and updates user state", async () => {
      vi.mocked(completeFriendRequest).mockResolvedValue({});
      const user = {
        id: 1,
        username: "user1",
        friendship: { is_friend: false, status: null },
      };
      const wrapper = factory({ users: [user] });

      await wrapper.find(".add-btn").trigger("click");
      await flushPromises();

      expect(completeFriendRequest).toHaveBeenCalledWith("user1", true);
      // Verificamos que el objeto pasado en la prop se ha actualizado
      expect(user.friendship).toEqual({ is_friend: false, status: "P" });
    });
  });

  describe("removeFrienshipModal", () => {
    it("triggers confirmation modal when removing a friend", async () => {
      const user = { id: 2, username: "user2", friendship: { is_friend: true, status: null } };
      const wrapper = factory({ users: [user] });

      await wrapper.find(".remove-btn").trigger("click");

      // Check the manual Dialog visibility instead of the mockConfirm
      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it("calls removeFriend API when confirmation is accepted", async () => {
      vi.mocked(removeFriend).mockResolvedValue({});
      const user = { id: 2, username: "user2", friendship: { is_friend: true, status: null } };
      const wrapper = factory({ users: [user] });

      // 1. Open Modal
      await wrapper.find(".remove-btn").trigger("click");

      // 2. Click the actual "Remove" button inside the Dialog footer
      await wrapper.find(".btn-remove").trigger("click");
      await flushPromises();

      expect(removeFriend).toHaveBeenCalledWith("user2");
      expect(user.friendship.status).toBeNull();
    });

    it("calls handleFriendRequest(false) when declining a pending request", async () => {
      vi.mocked(completeFriendRequest).mockResolvedValue({});
      const user = { id: 1, username: "user1", friendship: { is_friend: false, status: "P" } };
      const wrapper = factory({ users: [user] });

      // 1. Open Modal via pending button
      await wrapper.find(".pending-btn").trigger("click");

      // 2. Confirm action
      await wrapper.find(".btn-remove").trigger("click");
      await flushPromises();

      expect(completeFriendRequest).toHaveBeenCalledWith("user1", false);
      expect(user.friendship.status).toBeNull();
    });
  });
});
