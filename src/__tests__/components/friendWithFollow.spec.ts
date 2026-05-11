import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FriendWithFollow from "@/components/friendWithFollow.vue";

vi.mock("@/components/friendComponent.vue", () => ({
  default: {
    name: "FriendComponent",
    template: '<div data-testid="friend-wrapper"><slot /></div>',
    props: ["username"],
  },
}));

vi.mock("@/components/friendshipStatusComponent.vue", () => ({
  default: {
    name: "FriendshipStatusComponent",
    template: '<div data-testid="friendship-status" />',
    props: ["user", "onAddFriend", "onRemoveFriend", "onRemovePending"],
  },
}));

describe("FriendWithFollow.vue", () => {
  const mockUser = {
    id: 1,
    username: "test_user",
    picture: "profile.jpg",
    friendship: { is_friend: false, status: null }
  };

  const factory = (props = {}) => {
    return mount(FriendWithFollow, {
      props: {
        user: mockUser,
        ...props,
      },
    });
  };

  it("renders child components with correct props", () => {
    const wrapper = factory();

    const friendComp = wrapper.getComponent({ name: "FriendComponent" });
    expect(friendComp.props("username")).toBe(mockUser.username);

    const statusComp = wrapper.getComponent({ name: "FriendshipStatusComponent" });
    expect(statusComp.props("user")).toEqual(mockUser);
  });

  it("passes action callbacks to FriendshipStatusComponent", async () => {
    const onAddFriend = vi.fn();
    const onRemoveFriend = vi.fn();
    const onRemovePending = vi.fn();

    const wrapper = factory({
      onAddFriend,
      onRemoveFriend,
      onRemovePending,
    });

    const statusComp = wrapper.getComponent({ name: "FriendshipStatusComponent" });

    expect(statusComp.props("onAddFriend")).toBe(onAddFriend);
    expect(statusComp.props("onRemoveFriend")).toBe(onRemoveFriend);
    expect(statusComp.props("onRemovePending")).toBe(onRemovePending);
  });

  it("renders the status component inside the friend component slot", () => {
    const wrapper = factory();
    
    const container = wrapper.find('[data-testid="friend-wrapper"]');
    expect(container.find('[data-testid="friendship-status"]').exists()).toBe(true);
  });
});