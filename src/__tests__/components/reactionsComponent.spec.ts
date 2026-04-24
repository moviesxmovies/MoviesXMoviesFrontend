import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReactionsComponent from '@/components/reactionsComponent.vue';

// ── Mocks ────────────────────────────────────────────────────────────────────
const { mockGetReviewReactions, mockGetCommentReactions, mockPostReactionApi, mockDeleteReactionApi } = vi.hoisted(() => ({
    mockGetReviewReactions: vi.fn(),
    mockGetCommentReactions: vi.fn(),
    mockPostReactionApi: vi.fn(),
    mockDeleteReactionApi: vi.fn(),
}));

vi.mock('@/repositories/reviewRepository', () => ({
    getReviewReactions: mockGetReviewReactions,
    getCommentReactions: mockGetCommentReactions,
    postReactionApi: mockPostReactionApi,
    deleteReactionApi: mockDeleteReactionApi,
}));

const emptyReactions = { reactions: {}, your_reactions: {} };
const reactionsWithLike = {
    reactions: { '👍': 1 },
    your_reactions: {},
};
const reactionsWithYourLike = {
    reactions: { '👍': 1 },
    your_reactions: { '👍': 42 },
};

const mountComponent = (props = {}) => mount(ReactionsComponent, {
    props: { reviewId: 7, ...props },
});

