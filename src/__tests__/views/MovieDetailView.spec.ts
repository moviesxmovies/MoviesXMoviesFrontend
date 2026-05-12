import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

// ─── Shared spy instances ─────────────────────────────────────────────────────
// These must be created before vi.mock calls so the factory closures capture them.
// Each mock module returns the SAME object every call, which is what the component
// gets when it calls usePaginatedFetch / useRouter / useToast.

const mockPush = vi.fn()
const mockToastAdd = vi.fn()
const mockFetch = vi.fn()
const mockReset = vi.fn()
const mockReviewsData = ref<{ results: any[]; next: null }>({ results: [], next: null })

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/repositories/movieRepository', () => ({
  getMovie: vi.fn(),
  getMovieReviews: vi.fn(),
}))

vi.mock('@/composables/useAPI', () => ({
  api: { get: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { slug: 'blade-runner-2049' } }),
  useRouter: () => ({ push: mockPush }),
  RouterLink: defineComponent({ props: ['to'], template: '<a><slot /></a>' }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}))

vi.mock('primevue', () => ({
  useToast: () => ({ add: mockToastAdd }),
  Accordion: defineComponent({ template: '<div><slot /></div>' }),
  AccordionPanel: defineComponent({ template: '<div><slot /></div>' }),
  AccordionHeader: defineComponent({ template: '<div><slot /></div>' }),
  AccordionContent: defineComponent({ template: '<div><slot /></div>' }),
  Skeleton: defineComponent({ template: '<div class="skeleton" />' }),
}))

vi.mock('@/components/reviewComponent.vue', () => ({
  default: defineComponent({
    props: ['review'],
    emits: ['deleted'],
    template: '<div class="review-component" :data-id="review.id" />',
  }),
}))

vi.mock('@/components/sectionAccordion.vue', () => ({
  default: defineComponent({
    props: ['icon', 'title', 'isEmpty', 'emptyIcon', 'emptyTitle', 'emptyDescription',
            'dialogOptions', 'loading', 'sentinelRef', 'defaultOpen'],
    emits: ['update:sentinelRef'],
    template: '<div class="section-accordion" :data-title="title"><slot /></div>',
  }),
}))

vi.mock('@/components/addReviewDialog.vue', () => ({
  default: defineComponent({
    props: ['visible', 'movieSlug'],
    emits: ['update:visible', 'reload'],
    template: '<div class="add-review-dialog" />',
  }),
}))

vi.mock('@/components/addToListDialog.vue', () => ({
  default: defineComponent({
    props: ['visible', 'movie'],
    emits: ['update:visible'],
    template: '<div class="add-to-list-dialog" v-if="visible" />',
  }),
}))

vi.mock('@/composables/usePaginatedFetch', () => ({
  // Always return the same shared spies so the component and tests
  // reference the exact same refs and functions.
  usePaginatedFetch: () => ({
    data: mockReviewsData,
    loading: ref(false),
    fetch: mockFetch,
    reset: mockReset,
  }),
}))

vi.mock('@/composables/useInfinitePagination', () => ({
  useInfinitePagination: () => ({ sentinelRef: ref(null) }),
}))

