import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/composables/useInfinitePagination', () => ({
    useInfinitePagination: vi.fn(() => ({ sentinelRef: { value: null } })),
}));

vi.mock('@/repositories/reviewRepository', () => ({
    fetchComments: vi.fn(),
    postComment: vi.fn(),
    replyComment: vi.fn(),
}));

vi.mock('primevue', () => ({
    Dialog: defineComponent({
        props: ['visible', 'modal', 'draggable', 'dismissableMask', 'closable', 'style', 'pt'],
        emits: ['update:visible'],
        template: `
            <div v-if="visible" class="p-dialog">
                <div class="p-dialog-header"><slot name="header" /></div>
                <div class="p-dialog-content"><slot /></div>
            </div>`,
    }),
    Skeleton: defineComponent({ template: '<div class="skeleton" />' }),
    ProgressSpinner: defineComponent({ template: '<div class="progress-spinner" />' }),
    useToast: vi.fn(() => ({ add: vi.fn() })),
}));

// Must match the alias used inside commentsDialog.vue's own import statement
vi.mock('@/components/commentComponent.vue', () => ({
    default: defineComponent({
        name: 'CommentComponent',
        props: ['comment', 'reviewId', 'highlightTarget', 'forceOpenRepliesId'],
        emits: ['reply'],
        template: '<div class="comment-component" :data-id="comment.id"><slot /></div>',
    }),
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import { fetchComments, postComment, replyComment } from '@/repositories/reviewRepository';
import { useToast } from 'primevue';
import CommentsDialog from '@/components/commentsDialog.vue';
import CommentComponent from '@/components/commentComponent.vue';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeComment = (id: number, content = 'comment text'): any => ({
    id,
    user: `/api/users/${id}/`,
    content,
    created_at: '2024-01-01T00:00:00Z',
    has_replies: false,
});

const makePagination = (results: any[], next_last_id: number | null = null) => ({
    results,
    next_last_id,
});

const globalConfig = {
    global: {
        mocks: { $t: (key: string) => key },
        stubs: { Transition: true },
    },
};

const mountDialog = (visible = true, reviewId = 1) =>
    mount(CommentsDialog, {
        props: { visible, reviewId },
        ...globalConfig,
    });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('commentsDialog.vue', () => {
    let toastAdd: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        toastAdd = vi.fn();
        (useToast as any).mockReturnValue({ add: toastAdd });
    });

    // ── Visibility & fetch ────────────────────────────────────────────────────

    describe('visibility and data loading', () => {
        it('calls fetchComments when dialog becomes visible', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            mountDialog(true, 7);
            await flushPromises();

            expect(fetchComments).toHaveBeenCalledWith(7, undefined);
        });

        it('does not call fetchComments when initially invisible', async () => {
            mountDialog(false);
            await flushPromises();
            expect(fetchComments).not.toHaveBeenCalled();
        });

        it('calls fetchComments when visible prop changes to true', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            const wrapper = mountDialog(false);
            await wrapper.setProps({ visible: true });
            await flushPromises();

            expect(fetchComments).toHaveBeenCalledTimes(1);
        });

        it('renders one CommentComponent per comment result', async () => {
            (fetchComments as any).mockResolvedValue(
                makePagination([makeComment(1), makeComment(2), makeComment(3)]),
            );

            const wrapper = mountDialog();
            await flushPromises();

            expect(wrapper.findAllComponents(CommentComponent)).toHaveLength(3);
        });

        it('shows empty state when there are no comments', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            const wrapper = mountDialog();
            await flushPromises();

            expect(wrapper.find('.empty-state').exists()).toBe(true);
        });

        it('hides empty state when comments exist', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([makeComment(1)]));

            const wrapper = mountDialog();
            await flushPromises();

            expect(wrapper.find('.empty-state').exists()).toBe(false);
        });
    });

    // ── Posting a comment ─────────────────────────────────────────────────────

    describe('posting a top-level comment', () => {
        it('submits comment and reloads on success', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));
            (postComment as any).mockResolvedValue({ id: 99 });

            const wrapper = mountDialog();
            await flushPromises();

            const textarea = wrapper.find('.comment-input');
            await textarea.setValue('My new comment');
            await wrapper.find('.send-btn').trigger('click');
            await flushPromises();

            expect(postComment).toHaveBeenCalledWith(1, 'My new comment');
            // fetchComments is called twice: once on open, once after submit
            expect(fetchComments).toHaveBeenCalledTimes(2);
        });

        it('clears the textarea after submission', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));
            (postComment as any).mockResolvedValue({ id: 99 });

            const wrapper = mountDialog();
            await flushPromises();

            const textarea = wrapper.find('.comment-input');
            await textarea.setValue('Hello');
            await wrapper.find('.send-btn').trigger('click');
            await flushPromises();

            expect((textarea.element as HTMLTextAreaElement).value).toBe('');
        });

        it('disables send button when textarea is empty', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            const wrapper = mountDialog();
            await flushPromises();

            expect(wrapper.find('.send-btn').attributes('disabled')).toBeDefined();
        });

        it('enables send button when textarea has non-whitespace content', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            const wrapper = mountDialog();
            await flushPromises();

            await wrapper.find('.comment-input').setValue('hello');
            expect(wrapper.find('.send-btn').attributes('disabled')).toBeUndefined();
        });

        it('submits comment on Enter key (without shift)', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));
            (postComment as any).mockResolvedValue({ id: 99 });

            const wrapper = mountDialog();
            await flushPromises();

            const textarea = wrapper.find('.comment-input');
            await textarea.setValue('Enter submit');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: false });
            await flushPromises();

            expect(postComment).toHaveBeenCalledWith(1, 'Enter submit');
        });

        it('does NOT submit on Shift+Enter', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));

            const wrapper = mountDialog();
            await flushPromises();

            const textarea = wrapper.find('.comment-input');
            await textarea.setValue('Newline please');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: true });
            await flushPromises();

            expect(postComment).not.toHaveBeenCalled();
        });

        it('shows error toast when postComment fails', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([]));
            (postComment as any).mockRejectedValue({
                response: { data: { message: 'Server error' } },
            });

            const wrapper = mountDialog();
            await flushPromises();

            await wrapper.find('.comment-input').setValue('fail');
            await wrapper.find('.send-btn').trigger('click');
            await flushPromises();

            expect(toastAdd).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'error', detail: 'Server error' }),
            );
        });
    });

    // ── Replying ──────────────────────────────────────────────────────────────

    describe('replying to a comment', () => {
        it('shows replying banner when a comment sets replyingTo', async () => {
            (fetchComments as any).mockResolvedValue(
                makePagination([makeComment(1)]),
            );
            (replyComment as any).mockResolvedValue({ id: 50 });

            const wrapper = mountDialog();
            await flushPromises();

            // Simulate @reply event from CommentComponent
            const commentComp = wrapper.findComponent(CommentComponent);
            await commentComp.vm.$emit('reply', makeComment(1), 'bob');
            await flushPromises();

            expect(wrapper.find('.replying-banner').exists()).toBe(true);
            expect(wrapper.find('.replying-banner').text()).toContain('bob');
        });

        it('calls replyComment instead of postComment when replying', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([makeComment(1)]));
            (replyComment as any).mockResolvedValue({ id: 50 });

            const wrapper = mountDialog();
            await flushPromises();

            const commentComp = wrapper.findComponent(CommentComponent);
            await commentComp.vm.$emit('reply', makeComment(1), 'bob');

            await wrapper.find('.comment-input').setValue('My reply');
            await wrapper.find('.send-btn').trigger('click');
            await flushPromises();

            expect(replyComment).toHaveBeenCalledWith(1, 1, 'My reply');
            expect(postComment).not.toHaveBeenCalled();
        });

        it('clears replyingTo after submission', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([makeComment(1)]));
            (replyComment as any).mockResolvedValue({ id: 50 });

            const wrapper = mountDialog();
            await flushPromises();

            await wrapper.findComponent(CommentComponent).vm.$emit('reply', makeComment(1), 'bob');
            await wrapper.find('.comment-input').setValue('reply text');
            await wrapper.find('.send-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.replying-banner').exists()).toBe(false);
        });

        it('cancels reply when cancel button is clicked', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([makeComment(1)]));

            const wrapper = mountDialog();
            await flushPromises();

            await wrapper.findComponent(CommentComponent).vm.$emit('reply', makeComment(1), 'bob');
            await flushPromises();

            await wrapper.find('.cancel-reply-btn').trigger('click');
            expect(wrapper.find('.replying-banner').exists()).toBe(false);
        });
    });

    // ── Resetting state on close ──────────────────────────────────────────────

    describe('state reset on close', () => {
        it('resets newComment, replyingTo and highlights when dialog closes', async () => {
            (fetchComments as any).mockResolvedValue(makePagination([makeComment(1)]));

            const wrapper = mountDialog(true);
            await flushPromises();

            // Set some state
            await wrapper.find('.comment-input').setValue('draft text');
            await wrapper.findComponent(CommentComponent).vm.$emit('reply', makeComment(1), 'bob');
            await flushPromises();
            expect(wrapper.find('.replying-banner').exists()).toBe(true);

            // Close the dialog
            await wrapper.setProps({ visible: false });

            // Reopen to verify state was cleared
            (fetchComments as any).mockResolvedValue(makePagination([]));
            await wrapper.setProps({ visible: true });
            await flushPromises();

            expect((wrapper.find('.comment-input').element as HTMLTextAreaElement).value).toBe('');
            expect(wrapper.find('.replying-banner').exists()).toBe(false);
        });
    });

    // ── Fetch error ───────────────────────────────────────────────────────────

    describe('fetch error handling', () => {
        it('shows error toast when fetchComments fails', async () => {
            (fetchComments as any).mockRejectedValue({
                response: { data: { message: 'Load failed' } },
            });

            mountDialog();
            await flushPromises();

            expect(toastAdd).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'error', detail: 'Load failed' }),
            );
        });
    });
});