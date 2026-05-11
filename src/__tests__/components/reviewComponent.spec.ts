import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// ─── Hoisted spies ────────────────────────────────────────────────────────────

const {
  mockPush,
  mockGoToMovie,
  mockDeleteReview,
  mockToastAdd,
  mockIsAuthenticated,
  mockAuthUser,
  mockApiGet,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockPush: vi.fn(),
    mockGoToMovie: vi.fn(),
    mockDeleteReview: vi.fn(),
    mockToastAdd: vi.fn(),
    mockIsAuthenticated: ref(false),
    mockAuthUser: ref<{ user_id: number } | null>(null),
    mockApiGet: vi.fn(),
  }
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/composables/useAPI', () => ({
  api: { get: mockApiGet },
}))

vi.mock('@/repositories/movieRepository', () => ({
  deleteReview: mockDeleteReview,
}))

vi.mock('@/utils/goTo', () => ({
  goToMovie: mockGoToMovie,
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    get isAuthenticated() { return mockIsAuthenticated.value },
    get user() { return mockAuthUser.value },
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}))

vi.mock('vue-router', () => ({
  RouterLink: defineComponent({ props: ['to'], template: '<a :href="to"><slot /></a>' }),
}))


vi.mock('primevue', () => ({
  Dialog: defineComponent({
    props: ['visible', 'modal', 'draggable', 'dismissableMask', 'style', 'pt'],
    emits: ['update:visible'],
    template: `
      <div v-if="visible" class="p-dialog">
        <slot name="header" />
        <slot />
        <slot name="footer" />
      </div>
    `,
  }),
  Skeleton: defineComponent({ template: '<div class="skeleton" />' }),
}))

vi.mock('@/components/reactionsComponent.vue', () => ({
  default: defineComponent({
    props: ['reviewId', 'type'],
    template: '<div class="reactions-component" />',
  }),
}))

vi.mock('@/components/editReviewDialog.vue', () => ({
  default: defineComponent({
    props: ['reviewId', 'visible'],
    emits: ['update:visible', 'reload'],
    template: '<div class="edit-review-dialog" />',
  }),
}))

