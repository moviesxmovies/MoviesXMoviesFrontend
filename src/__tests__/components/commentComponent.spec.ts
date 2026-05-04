import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/composables/useAPI', () => ({
    api: { get: vi.fn() },
}));

vi.mock('@/repositories/reviewRepository', () => ({
    getCommentReplies: vi.fn(),
}));

vi.mock('@/composables/useDate', () => ({
    useDate: () => ({ formatRelativeTime: (d: string) => `relative(${d})` }),
}));

vi.mock('primevue', () => ({
    Skeleton: defineComponent({ template: '<div class="skeleton" />' }),
}));

vi.mock('./reactionsComponent.vue', () => ({
    default: defineComponent({ template: '<div class="reactions" />' }),
}));

// vue-i18n global $t mock is applied via global plugin below

// ── Helpers ───────────────────────────────────────────────────────────────────

import { api } from '@/composables/useAPI';
import { getCommentReplies } from '@/repositories/reviewRepository';
import CommentComponent from '@/components/commentComponent.vue';

const mockUser = { username: 'alice', picture: 'https://example.com/alice.png' };

const makeComment = (overrides = {}): any => ({
    id: 1,
    user: '/api/users/1/',
    content: 'Hello world',
    created_at: '2024-01-01T00:00:00Z',
    has_replies: false,
    ...overrides,
});

const makePagination = (results: any[], next_last_id: number | null = null) => ({
    results,
    next_last_id,
});

