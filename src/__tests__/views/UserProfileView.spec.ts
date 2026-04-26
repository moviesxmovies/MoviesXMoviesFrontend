import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UserProfileView from '@/views/UserProfileView.vue';
import ToastService from "primevue/toastservice";

// ── Mocks ────────────────────────────────────────────────────────────────────
const {
    mockGetSelfUserProfile,
    mockGetUserProfile,
    mockGetUserReviews,
    mockGetFriendsRequests,
    mockCompleteFriendRequest,
    mockGetUserFriends,
    mockGetSuggestedFriends,
    mockGetUserMoviesLists,
    mockToast,
    mockLogout,
    mockRefreshToken,
} = vi.hoisted(() => ({
    mockGetSelfUserProfile: vi.fn(),
    mockGetUserProfile: vi.fn(),
    mockGetUserReviews: vi.fn(),
    mockGetFriendsRequests: vi.fn(),
    mockCompleteFriendRequest: vi.fn(),
    mockGetUserFriends: vi.fn(),
    mockGetSuggestedFriends: vi.fn(),
    mockGetUserMoviesLists: vi.fn(),
    mockToast: { add: vi.fn() },
    mockLogout: vi.fn(),
    mockRefreshToken: vi.fn(),
}));

vi.mock('@/repositories/userRepository', () => ({
    getSelfUserProfile: mockGetSelfUserProfile,
    getUserProfile: mockGetUserProfile,
    getUserReviews: mockGetUserReviews,
    getFriendsRequests: mockGetFriendsRequests,
    completeFriendRequest: mockCompleteFriendRequest,
    getUserFriends: mockGetUserFriends,
    getSuggestedFriends: mockGetSuggestedFriends,
    getUserMoviesLists: mockGetUserMoviesLists,
}));
vi.mock('@/repositories/auth/authRepository', () => ({
  refreshToken: mockRefreshToken,
}));

const { mockPush, mockUseRoute } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockUseRoute: vi.fn(),
}));
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return {
        ...actual,
        useRoute: mockUseRoute,
        useRouter: () => ({ push: mockPush }),
    };
});


vi.mock('@/composables/useInfiniteScroll', () => ({
    useInfiniteScroll: () => ({ sentinelRef: { value: null } }),
}));

vi.mock('@/composables/useInfinitePagination', () => ({
    useInfinitePagination: () => ({ sentinelRef: { value: null } }),
}));

vi.mock('@/stores/notificationStore', () => ({
    useNotificationsStore: () => ({ set: vi.fn() }),
}));

vi.mock('@/stores/langStore', () => ({
    useLangStore: () => ({ language: 'en' }),
}));

vi.mock('@/stores/authStore', () => ({
    useAuthStore: () => ({ user: { user_id: 1 }, isAuthenticated: true, logout: mockLogout }),
}));
vi.mock("primevue/usetoast", () => ({
    useToast: () => mockToast,
}));

// Stub child components to keep tests focused
vi.mock('@/components/friendRequestComponent.vue', () => ({ default: { template: '<div class="friend-request-stub" />' } }));
vi.mock('@/components/reviewOnUserComponent.vue', () => ({ default: { template: '<div class="review-stub" />' } }));
vi.mock('@/components/friendWithFollow.vue', () => ({ default: { template: '<div class="friend-with-follow-stub" />' } }));
vi.mock('@/components/friendshipStatusComponent.vue', () => ({ default: { template: '<div class="friendship-status-stub" />' } }));
vi.mock('@/components/moviesListComponent.vue', () => ({ default: { template: '<div class="movies-list-stub" />' } }));
vi.mock('@/components/sectionAccordion.vue', () => ({ default: { template: '<div class="section-accordion-stub"><slot /></div>', props: ['icon', 'title', 'isEmpty', 'emptyIcon', 'emptyTitle', 'emptyDescription', 'loading', 'defaultOpen', 'panelHeight', 'sentinelRef'] } }));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const emptyPagination = { results: [], count: 0, next_last_id: null };
const mockUser: any = { id: 1, username: 'testuser', picture: 'pic.jpg', bio: 'bio', friendship: null };

const factory = (routeSlug = '') => {
    mockUseRoute.mockReturnValue({ params: { slug: routeSlug } });
    return mount(UserProfileView, {
        global: { plugins: [i18n, ToastService] },

    });
};