vi.mock("@/stores/langStore", () => ({
  useLangStore: () => ({
    language: "en"
  }),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import ReviewComponent from '@/components/reviewComponent.vue'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockReview = {
  id: 42,
  title: 'Masterpiece',
  content: 'An incredible film.',
  is_positive: true,
  created_at: '2024-03-15T10:00:00Z',
  movie: 'https://api.example.com/movies/blade-runner-2049/',
  user: 'https://api.example.com/users/1/',
}

const mockMovie = {
  slug: 'blade-runner-2049',
  title: 'Blade Runner 2049',
  cover: 'https://example.com/cover.jpg',
}

const mockUser = {
  id: 1,
  username: 'johndoe',
  picture: 'https://example.com/avatar.jpg',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mountComponent = (reviewOverrides = {}) =>
  mount(ReviewComponent, {
    props: { review: { ...mockReview, ...reviewOverrides } },
    global: { stubs: { teleport: true } },
    attachTo: document.body,
  })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ReviewComponent — additional tests', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated.value = false
    mockAuthUser.value = null
    mockDeleteReview.mockResolvedValue(undefined)
    mockApiGet
      .mockResolvedValueOnce({ data: mockMovie })
      .mockResolvedValueOnce({ data: mockUser })
  })

  // ── Markdown rendering ────────────────────────────────────────────────────────

  describe('markdown rendering', () => {
    it('renders bold markdown as <strong> in the content', async () => {
      const wrapper = mountComponent({ content: '**bold text**' })
      await flushPromises()
      expect(wrapper.find('.review-content strong').exists()).toBe(true)
      expect(wrapper.find('.review-content strong').text()).toBe('bold text')
    })

    it('renders italic markdown as <em> in the content', async () => {
      const wrapper = mountComponent({ content: '_italic text_' })
      await flushPromises()
      expect(wrapper.find('.review-content em').exists()).toBe(true)
      expect(wrapper.find('.review-content em').text()).toBe('italic text')
    })

    it('renders inline code markdown as <code> in the content', async () => {
      const wrapper = mountComponent({ content: 'use `code` here' })
      await flushPromises()
      expect(wrapper.find('.review-content code').exists()).toBe(true)
      expect(wrapper.find('.review-content code').text()).toBe('code')
    })

    it('strips dangerous XSS script tags via DOMPurify', async () => {
      const wrapper = mountComponent({ content: '<script>alert("xss")<\/script>Safe text' })
      await flushPromises()
      expect(wrapper.find('.review-content').html()).not.toContain('<script>')
      expect(wrapper.find('.review-content').text()).toContain('Safe text')
    })

    it('strips dangerous onerror attributes via DOMPurify', async () => {
      const wrapper = mountComponent({ content: '<img src="x" onerror="alert(1)">' })
      await flushPromises()
      expect(wrapper.find('.review-content').html()).not.toContain('onerror')
    })

    it('renders heading markdown as the appropriate heading element', async () => {
      const wrapper = mountComponent({ content: '## Section title' })
      await flushPromises()
      expect(wrapper.find('.review-content h2').exists()).toBe(true)
      expect(wrapper.find('.review-content h2').text()).toBe('Section title')
    })

    it('renders unordered list markdown as a <ul>', async () => {
      const wrapper = mountComponent({ content: '- item one\n- item two' })
      await flushPromises()
      expect(wrapper.find('.review-content ul').exists()).toBe(true)
      expect(wrapper.findAll('.review-content li')).toHaveLength(2)
    })
  })

  // ── Expand / collapse ─────────────────────────────────────────────────────────

  describe('expand / collapse long content', () => {
    const longContent = 'Line.\n'.repeat(20)

    it('does not render the expand button for short content', async () => {
      const wrapper = mountComponent({ content: 'Short.' })
      await flushPromises()
      expect(wrapper.find('.expand-btn').exists()).toBe(false)
    })

    it('shows the expand button when content overflows the threshold', async () => {
      const wrapper = mountComponent({ content: longContent })
      await flushPromises()

      // Simulate a tall scrollHeight so the component detects long content
      const contentEl = wrapper.find('.review-content').element as HTMLElement
      Object.defineProperty(contentEl, 'scrollHeight', { value: 200, configurable: true })

      // Trigger the watcher (loading → false) side-effect manually
      // by forcing a DOM check; since jsdom always reports scrollHeight=0,
      // we test the expand-btn via the isLongContent path through a direct
      // component internal manipulation.
      const vm = wrapper.vm as any
      vm.isLongContent = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.expand-btn').exists()).toBe(true)
    })

    it('toggles the expanded class on the wrapper when expand button is clicked', async () => {
      const wrapper = mountComponent({ content: longContent })
      await flushPromises()

      const vm = wrapper.vm as any
      vm.isLongContent = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.review-content-wrapper').classes()).not.toContain('expanded')
      await wrapper.find('.expand-btn').trigger('click')
      expect(wrapper.find('.review-content-wrapper').classes()).toContain('expanded')
    })

    it('shows "common.seeMore" label when content is collapsed', async () => {
      const wrapper = mountComponent({ content: longContent })
      await flushPromises()

      const vm = wrapper.vm as any
      vm.isLongContent = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.expand-btn').text()).toBe('common.seeMore')
    })

    it('shows "common.seeLess" label after the content is expanded', async () => {
      const wrapper = mountComponent({ content: longContent })
      await flushPromises()

      const vm = wrapper.vm as any
      vm.isLongContent = true
      await wrapper.vm.$nextTick()

      await wrapper.find('.expand-btn').trigger('click')
      expect(wrapper.find('.expand-btn').text()).toBe('common.seeLess')
    })

    it('collapses back when the expand button is clicked a second time', async () => {
      const wrapper = mountComponent({ content: longContent })
      await flushPromises()

      const vm = wrapper.vm as any
      vm.isLongContent = true
      await wrapper.vm.$nextTick()

      await wrapper.find('.expand-btn').trigger('click')
      await wrapper.find('.expand-btn').trigger('click')
      expect(wrapper.find('.review-content-wrapper').classes()).not.toContain('expanded')
    })
  })

  // ── EditReviewDialog reload event ─────────────────────────────────────────────

  describe('EditReviewDialog reload event', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 1 }
    })

    it('emits "reload" when EditReviewDialog emits reload', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      wrapper.findComponent({ name: 'EditReviewDialog' }).vm.$emit('reload')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reload')).toHaveLength(1)
    })

    it('closes the edit dialog when EditReviewDialog emits update:visible=false', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      // Open the dialog first
      await wrapper.find('.action-btn--edit').trigger('click')
      expect(wrapper.findComponent({ name: 'EditReviewDialog' }).props('visible')).toBe(true)

      // Simulate the dialog closing itself
      wrapper.findComponent({ name: 'EditReviewDialog' }).vm.$emit('update:visible', false)
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent({ name: 'EditReviewDialog' }).props('visible')).toBe(false)
    })

    it('passes the correct reviewId to EditReviewDialog', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findComponent({ name: 'EditReviewDialog' }).props('reviewId')).toBe(42)
    })
  })

  // ── ReactionsComponent ────────────────────────────────────────────────────────

  describe('ReactionsComponent', () => {
    it('passes type="review" to ReactionsComponent', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findComponent({ name: 'ReactionsComponent' }).props('type')).toBe('review')
    })

    it('does not render ReactionsComponent while loading', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()
      expect(wrapper.findComponent({ name: 'ReactionsComponent' }).exists()).toBe(false)
    })

    it('renders ReactionsComponent after data loads', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findComponent({ name: 'ReactionsComponent' }).exists()).toBe(true)
    })
  })

  // ── User avatar visibility ────────────────────────────────────────────────────
  // The template uses v-if="user". fetchUserData catches errors and leaves the
  // user ref as undefined, so a failed fetch hides the link.
  // Each nested describe has its own beforeEach so it fully owns mockApiGet
  // without interference from the outer beforeEach.

  describe('user avatar visibility', () => {

    describe('when both fetches succeed', () => {
      beforeEach(() => {
        vi.clearAllMocks()
        mockIsAuthenticated.value = false
        mockAuthUser.value = null
        mockApiGet
          .mockResolvedValueOnce({ data: mockMovie })
          .mockResolvedValueOnce({ data: mockUser })
      })

      it('renders the user avatar link with the correct href', async () => {
        const wrapper = mountComponent()
        await flushPromises()
        const link = wrapper.find('.user-avatar-link')
        expect(link.exists()).toBe(true)
        expect(link.attributes('href')).toBe('/users/johndoe')
      })
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles a review with an empty title gracefully', async () => {
      const wrapper = mountComponent({ title: '' })
      await flushPromises()
      expect(wrapper.find('.review-title').text()).toBe('')
    })

    it('handles a review with an empty content gracefully', async () => {
      const wrapper = mountComponent({ content: '' })
      await flushPromises()
      expect(wrapper.find('.review-content').text()).toBe('')
    })

    it('renders the cover image with the correct src when movie fetch succeeds', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const cover = wrapper.find('.movie-cover')
      expect(cover.exists()).toBe(true)
      expect(cover.attributes('src')).toBe('https://example.com/cover.jpg')
    })

    it('passes undefined to goToMovie when movie fetch fails', async () => {
      // Full control over mockApiGet: clear the outer beforeEach queued values
      // and re-queue with a rejected movie fetch.
      mockApiGet
        .mockReset()
        .mockRejectedValueOnce(new Error('Movie not found'))
        .mockResolvedValueOnce({ data: mockUser })
      const wrapper = mountComponent()
      await flushPromises()
      const cover = wrapper.find('.movie-cover')
      expect(cover.exists()).toBe(true)
      // movie is null → cover src is undefined
      expect(cover.attributes('src')).toBeUndefined()
      await cover.trigger('click')
      expect(mockGoToMovie).toHaveBeenCalledWith(undefined)
    })

    it('does not show the confirm delete dialog before the delete button is clicked', async () => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 1 }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.p-dialog').exists()).toBe(false)
    })

    it('does not emit "deleted" when cancel is clicked instead of confirm', async () => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 1 }
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      await wrapper.find('.btn-cancel').trigger('click')
      await flushPromises()
      expect(mockDeleteReview).not.toHaveBeenCalled()
      expect(wrapper.emitted('deleted')).toBeUndefined()
    })

    it('formats the date using toLocaleDateString', async () => {
      const dateString = '2025-07-04T12:00:00Z'
      const wrapper = mountComponent({ created_at: dateString })
      await flushPromises()
      expect(wrapper.find('.review-date').text()).toBe(
        new Date(dateString).toLocaleDateString()
      )
    })

    it('renders ReactionsComponent with the updated reviewId when prop changes', async () => {
      const wrapper = mountComponent({ id: 99 })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'ReactionsComponent' }).props('reviewId')).toBe(99)
    })
  })
})