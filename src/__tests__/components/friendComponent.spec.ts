import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import FriendComponent from '@/components/friendComponent.vue';

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockGet, mockGetUserProfile, mockGoToUser } = vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockGetUserProfile: vi.fn(),
    mockGoToUser: vi.fn(),
}));

const mockUser = {
    username: 'testuser',
    picture: 'https://example.com/profile.jpg',
};

vi.mock('@/composables/useAPI', () => ({
    api: { get: mockGet },
}));

vi.mock('@/repositories/userRepository', () => ({
    getUserProfile: mockGetUserProfile,
}));

vi.mock('@/utils/goTo', () => ({
    goToUser: mockGoToUser,
}));

describe('FriendComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Render ────────────────────────────────────────────────────────────────
    it('renders the friend-card container', () => {
        const wrapper = mount(FriendComponent);
        expect(wrapper.find('.friend-card').exists()).toBe(true);
    });

    it('renders profile image and username when user is loaded', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        const wrapper = mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        expect(wrapper.find('img').attributes('src')).toBe(mockUser.picture);
        expect(wrapper.find('.username').text()).toBe(mockUser.username);
    });

    it('renders slot content', () => {
        const wrapper = mount(FriendComponent, {
            props: { username: 'testuser' },
            slots: { default: '<button class="slot-btn">Action</button>' },
        });
        expect(wrapper.find('.slot-btn').exists()).toBe(true);
    });

    it('exposes username via scoped slot', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        const wrapper = mount(FriendComponent, {
            props: { username: 'testuser' },
            slots: {
                default: `<template #default="{ username }">
                    <span class="slot-username">{{ username }}</span>
                </template>`,
            },
        });
        await flushPromises();
        expect(wrapper.find('.slot-username').text()).toBe(mockUser.username);
    });

    // ── fetchUserData with username ───────────────────────────────────────────
    it('calls getUserProfile when username prop is provided', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        expect(mockGetUserProfile).toHaveBeenCalledWith('testuser');
        expect(mockGet).not.toHaveBeenCalled();
    });

    it('sets user data from getUserProfile response', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        const wrapper = mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        expect(wrapper.find('.username').text()).toBe('testuser');
    });

    // ── fetchUserData with fromUser ───────────────────────────────────────────
    it('calls api.get when fromUser prop is provided', async () => {
        mockGet.mockResolvedValue({ data: mockUser });
        mount(FriendComponent, { props: { fromUser: '/api/users/testuser/' } });
        await flushPromises();

        expect(mockGet).toHaveBeenCalledWith('/api/users/testuser/');
        expect(mockGetUserProfile).not.toHaveBeenCalled();
    });

    it('sets user data from api.get response', async () => {
        mockGet.mockResolvedValue({ data: mockUser });
        const wrapper = mount(FriendComponent, { props: { fromUser: '/api/users/testuser/' } });
        await flushPromises();

        expect(wrapper.find('.username').text()).toBe('testuser');
    });

    // ── Priority: username over fromUser ──────────────────────────────────────
    it('prefers username over fromUser when both are provided', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        mount(FriendComponent, {
            props: { username: 'testuser', fromUser: '/api/users/other/' },
        });
        await flushPromises();

        expect(mockGetUserProfile).toHaveBeenCalledWith('testuser');
        expect(mockGet).not.toHaveBeenCalled();
    });

    // ── No props ──────────────────────────────────────────────────────────────
    it('warns and does not fetch when no props provided', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        mount(FriendComponent);
        await flushPromises();

        expect(consoleSpy).toHaveBeenCalledWith('No user identifier provided to FriendComponent');
        expect(mockGetUserProfile).not.toHaveBeenCalled();
        expect(mockGet).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    // ── Error handling ────────────────────────────────────────────────────────
    it('logs error when getUserProfile throws', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockGetUserProfile.mockRejectedValue(new Error('Network error'));
        mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error fetching user data:',
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    it('logs error when api.get throws', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockGet.mockRejectedValue(new Error('Network error'));
        mount(FriendComponent, { props: { fromUser: '/api/users/testuser/' } });
        await flushPromises();

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error fetching user data:',
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    it('user remains null when fetch fails', async () => {
        mockGetUserProfile.mockRejectedValue(new Error('Network error'));
        const wrapper = mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        expect(wrapper.find('.username').text()).toBe('');
    });

    // ── Navigation ────────────────────────────────────────────────────────────
    it('calls goToUser when image is clicked', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        const wrapper = mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        await wrapper.find('img').trigger('click');
        expect(mockGoToUser).toHaveBeenCalledWith(mockUser.username);
    });

    it('calls goToUser when username is clicked', async () => {
        mockGetUserProfile.mockResolvedValue(mockUser);
        const wrapper = mount(FriendComponent, { props: { username: 'testuser' } });
        await flushPromises();

        await wrapper.find('.username').trigger('click');
        expect(mockGoToUser).toHaveBeenCalledWith(mockUser.username);
    });
});