describe('ReactionsComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetReviewReactions.mockResolvedValue(emptyReactions);
    });

    // ── Render ────────────────────────────────────────────────────────────────
    it('renders the reactions wrapper', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('.reactions-wrapper').exists()).toBe(true);
    });

    it('renders the add reaction button', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('.add-reaction-btn').exists()).toBe(true);
    });

    it('does not show picker by default', () => {
        const wrapper = mountComponent();
        expect(wrapper.find('.emoji-picker').exists()).toBe(false);
    });

    it('shows picker when add button is clicked', async () => {
        const wrapper = mountComponent();
        await wrapper.find('.add-reaction-btn').trigger('click');
        expect(wrapper.find('.emoji-picker').exists()).toBe(true);
    });

    it('hides picker when add button is clicked again', async () => {
        const wrapper = mountComponent();
        await wrapper.find('.add-reaction-btn').trigger('click');
        await wrapper.find('.add-reaction-btn').trigger('click');
        expect(wrapper.find('.emoji-picker').exists()).toBe(false);
    });

    // ── Fetch on mount ────────────────────────────────────────────────────────
    it('calls getReviewReactions on mount', async () => {
        mountComponent();
        await flushPromises();
        expect(mockGetReviewReactions).toHaveBeenCalledWith(7);
    });

    it('calls getCommentReactions when commentId is provided', async () => {
        mockGetCommentReactions.mockResolvedValue(emptyReactions);
        mountComponent({ commentId: 3 });
        await flushPromises();
        expect(mockGetCommentReactions).toHaveBeenCalledWith(7, 3);
        expect(mockGetReviewReactions).not.toHaveBeenCalled();
    });

    it('logs error when fetch fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGetReviewReactions.mockRejectedValue(new Error('Network error'));
        mountComponent();
        await flushPromises();
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching reactions:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    // ── Active reactions ──────────────────────────────────────────────────────
    it('renders active reaction pills', async () => {
        mockGetReviewReactions.mockResolvedValue(reactionsWithLike);
        const wrapper = mountComponent();
        await flushPromises();
        expect(wrapper.find('.reaction-pill').exists()).toBe(true);
        expect(wrapper.find('.reaction-emoji').text()).toBe('👍');
        expect(wrapper.find('.reaction-count').text()).toBe('1');
    });

    it('does not render pills when no reactions', async () => {
        const wrapper = mountComponent();
        await flushPromises();
        expect(wrapper.find('.reaction-pill').exists()).toBe(false);
    });

    it('marks pill as reacted when user has reacted', async () => {
        mockGetReviewReactions.mockResolvedValue(reactionsWithYourLike);
        const wrapper = mountComponent();
        await flushPromises();
        expect(wrapper.find('.reaction-pill').classes()).toContain('reacted');
    });

    it('does not mark pill as reacted when user has not reacted', async () => {
        mockGetReviewReactions.mockResolvedValue(reactionsWithLike);
        const wrapper = mountComponent();
        await flushPromises();
        expect(wrapper.find('.reaction-pill').classes()).not.toContain('reacted');
    });

    // ── sendReaction ──────────────────────────────────────────────────────────
    describe('sendReaction', () => {
        it('calls postReactionApi with correct args', async () => {
            mockPostReactionApi.mockResolvedValue({ id: 99 });
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click'); // 👍 is first
            await flushPromises();
            expect(mockPostReactionApi).toHaveBeenCalledWith(7, 'LIKE', undefined);
        });

        it('closes picker after sending', async () => {
            mockPostReactionApi.mockResolvedValue({ id: 99 });
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            await flushPromises();
            expect(wrapper.find('.emoji-picker').exists()).toBe(false);
        });

        it('optimistically increments reaction count', async () => {
            mockPostReactionApi.mockResolvedValue({ id: 99 });
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            expect(wrapper.find('.reaction-count').text()).toBe('1');
        });

        it('updates your_reactions with real id after success', async () => {
            mockPostReactionApi.mockResolvedValue({ id: 99 });
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            await flushPromises();
            expect(wrapper.find('.reaction-pill').classes()).toContain('reacted');
        });

        it('reverts optimistic update on error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockPostReactionApi.mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            await flushPromises();
            expect(wrapper.find('.reaction-pill').exists()).toBe(false);
            consoleSpy.mockRestore();
        });

        it('logs error when postReactionApi fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockPostReactionApi.mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            await flushPromises();
            expect(consoleSpy).toHaveBeenCalledWith('Error sending reaction:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('passes commentId to postReactionApi when provided', async () => {
            mockGetCommentReactions.mockResolvedValue(emptyReactions);
            mockPostReactionApi.mockResolvedValue({ id: 99 });
            const wrapper = mountComponent({ commentId: 3 });
            await flushPromises();
            await wrapper.find('.add-reaction-btn').trigger('click');
            await wrapper.find('.emoji-option').trigger('click');
            await flushPromises();
            expect(mockPostReactionApi).toHaveBeenCalledWith(7, 'LIKE', 3);
        });
    });

    // ── deleteReaction ────────────────────────────────────────────────────────
    describe('deleteReaction', () => {
        it('calls deleteReactionApi with correct args', async () => {
            mockGetReviewReactions.mockResolvedValue(reactionsWithYourLike);
            mockDeleteReactionApi.mockResolvedValue({});
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.reaction-pill').trigger('click');
            await flushPromises();
            expect(mockDeleteReactionApi).toHaveBeenCalledWith(7, 42, undefined);
        });

        it('removes reaction after delete', async () => {
            mockGetReviewReactions.mockResolvedValue(reactionsWithYourLike);
            mockDeleteReactionApi.mockResolvedValue({});
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.reaction-pill').trigger('click');
            await flushPromises();
            expect(wrapper.find('.reaction-pill').exists()).toBe(false);
        });

        it('does not call deleteReactionApi when not reacted', async () => {
            mockGetReviewReactions.mockResolvedValue(reactionsWithLike);
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.reaction-pill').trigger('click');
            await flushPromises();
            expect(mockDeleteReactionApi).not.toHaveBeenCalled();
        });

        it('logs error when deleteReactionApi fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockGetReviewReactions.mockResolvedValue(reactionsWithYourLike);
            mockDeleteReactionApi.mockRejectedValue(new Error('Network error'));
            const wrapper = mountComponent();
            await flushPromises();
            await wrapper.find('.reaction-pill').trigger('click');
            await flushPromises();
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting reaction:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('passes commentId to deleteReactionApi when provided', async () => {
            mockGetCommentReactions.mockResolvedValue(reactionsWithYourLike);
            mockDeleteReactionApi.mockResolvedValue({});
            const wrapper = mountComponent({ commentId: 3 });
            await flushPromises();
            await wrapper.find('.reaction-pill').trigger('click');
            await flushPromises();
            expect(mockDeleteReactionApi).toHaveBeenCalledWith(7, 42, 3);
        });
    });

    // ── emoji picker options ──────────────────────────────────────────────────
    it('renders all 16 emoji options in picker', async () => {
        const wrapper = mountComponent();
        await wrapper.find('.add-reaction-btn').trigger('click');
        expect(wrapper.findAll('.emoji-option')).toHaveLength(16);
    });

    it('marks emoji option as reacted in picker', async () => {
        mockGetReviewReactions.mockResolvedValue(reactionsWithYourLike);
        const wrapper = mountComponent();
        await flushPromises();
        await wrapper.find('.add-reaction-btn').trigger('click');
        const likeOption = wrapper.findAll('.emoji-option')[0];
        expect(likeOption.classes()).toContain('reacted');
    });
});