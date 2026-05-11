import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import FriendshipStatusComponent from '@/components/friendshipStatusComponent.vue';
import type { User } from '@/types';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      components: {
        friendWithFollow: {
          status: {
            self: 'You',
            friend: 'Friends',
            pending: 'Pending',
            failed: 'Failed',
            add: 'Add Friend',
          },
        },
      },
    },
  },
});

const baseUser: User = {
  id: 1,
  username: 'testuser',
  picture: 'https://example.com/pic.jpg',
  bio: 'bio',
  friendship: { is_friend: false, status: 'N' },
};

describe('FriendshipStatusComponent (Props Version)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (propsOverride = {}) => {
    return mount(FriendshipStatusComponent, {
      props: {
        user: baseUser,
        ...propsOverride,
      },
      global: {
        plugins: [i18n],
      },
    });
  };

  describe('States rendering', () => {
    it('shows status-self div when friendship is null', () => {
      const wrapper = mountComponent({ 
        user: { ...baseUser, friendship: null as any } 
      });
      expect(wrapper.find('.status-self').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(false); // No hay acción para uno mismo
    });

    it('shows the "Friends" button when they are already friends', () => {
      const wrapper = mountComponent({ 
        user: { ...baseUser, friendship: { is_friend: true, status: 'A' } } 
      });
      expect(wrapper.find('button.status-friend').exists()).toBe(true);
    });

    it('shows the "Pending" button when the status is "P"', () => {
      const wrapper = mountComponent({ 
        user: { ...baseUser, friendship: { is_friend: false, status: 'P' } } 
      });
      expect(wrapper.find('button.status-pending').exists()).toBe(true);
    });
  });

  describe('Actions (Callbacks)', () => {
    it('calls onAddFriend when the state is initial', async () => {
      const onAddFriend = vi.fn().mockResolvedValue(undefined);
      const wrapper = mountComponent({ onAddFriend });
      
      await wrapper.find('button').trigger('click');
      
      expect(onAddFriend).toHaveBeenCalledWith('testuser');
      await flushPromises();
      expect(wrapper.find('.status-pending').exists()).toBe(true);
    });

    it('calls onRemoveFriend when they are already friends', async () => {
      const onRemoveFriend = vi.fn().mockResolvedValue(undefined);
      const user = { ...baseUser, friendship: { is_friend: true, status: 'A' } };
      const wrapper = mountComponent({ user, onRemoveFriend });
      
      await wrapper.find('button').trigger('click');
      
      expect(onRemoveFriend).toHaveBeenCalledWith('testuser');
    });

    it('calls onRemovePending when the request is pending', async () => {
      const onRemovePending = vi.fn().mockResolvedValue(undefined);
      const user = { ...baseUser, friendship: { is_friend: false, status: 'P' } };
      const wrapper = mountComponent({ user, onRemovePending });
      
      await wrapper.find('button').trigger('click');
      
      expect(onRemovePending).toHaveBeenCalledWith('testuser');
    });
  });

  describe('Error Handling', () => {
    it('changes to failed state if the promise rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onAddFriend = vi.fn().mockRejectedValue(new Error('API Error'));
      const wrapper = mountComponent({ onAddFriend });
      
      await wrapper.find('button').trigger('click');
      await flushPromises();
      
      expect(wrapper.find('.status-failed').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });
});