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
    mockRemoveFriend,
    mockToast,
    mockConfirm,
    mockLogout,
    mockRefreshToken,
    mockProfileStoreRefresh,
    mockNotificationSet,
} = vi.hoisted(() => ({
    mockGetSelfUserProfile: vi.fn(),
    mockGetUserProfile: vi.fn(),
    mockGetUserReviews: vi.fn(),
    mockGetFriendsRequests: vi.fn(),
    mockCompleteFriendRequest: vi.fn(),
    mockGetUserFriends: vi.fn(),
    mockGetSuggestedFriends: vi.fn(),
    mockGetUserMoviesLists: vi.fn(),
    mockRemoveFriend: vi.fn(),
    mockToast: { add: vi.fn() },
    mockConfirm: { require: vi.fn() },
    mockLogout: vi.fn(),
    mockRefreshToken: vi.fn(),
    mockProfileStoreRefresh: vi.fn(),
    mockNotificationSet: vi.fn(),
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
    removeFriend: mockRemoveFriend,
}));

vi.mock('@/stores/profileStore', () => ({
    useProfileStore: () => ({ refresh: mockProfileStoreRefresh }),
}));

vi.mock('@/repositories/auth/authRepository', () => ({
    refreshToken: mockRefreshToken,
}));

const { mockPush, mockUseRoute } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockUseRoute: vi.fn(),
}));

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useRoute: mockUseRoute,
        useRouter: () => ({ push: mockPush }),
    };
});

vi.mock('@/composables/useInfinitePagination', () => ({
    useInfinitePagination: () => ({ sentinelRef: { value: null } }),
}));

vi.mock('@/stores/notificationStore', () => ({
    useNotificationsStore: () => ({ set: mockNotificationSet }),
}));

vi.mock('@/stores/langStore', () => ({
    useLangStore: () => ({ language: 'en' }),
}));

vi.mock('@/stores/authStore', () => ({
    useAuthStore: () => ({ user: { user_id: 1 }, isAuthenticated: true, logout: mockLogout }),
}));

vi.mock("primevue", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useToast: () => mockToast,
        useConfirm: () => mockConfirm,
    };
});

// Stubs de componentes hijos
vi.mock('@/components/friendRequestComponent.vue', () => ({ default: { template: '<div class="friend-request-stub" />' } }));
vi.mock('@/components/reviewComponent.vue', () => ({ default: { template: '<div class="review-stub" />' } }));
vi.mock('@/components/friendWithFollow.vue', () => ({ default: { template: '<div class="friend-with-follow-stub" />' } }));
vi.mock('@/components/friendshipStatusComponent.vue', () => ({ default: { template: '<div class="friendship-status-stub" />' } }));
vi.mock('@/components/moviesListComponent.vue', () => ({ default: { template: '<div class="movies-list-stub" />' } }));
vi.mock('@/components/sectionAccordion.vue', () => ({ default: { template: '<div class="section-accordion-stub"><slot /></div>', props: ['icon', 'title', 'isEmpty', 'loading'] } }));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });
const emptyPagination = { results: [], count: 0, next_last_id: null };
const mockUser = { id: 1, username: 'testuser', picture: 'pic.jpg', bio: 'bio', friendship: null };

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

    it('renders the page and sidebar', async () => {
        const wrapper = factory();
        await flushPromises();
        expect(wrapper.find('.page').exists()).toBe(true);
        expect(wrapper.find('.sidebar').exists()).toBe(true);
    });

    describe('Profile Logic (Self vs Other)', () => {
        it('calls getSelfUserProfile when no slug is present', async () => {
            factory('');
            await flushPromises();
            expect(mockGetSelfUserProfile).toHaveBeenCalled();
        });

        it('sets isSelfProfile to true when slug matches auth user id', async () => {
            mockGetUserProfile.mockResolvedValue({ ...mockUser, id: 1 });
            const wrapper = factory('testuser');
            await flushPromises();
            const vm = wrapper.vm as any;
            expect(vm.isSelfProfile).toBe(true);
        });

        it('shows edit profile button only for self profile', async () => {
            const wrapper = factory(''); // self
            await flushPromises();
            expect(wrapper.find('.btn-edit').exists()).toBe(true);
        });
    });

    describe('Friendship Actions', () => {
        it('acceptFriendRequest calls repository and updates notifications', async () => {
            mockCompleteFriendRequest.mockResolvedValue({});
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            
            await vm.acceptFriendRequest('otheruser');
            
            expect(mockCompleteFriendRequest).toHaveBeenCalledWith('otheruser', true); 
            expect(mockNotificationSet).toHaveBeenCalled(); 
        });

        it('handleFriendRequest updates the user friendship status locally', async () => {
            mockCompleteFriendRequest.mockResolvedValue({});
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            const targetUser = { username: 'target', friendship: null };

            // Caso: Aceptar (enviar solicitud)
            await vm.handleFriendRequest(targetUser, true);
            expect(targetUser.friendship.status).toBe('P');
            
            // Caso: Declinar
            await vm.handleFriendRequest(targetUser, false);
            expect(targetUser.friendship.status).toBe(null); 
        });

        it('removeFriendRequest calls removeFriend and resets friendship', async () => {
            mockRemoveFriend.mockResolvedValue({});
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            const targetUser = { username: 'target', friendship: { is_friend: true } };

            await vm.removeFriendRequest(targetUser);
            expect(mockRemoveFriend).toHaveBeenCalledWith('target');
            expect(targetUser.friendship.status).toBe(null);
        });

        it('removeFrienshipModal triggers confirmation dialog', async () => {
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            
            vm.removeFrienshipModal(mockUser, true);
            expect(mockConfirm.require).toHaveBeenCalled(); 
        });
    });

    describe('Reactivity and Lifecycle', () => {
        it('logs out and redirects to welcome', async () => {
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500); // Mobile
            const wrapper = factory('');
            await flushPromises();
            
            await wrapper.find('.btn-logout').trigger('click');
            expect(mockLogout).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith({ name: 'welcome' });
        });

        it('onUpdated updates user and refreshes tokens', async () => {
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            const updatedUser = { ...mockUser, username: 'updated' };

            await vm.onUpdated(updatedUser);
            expect(vm.user.username).toBe('updated'); 
            expect(mockRefreshToken).toHaveBeenCalled(); 
            expect(mockProfileStoreRefresh).toHaveBeenCalled(); 
        });

        it('updates isMobile when window is resized', async () => {
            const wrapper = factory('');
            await flushPromises();
            const vm = wrapper.vm as any;
            
            vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(400);
            window.dispatchEvent(new Event('resize'));
            expect(vm.isMobile).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('redirects to NotFound if profile fetching fails', async () => {
            mockGetSelfUserProfile.mockRejectedValue({ response: { data: { message: 'Error' } } });
            factory('');
            await flushPromises();
            expect(mockPush).toHaveBeenCalledWith({ name: "NotFound" });
        });

        it('shows error toast when friend request fails', async () => {
            mockCompleteFriendRequest.mockRejectedValue({ translatedMessage: 'Error msg' });
            const wrapper = factory('');
            await flushPromises();
            
            await (wrapper.vm as any).handleFriendRequest(mockUser, true);
            expect(mockToast.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'error', detail: 'Error msg' })
            );
        });
    });
});