vi.mock('@/stores/langStore', () => ({
  useLangStore: () => ({ language: 'en' }),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getMovie, getMovieReviews } from '@/repositories/movieRepository'
import { api } from '@/composables/useAPI'
import MovieDetail from '@/views/MovieDetailView.vue'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMovie = {
  slug: 'blade-runner-2049',
  title: 'Blade Runner 2049',
  release_date: '2017-10-06',
  cover: 'https://example.com/cover.jpg',
  synopsis: 'A blade runner uncovers a secret...',
  platforms: [{ id: 1, slug: 'prime', name: 'Prime Video', image: 'prime.png' }],
  genres: [{ id: 1, slug: 'sci-fi', name: 'Sci-Fi' }],
  actors: ['https://api.example.com/people/1/'],
  directors: ['https://api.example.com/people/2/'],
}

const mockReviews = {
  results: [
    { id: 1, title: 'Masterpiece', content: 'Incredible film', is_positive: true },
    { id: 2, title: 'Too slow', content: 'Way too long', is_positive: false },
  ],
  next: null,
}

const mockActor = { id: 1, slug: 'ryan-gosling', name: 'Ryan Gosling', image: 'ryan.jpg' }
const mockDirector = { id: 2, slug: 'denis-villeneuve', name: 'Denis Villeneuve', image: 'denis.jpg' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mountComponent = () =>
  mount(MovieDetail, {
    global: { stubs: { teleport: true } },
  })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MovieDetail', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockReviewsData.value = { results: [], next: null }
    vi.mocked(getMovie).mockResolvedValue(mockMovie as any)
    vi.mocked(getMovieReviews).mockResolvedValue(mockReviews as any)
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockActor })
      .mockResolvedValueOnce({ data: mockDirector })
    window.innerWidth = 1280
  })

  // ── Initial load ──────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('shows skeletons while the movie is loading', () => {
      vi.mocked(getMovie).mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()
      expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
    })

    it('calls getMovie with the correct slug', async () => {
      mountComponent()
      await flushPromises()
      expect(getMovie).toHaveBeenCalledWith('blade-runner-2049')
    })

    it('calls fetch (paginated) after the movie is loaded', async () => {
      mountComponent()
      await flushPromises()
      // The component calls fetchReviews which delegates to usePaginatedFetch's fetch.
      expect(mockFetch).toHaveBeenCalled()
    })

    it('fetches actors and directors from the movie URLs', async () => {
      mountComponent()
      await flushPromises()
      expect(api.get).toHaveBeenCalledWith('https://api.example.com/people/1/')
      expect(api.get).toHaveBeenCalledWith('https://api.example.com/people/2/')
    })
  })

  // ── Movie data rendering ──────────────────────────────────────────────────────

  describe('movie data rendering', () => {
    it('displays the movie title', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Blade Runner 2049')
    })

    it('displays the formatted release date', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain(new Date('2017-10-06').toLocaleDateString())
    })

    it('displays the synopsis', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('A blade runner uncovers a secret...')
    })

    it('renders the cover image with correct src and alt', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const img = wrapper.find('.card-img')
      expect(img.attributes('src')).toBe('https://example.com/cover.jpg')
      expect(img.attributes('alt')).toBe('Blade Runner 2049')
    })

    it('displays the streaming platforms', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Prime Video')
    })

    it('displays the genres', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Sci-Fi')
    })

    it('does not render the platforms section when the movie has none', async () => {
      vi.mocked(getMovie).mockResolvedValue({ ...mockMovie, platforms: [] } as any)
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Prime Video')
    })

    it('does not render the genres section when the movie has none', async () => {
      vi.mocked(getMovie).mockResolvedValue({ ...mockMovie, genres: [] } as any)
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).not.toContain('Sci-Fi')
    })
  })

  // ── Add To List ──────────────────────────────────────────────────────────────

  describe('add to list section', () => {
    it('mounts AddToListDialog in the DOM', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findComponent({ name: 'AddToListDialog' }).exists()).toBe(true)
    })

    it('passes the full movie object to AddToListDialog', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const dialog = wrapper.findComponent({ name: 'AddToListDialog' })
      
      expect(dialog.props('movie')).toEqual(expect.objectContaining({
        slug: 'blade-runner-2049',
        title: 'Blade Runner 2049'
      }))
    })

    it('opens the dialog when the "add to list" button is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      const btn = wrapper.find('.btn-add-list')
      expect(btn.exists()).toBe(true)

      let dialog = wrapper.findComponent({ name: 'AddToListDialog' })
      expect(dialog.props('visible')).toBe(false)
      await btn.trigger('click')

      expect(dialog.props('visible')).toBe(true)
    })

    it('updates addToListDialogVisible when the dialog emits update:visible', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const dialog = wrapper.findComponent({ name: 'AddToListDialog' })

      await dialog.vm.$emit('update:visible', false)
      expect(dialog.props('visible')).toBe(false)
    })
  })

  // ── Reviews ───────────────────────────────────────────────────────────────────

  describe('reviews section', () => {
    it('renders one ReviewComponent per review', async () => {
      mockReviewsData.value = mockReviews
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findAll('.review-component')).toHaveLength(2)
    })

    it('passes the correct review id to each ReviewComponent', async () => {
      mockReviewsData.value = mockReviews
      const wrapper = mountComponent()
      await flushPromises()
      const reviews = wrapper.findAll('.review-component')
      expect(reviews[0].attributes('data-id')).toBe('1')
      expect(reviews[1].attributes('data-id')).toBe('2')
    })

    it('renders no ReviewComponents when there are no reviews', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.findAll('.review-component')).toHaveLength(0)
    })

    it('mounts AddReviewDialog in the DOM', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.add-review-dialog').exists()).toBe(true)
    })

    it('passes the movie slug to AddReviewDialog', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const dialog = wrapper.findComponent({ name: 'AddReviewDialog' })
      expect(dialog.props('movieSlug')).toBe('blade-runner-2049')
    })
  })

  // ── Cast ──────────────────────────────────────────────────────────────────────

  describe('cast sections', () => {
    it('renders both the actors and directors section accordions', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const titles = wrapper.findAll('.section-accordion').map(s => s.attributes('data-title'))
      expect(titles.some(t => t?.includes('movie.actors'))).toBe(true)
      expect(titles.some(t => t?.includes('movie.directors'))).toBe(true)
    })
  })

  // ── Error handling ────────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('redirects to NotFound when getMovie throws', async () => {
      vi.mocked(getMovie).mockRejectedValue({ response: { data: { message: 'Not found' } } })
      mountComponent()
      await flushPromises()
      expect(mockPush).toHaveBeenCalledWith({ name: 'NotFound' })
    })

    it('does not call api.get when the movie has no actors or directors', async () => {
      vi.mocked(getMovie).mockResolvedValue({ ...mockMovie, actors: [], directors: [] } as any)
      mountComponent()
      await flushPromises()
      expect(api.get).not.toHaveBeenCalled()
    })

    it('continues loading remaining people if one request fails', async () => {
      vi.mocked(api.get)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockDirector })
      mountComponent()
      await flushPromises()
      expect(api.get).toHaveBeenCalledTimes(2)
    })

  })

  // ── Mobile detection ──────────────────────────────────────────────────────────

  describe('mobile detection', () => {
    it('mounts correctly on a mobile viewport', () => {
      window.innerWidth = 375
      expect(mountComponent().exists()).toBe(true)
    })

    it('mounts correctly on a desktop viewport', () => {
      window.innerWidth = 1280
      expect(mountComponent().exists()).toBe(true)
    })
  })

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('removes the resize event listener on unmount', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      const wrapper = mountComponent()
      await flushPromises()
      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('calls reset and fetch on mount (immediate watcher)', async () => {
      mountComponent()
      await flushPromises()
      expect(mockReset).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})