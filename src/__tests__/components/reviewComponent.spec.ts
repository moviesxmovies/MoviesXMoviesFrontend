import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// ─── Hoisted spies ────────────────────────────────────────────────────────────
// vi.hoisted() runs BEFORE vi.mock() factories, so these are safe to reference
// inside any factory closure below.

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
  })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ReviewComponent', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated.value = false
    mockAuthUser.value = null
    mockDeleteReview.mockResolvedValue(undefined)
    mockApiGet
      .mockResolvedValueOnce({ data: mockMovie })
      .mockResolvedValueOnce({ data: mockUser })
  })

  // ── Loading state ─────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows skeletons before data is fetched', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()
      expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
    })

    it('hides skeletons after data loads', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findAll('.skeleton')).toHaveLength(0)
    })
  })

  // ── Data fetching ─────────────────────────────────────────────────────────────

  describe('data fetching', () => {
    it('fetches movie data from the review.movie URL on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockApiGet).toHaveBeenCalledWith(mockReview.movie)
    })

    it('fetches user data from the review.user URL on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockApiGet).toHaveBeenCalledWith(mockReview.user)
    })

    it('renders content even if the movie fetch fails', async () => {
      mockApiGet
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockUser })
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.review-title').text()).toBe('Masterpiece')
    })

    it('renders content even if the user fetch fails', async () => {
      mockApiGet
        .mockResolvedValueOnce({ data: mockMovie })
        .mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.review-title').text()).toBe('Masterpiece')
    })
  })

  // ── Content rendering ─────────────────────────────────────────────────────────

  describe('content rendering', () => {
    it('displays the review title', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.review-title').text()).toBe('Masterpiece')
    })

    it('displays the review content', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.review-content').text()).toBe('An incredible film.')
    })

    it('displays the movie title', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.movie-name').text()).toBe('Blade Runner 2049')
    })

    it('renders the movie cover with correct src and alt', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const img = wrapper.find('.movie-cover')
      expect(img.attributes('src')).toBe('https://example.com/cover.jpg')
      expect(img.attributes('alt')).toBe('Blade Runner 2049')
    })

    it('displays the formatted review date', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const expected = new Date('2024-03-15T10:00:00Z').toLocaleDateString()
      expect(wrapper.find('.review-date').text()).toBe(expected)
    })

    it('renders the user avatar with the correct src', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.user-avatar').attributes('src')).toBe('https://example.com/avatar.jpg')
    })

    it('links the user avatar to the correct profile URL', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.user-avatar-link').attributes('href')).toBe('/users/johndoe')
    })

    it('passes the correct reviewId to ReactionsComponent', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findComponent({ name: 'ReactionsComponent' }).props('reviewId')).toBe(42)
    })
  })

  // ── Sentiment badge ───────────────────────────────────────────────────────────

  describe('sentiment badge', () => {
    it('applies badge-positive class for a positive review', async () => {
      const wrapper = mountComponent({ is_positive: true })
      await flushPromises()
      expect(wrapper.find('.badge').classes()).toContain('badge-positive')
    })

    it('applies badge-negative class for a negative review', async () => {
      const wrapper = mountComponent({ is_positive: false })
      await flushPromises()
      expect(wrapper.find('.badge').classes()).toContain('badge-negative')
    })

    it('renders a thumbs-up icon for a positive review', async () => {
      const wrapper = mountComponent({ is_positive: true })
      await flushPromises()
      expect(wrapper.find('.pi-thumbs-up').exists()).toBe(true)
    })

    it('renders a thumbs-down icon for a negative review', async () => {
      const wrapper = mountComponent({ is_positive: false })
      await flushPromises()
      expect(wrapper.find('.pi-thumbs-down').exists()).toBe(true)
    })
  })

  // ── Navigation ────────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('calls goToMovie with the movie slug when the cover is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.movie-cover').trigger('click')
      expect(mockGoToMovie).toHaveBeenCalledWith('blade-runner-2049')
    })

    it('calls goToMovie with the movie slug when the movie name is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.movie-name').trigger('click')
      expect(mockGoToMovie).toHaveBeenCalledWith('blade-runner-2049')
    })
  })

  // ── Owner actions (isSelf) ────────────────────────────────────────────────────

  describe('owner actions (isSelf)', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 1 }
    })

    it('shows edit and delete buttons when the user owns the review', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.action-btn--edit').exists()).toBe(true)
      expect(wrapper.find('.action-btn--delete').exists()).toBe(true)
    })

    it('renders EditReviewDialog when the user owns the review', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.edit-review-dialog').exists()).toBe(true)
    })

    it('opens the edit dialog when the edit button is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--edit').trigger('click')
      expect(wrapper.findComponent({ name: 'EditReviewDialog' }).props('visible')).toBe(true)
    })

    it('opens the confirm delete dialog when the delete button is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      expect(wrapper.find('.p-dialog').exists()).toBe(true)
    })
  })

  // ── Non-owner view ────────────────────────────────────────────────────────────

  describe('non-owner view', () => {
    it('hides edit and delete buttons when the user does not own the review', async () => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 99 }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.action-btn--edit').exists()).toBe(false)
      expect(wrapper.find('.action-btn--delete').exists()).toBe(false)
    })

    it('hides edit and delete buttons when not authenticated', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.action-btn--edit').exists()).toBe(false)
      expect(wrapper.find('.action-btn--delete').exists()).toBe(false)
    })
  })

  // ── Delete flow ───────────────────────────────────────────────────────────────

  describe('delete flow', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = true
      mockAuthUser.value = { user_id: 1 }
    })

    it('calls deleteReview with the correct id on confirmation', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      await wrapper.find('.btn-delete').trigger('click')
      expect(mockDeleteReview).toHaveBeenCalledWith(42)
    })

    it('emits "deleted" with the review id after successful deletion', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      await wrapper.find('.btn-delete').trigger('click')
      await flushPromises()
      expect(wrapper.emitted('deleted')).toEqual([[42]])
    })

    it('closes the confirm dialog when cancel is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      expect(wrapper.find('.p-dialog').exists()).toBe(true)
      await wrapper.find('.btn-cancel').trigger('click')
      expect(wrapper.find('.p-dialog').exists()).toBe(false)
    })

    it('does not emit "deleted" if deleteReview fails', async () => {
      mockDeleteReview.mockRejectedValue(new Error('Server error'))
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.find('.action-btn--delete').trigger('click')
      await wrapper.find('.btn-delete').trigger('click')
      await flushPromises()
      expect(wrapper.emitted('deleted')).toBeUndefined()
    })
  })
})