describe('UserProfileView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSelfUserProfile.mockResolvedValue(mockUser);
        mockGetUserProfile.mockResolvedValue(mockUser);
        mockGetUserReviews.mockResolvedValue(emptyPagination);
        mockGetFriendsRequests.mockResolvedValue(emptyPagination);
        mockGetUserFriends.mockResolvedValue(emptyPagination);
        mockGetSuggestedFriends.mockResolvedValue(emptyPagination);
        mockGetUserMoviesLists.mockResolvedValue(emptyPagination);
    });

    // ── Render ────────────────────────────────────────────────────────────────
    it('renders the page', async () => {
        const wrapper = factory();
        await flushPromises();
        expect(wrapper.find('.page').exists()).toBe(true);
    });

    it('renders sidebar', async () => {
        const wrapper = factory();
        await flushPromises();
        expect(wrapper.find('.sidebar').exists()).toBe(true);
    });

    // ── Self profile (no slug) ────────────────────────────────────────────────
    describe('self profile', () => {
        it('calls getSelfUserProfile when no slug', async () => {
            factory('');
            await flushPromises();
            expect(mockGetSelfUserProfile).toHaveBeenCalled();
            expect(mockGetUserProfile).not.toHaveBeenCalled();
        });

        it('shows edit profile button for self profile', async () => {
            const wrapper = factory('');
            await flushPromises();
            expect(wrapper.find('.btn-edit').exists()).toBe(true);
        });

        it('does not show friendship status for self profile', async () => {
            const wrapper = factory('');
            await flushPromises();
            expect(wrapper.find('.friendship-status-stub').exists()).toBe(false);
        });

        it('shows friend requests section for self profile', async () => {
            mockGetFriendsRequests.mockResolvedValue({ results: [{ id: 1, from_user: '/api/u/', to_user: '/api/v/', status: 'P' }], count: 1, next_last_id: null });
            const wrapper = factory('');
            await flushPromises();
            expect(wrapper.find('.friend-request-stub').exists()).toBe(true);
        });
    });

    // ── Other profile (with slug) ─────────────────────────────────────────────
    describe('other profile', () => {
        it('calls getUserProfile when slug is provided', async () => {
            factory('otheruser');
            await flushPromises();
            expect(mockGetUserProfile).toHaveBeenCalledWith('otheruser');
        });

        it('does not show edit profile button for other profile', async () => {
            mockGetUserProfile.mockResolvedValue({ ...mockUser, id: 999 });
            const wrapper = factory('otheruser');
            await flushPromises();
            expect(wrapper.find('.btn-edit').exists()).toBe(false);
        });

        it('shows friendship status for other profile', async () => {
            mockGetUserProfile.mockResolvedValue({ ...mockUser, id: 999 });
            const wrapper = factory('otheruser');
            await flushPromises();
            expect(wrapper.find('.friendship-status-stub').exists()).toBe(true);
        });
    });

    // ── Username display ──────────────────────────────────────────────────────
    it('displays username', async () => {
        const wrapper = factory('');
        await flushPromises();
        expect(wrapper.find('.user-name').text()).toBe('testuser');
    });

    // ── Error handling ────────────────────────────────────────────────────────
    it('redirects to NotFound when fetchUserProfile fails', async () => {
        mockGetSelfUserProfile.mockRejectedValue({ response: { data: { message: 'Not found' } } });
        factory('');
        await flushPromises();
        expect(mockPush).toHaveBeenCalledWith({ name: 'NotFound' });
    });

    // ── Data fetching ─────────────────────────────────────────────────────────
    it('fetches reviews on mount', async () => {
        factory('');
        await flushPromises();
        expect(mockGetUserReviews).toHaveBeenCalled();
    });

    it('fetches friends on mount', async () => {
        factory('');
        await flushPromises();
        expect(mockGetUserFriends).toHaveBeenCalled();
    });

    it('fetches suggested friends on mount', async () => {
        factory('');
        await flushPromises();
        expect(mockGetSuggestedFriends).toHaveBeenCalled();
    });

    it('fetches movies lists on mount', async () => {
        factory('');
        await flushPromises();
        expect(mockGetUserMoviesLists).toHaveBeenCalled();
    });

    it('fetches friend requests on mount', async () => {
        factory('');
        await flushPromises();
        expect(mockGetFriendsRequests).toHaveBeenCalled();
    });

    // ── acceptFriendRequest ───────────────────────────────────────────────────
    it('calls completeFriendRequest with true on accept', async () => {
        mockCompleteFriendRequest.mockResolvedValue({});
        mockGetFriendsRequests.mockResolvedValue({
            results: [{ id: 1, from_user: '/api/u/', to_user: '/api/v/', status: 'P' }],
            count: 1,
            next_last_id: null,
        });
        const wrapper = factory('');
        await flushPromises();
        const vm = wrapper.vm as any;
        await vm.acceptFriendRequest('testuser');
        expect(mockCompleteFriendRequest).toHaveBeenCalledWith('testuser', true);
    });

    // ── rejectFriendRequest ───────────────────────────────────────────────────
    it('calls completeFriendRequest with false on reject', async () => {
        mockCompleteFriendRequest.mockResolvedValue({});
        const wrapper = factory('');
        await flushPromises();
        const vm = wrapper.vm as any;
        await vm.rejectFriendRequest('testuser');
        expect(mockCompleteFriendRequest).toHaveBeenCalledWith('testuser', false);
    });

    // ── sendFriendRequest ─────────────────────────────────────────────────────
    it('calls completeFriendRequest with true on send', async () => {
        mockCompleteFriendRequest.mockResolvedValue({});
        const wrapper = factory('');
        await flushPromises();
        const vm = wrapper.vm as any;
        await vm.sendFriendRequest('otheruser');
        expect(mockCompleteFriendRequest).toHaveBeenCalledWith('otheruser', true);
    });

    it('throws when sendFriendRequest fails', async () => {
        mockCompleteFriendRequest.mockRejectedValue({ translatedMessage: 'Error' });
        const wrapper = factory('');
        await flushPromises();
        const vm = wrapper.vm as any;
        await expect(vm.sendFriendRequest('otheruser')).rejects.toBeTruthy();
    });

    // ── Reviews rendering ─────────────────────────────────────────────────────
    it('renders review components when reviews exist', async () => {
        mockGetUserReviews.mockResolvedValue({
            results: [{ id: 1, title: 'Review 1', movie: '/api/m/1/', user: 'u', content: 'c', is_positive: true, created_at: '2024-01-01' }],
            count: 1,
            next_last_id: null,
        });
        const wrapper = factory('');
        await flushPromises();
        expect(wrapper.find('.review-stub').exists()).toBe(true);
    });

    // ── Friends rendering ─────────────────────────────────────────────────────
    it('renders friend components when friends exist', async () => {
        mockGetUserFriends.mockResolvedValue({
            results: [mockUser],
            count: 1,
            next_last_id: null,
        });
        const wrapper = factory('');
        await flushPromises();
        expect(wrapper.find('.friend-with-follow-stub').exists()).toBe(true);
    });

    // ── Movies lists rendering ────────────────────────────────────────────────
    it('renders movie list components when lists exist', async () => {
        mockGetUserMoviesLists.mockResolvedValue({
            results: [{ id: 1, name: 'List 1', slug: 'list-1', description: '', privacity: 'P', user: 'u', movies: [], created_at: '', updated_at: '' }],
            count: 1,
            next_last_id: null,
        });
        const wrapper = factory('');
        await flushPromises();
        expect(wrapper.find('.movies-list-stub').exists()).toBe(true);
    });

    // ── Logout on mobile ─────────────────────────────────────────────
    describe('logout on mobile', () => {
        it('shows logout button on mobile for self profile', async () => {
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
            const wrapper = factory('');
            await flushPromises();
            expect(wrapper.find('.btn-logout').exists()).toBe(true);
        });

        it('does not show logout button on desktop for self profile', async () => {
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
            const wrapper = factory('');
            await flushPromises();
            expect(wrapper.find('.btn-logout').exists()).toBe(false);
        });

        it('does not show logout button on mobile for other profile', async () => {
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
            mockGetUserProfile.mockResolvedValue({ ...mockUser, id: 999 });
            const wrapper = factory('otheruser');
            await flushPromises();
            expect(wrapper.find('.btn-logout').exists()).toBe(false);
        });

        it('calls logout and redirects on click', async () => {
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
            const wrapper = factory('');
            await flushPromises();
            await wrapper.find('.btn-logout').trigger('click');
            expect(mockLogout).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith({ name: 'welcome' });
        });
    });
    // ── emailChanged ──────────────────────────────────────────────────────────
    describe('emailChanged', () => {
        it('calls refreshToken when emailChanged is triggered', async () => {
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            await vm.emailChanged();
            expect(mockRefreshToken).toHaveBeenCalled();
        });

        it('redirects to /verify-email after emailChanged', async () => {
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            await vm.emailChanged();
            expect(mockPush).toHaveBeenCalledWith('/verify-email');
        });
    });
});