const globalConfig = {
    global: {
        mocks: { $t: (key: string) => key },
        stubs: {
            CommentComponent: true, 
            ReactionsComponent: true,
            Skeleton: true,
        },
    },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('commentComponent.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Skeleton state ────────────────────────────────────────────────────────

    describe('loading skeleton', () => {
        it('renders skeleton when user is not yet loaded', async () => {
            // api.get never resolves during this test
            (api.get as any).mockReturnValue(new Promise(() => {}));

            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment(), reviewId: 42 },
                ...globalConfig,
            });

            expect(wrapper.find('[data-testid="comment-skeleton"]').exists() ||
                   wrapper.findAll('.skeleton').length).toBeTruthy();
            expect(wrapper.find('.comment-username').exists()).toBe(false);
        });
    });

    // ── Content state ─────────────────────────────────────────────────────────

    describe('loaded content', () => {
        beforeEach(() => {
            (api.get as any).mockResolvedValue({ data: mockUser });
        });

        it('renders username and content after user loads', async () => {
            const comment = makeComment({ content: 'Test content' });
            const wrapper = mount(CommentComponent, {
                props: { comment, reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            expect(wrapper.find('.comment-username').text()).toBe('alice');
            expect(wrapper.find('.comment-content').text()).toBe('Test content');
        });

        it('renders formatted relative date', async () => {
            const comment = makeComment({ created_at: '2024-06-01T12:00:00Z' });
            const wrapper = mount(CommentComponent, {
                props: { comment, reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            expect(wrapper.find('.comment-date').text()).toBe('relative(2024-06-01T12:00:00Z)');
        });

        it('renders user avatar with correct src and alt', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment(), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            const img = wrapper.find('.comment-avatar');
            expect(img.attributes('src')).toBe(mockUser.picture);
            expect(img.attributes('alt')).toBe(mockUser.username);
        });

        it('does not show toggle-replies button when has_replies is false', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: false }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            expect(wrapper.find('.toggle-replies-btn').exists()).toBe(false);
        });

        it('shows toggle-replies button when has_replies is true', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            expect(wrapper.find('.toggle-replies-btn').exists()).toBe(true);
        });
    });

    // ── Reply emit ────────────────────────────────────────────────────────────

    describe('reply button', () => {
        it('emits reply event with comment and username on click', async () => {
            (api.get as any).mockResolvedValue({ data: mockUser });
            const comment = makeComment();
            const wrapper = mount(CommentComponent, {
                props: { comment, reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.reply-btn').trigger('click');

            expect(wrapper.emitted('reply')).toBeTruthy();
            expect(wrapper.emitted('reply')![0]).toEqual([comment, mockUser.username]);
        });
    });

    // ── Toggle replies ────────────────────────────────────────────────────────

    describe('toggle replies', () => {
        beforeEach(() => {
            (api.get as any).mockResolvedValue({ data: mockUser });
            (getCommentReplies as any).mockResolvedValue(
                makePagination([makeComment({ id: 10, content: 'Reply 1' })]),
            );
        });

        it('calls getCommentReplies and shows replies on toggle open', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();

            expect(getCommentReplies).toHaveBeenCalledWith(42, 1, undefined);
            expect(wrapper.find('.replies').exists()).toBe(true);
        });

        it('hides replies when toggled closed', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            // open
            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();
            expect(wrapper.find('.replies').exists()).toBe(true);

            // close
            await wrapper.find('.toggle-replies-btn').trigger('click');
            expect(wrapper.find('.replies').exists()).toBe(false);
        });

        it('shows load-more button when next_last_id is set', async () => {
            (getCommentReplies as any).mockResolvedValue(
                makePagination([makeComment({ id: 10 })], 10),
            );

            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.load-more-btn').exists()).toBe(true);
        });

        it('does not show load-more button when no next_last_id', async () => {
            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.load-more-btn').exists()).toBe(false);
        });

        it('appends replies on load-more click', async () => {
            const firstPage = makePagination([makeComment({ id: 10 })], 10);
            const secondPage = makePagination([makeComment({ id: 11 })], null);
            (getCommentReplies as any)
                .mockResolvedValueOnce(firstPage)
                .mockResolvedValueOnce(secondPage);

            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();

            await wrapper.find('.load-more-btn').trigger('click');
            await flushPromises();

            // Second call passes the last id from first page
            expect(getCommentReplies).toHaveBeenCalledWith(42, 1, 10);
        });
    });

    // ── forceOpenRepliesId ────────────────────────────────────────────────────

    describe('forceOpenRepliesId', () => {
        it('calls reloadReplies when forceOpenRepliesId matches comment id', async () => {
            (api.get as any).mockResolvedValue({ data: mockUser });
            (getCommentReplies as any).mockResolvedValue(makePagination([]));

            const comment = makeComment({ id: 5, has_replies: true });
            const wrapper = mount(CommentComponent, {
                props: { comment, reviewId: 42, forceOpenRepliesId: null },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.setProps({ forceOpenRepliesId: 5 });
            await flushPromises();

            expect(getCommentReplies).toHaveBeenCalled();
        });

        it('does NOT reload replies when forceOpenRepliesId does not match', async () => {
            (api.get as any).mockResolvedValue({ data: mockUser });
            (getCommentReplies as any).mockResolvedValue(makePagination([]));

            const comment = makeComment({ id: 5, has_replies: true });
            const wrapper = mount(CommentComponent, {
                props: { comment, reviewId: 42, forceOpenRepliesId: null },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.setProps({ forceOpenRepliesId: 99 });
            await flushPromises();

            expect(getCommentReplies).not.toHaveBeenCalled();
        });
    });

    // ── Error handling ────────────────────────────────────────────────────────

    describe('error handling', () => {
        it('logs error when fetchUser fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (api.get as any).mockRejectedValue(new Error('Network error'));

            mount(CommentComponent, {
                props: { comment: makeComment(), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            expect(consoleSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('logs error when getCommentReplies fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (api.get as any).mockResolvedValue({ data: mockUser });
            (getCommentReplies as any).mockRejectedValue(new Error('Reply error'));

            const wrapper = mount(CommentComponent, {
                props: { comment: makeComment({ has_replies: true }), reviewId: 42 },
                ...globalConfig,
            });
            await flushPromises();

            await wrapper.find('.toggle-replies-btn').trigger('click');
            await flushPromises();

            expect(consoleSpy).toHaveBeenCalledWith('Error fetching replies:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});