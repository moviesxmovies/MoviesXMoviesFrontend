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

const mountComponent = (user: Partial<User>, onAddFriend?: (username: string) => Promise<void>) => {
    return mount(FriendshipStatusComponent, {
        props: { user: user as User, onAddFriend },
        global: { plugins: [i18n] },
    });
};

const baseUser: User = {
    id: 1,
    username: 'testuser',
    picture: 'https://example.com/pic.jpg',
    bio: 'bio',
    friendship: { is_friend: false, status: 'N' },
};

describe('FriendshipStatusComponent', () => {
    beforeEach(() => vi.clearAllMocks());

    // ── statusConfig: no friendship ───────────────────────────────────────────
    describe('when friendship is null', () => {
        it('shows status-self div', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: null as any });
            expect(wrapper.find('.status-info.status-self').exists()).toBe(true);
        });

        it('does not show action button', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: null as any });
            expect(wrapper.find('button').exists()).toBe(false);
        });

        it('has correct aria-label', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: null as any });
            expect(wrapper.find('.status-info').attributes('aria-label')).toBe('You');
        });
    });

    // ── statusConfig: is_friend ───────────────────────────────────────────────
    describe('when is_friend is true', () => {
        it('shows status-friend div', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: true, status: 'A' } });
            expect(wrapper.find('.status-info.status-friend').exists()).toBe(true);
        });

        it('does not show action button', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: true, status: 'A' } });
            expect(wrapper.find('button').exists()).toBe(false);
        });

        it('has correct aria-label', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: true, status: 'A' } });
            expect(wrapper.find('.status-info').attributes('aria-label')).toBe('Friends');
        });
    });

    // ── statusConfig: pending ─────────────────────────────────────────────────
    describe('when status is P', () => {
        it('shows status-pending div', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: false, status: 'P' } });
            expect(wrapper.find('.status-info.status-pending').exists()).toBe(true);
        });

        it('does not show action button', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: false, status: 'P' } });
            expect(wrapper.find('button').exists()).toBe(false);
        });

        it('has correct aria-label', () => {
            const wrapper = mountComponent({ ...baseUser, friendship: { is_friend: false, status: 'P' } });
            expect(wrapper.find('.status-info').attributes('aria-label')).toBe('Pending');
        });
    });

    // ── statusConfig: add ─────────────────────────────────────────────────────
    describe('when can add friend', () => {
        it('shows action button', () => {
            const wrapper = mountComponent(baseUser);
            expect(wrapper.find('button.btn-action').exists()).toBe(true);
        });

        it('has status-add class', () => {
            const wrapper = mountComponent(baseUser);
            expect(wrapper.find('button').classes()).toContain('status-add');
        });

        it('has correct aria-label', () => {
            const wrapper = mountComponent(baseUser);
            expect(wrapper.find('button').attributes('aria-label')).toBe('Add Friend');
        });
    });

    // ── sendFriendRequest: success ────────────────────────────────────────────
    describe('sendFriendRequest success', () => {
        it('calls onAddFriend with username', async () => {
            const onAddFriend = vi.fn().mockResolvedValue(undefined);
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(onAddFriend).toHaveBeenCalledWith('testuser');
        });

        it('shows pending status after sending', async () => {
            const onAddFriend = vi.fn().mockResolvedValue(undefined);
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(wrapper.find('.status-info.status-pending').exists()).toBe(true);
        });

        it('does not show button after sending', async () => {
            const onAddFriend = vi.fn().mockResolvedValue(undefined);
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(wrapper.find('button').exists()).toBe(false);
        });
    });

    // ── sendFriendRequest: failure ────────────────────────────────────────────
    describe('sendFriendRequest failure', () => {
        it('shows failed status when onAddFriend throws', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const onAddFriend = vi.fn().mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(wrapper.find('button.status-failed').exists()).toBe(true);
            consoleSpy.mockRestore();
        });

        it('still shows button after failure so user can retry', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const onAddFriend = vi.fn().mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(wrapper.find('button').exists()).toBe(true);
            consoleSpy.mockRestore();
        });

        it('logs error on failure', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const onAddFriend = vi.fn().mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent(baseUser, onAddFriend);
            await wrapper.find('button').trigger('click');
            await flushPromises();
            expect(consoleSpy).toHaveBeenCalledWith('Error sending friend request:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    // ── no onAddFriend ────────────────────────────────────────────────────────
    it('does not throw when onAddFriend is not provided', async () => {
        const wrapper = mountComponent(baseUser);
        await expect(wrapper.find('button').trigger('click')).resolves.not.toThrow();
        await flushPromises();
    });
});