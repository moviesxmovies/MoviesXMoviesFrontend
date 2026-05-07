import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchCelebritiesView from '@/views/SearchCelebritiesView.vue'
import type { Pagination, Person } from '@/types'

// ── Hoisted (se ejecutan ANTES de los vi.mock) ────────────
const { mockPush, mockQuery } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockQuery: { value: {} as Record<string, string> },
}))

// ── Mocks ────────────────────────────────────────────────
vi.mock('primevue', () => ({
    useToast: vi.fn(() => ({ add: vi.fn() })),
    useConfirm: vi.fn(() => ({ require: vi.fn() })),
    ConfirmDialog: { template: '<div />' },
    Skeleton: { template: '<div class="skeleton" />' },
}))

vi.mock('@/repositories/personRepository', () => ({
    celebritySearching: vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
    useAuthStore: () => ({ user: { user_id: 1 } }),
}))

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>()
    return {
        ...actual,
        useRoute: () => ({
            get query() { return mockQuery.value },
            path: '/',
        }),
        useRouter: () => ({
            push: mockPush,
        }),
    }
})

import { celebritySearching } from '@/repositories/personRepository'

// ── Helpers ──────────────────────────────────────────────
const mockPagination = (results: Partial<Person>[] = [], total_pages = 1): Pagination<Person> => ({
    results: results as Person[],
    total_pages,
    current_page: 1,
    count: results.length,
})

const mockCelebrity = (overrides: Partial<Person> = {}): Person => ({
    id: 1,
    slug: 'john-doe',
    name: 'John Doe',
    image: 'https://example.com/john.jpg',
    gender: '2',
    birthday: '1980-01-15',
    deathday: null,
    biography: '',
    ...overrides,
})

const createWrapper = () =>
    mount(SearchCelebritiesView, {
        global: {
            stubs: {
                CelebrityCardComponent: true,
                PaginationComponent: true,
                Skeleton: true,
                Teleport: true,
            },
        },
    })

describe('SearchCelebritiesView', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        mockQuery.value = {}
    })

    // ── Loading state ────────────────────────────────────
    describe('loading state', () => {
        it('shows skeleton grid while loading', () => {
            vi.mocked(celebritySearching).mockImplementation(() => new Promise(() => {}))
            const wrapper = createWrapper()
            expect(wrapper.find('.celebs-grid').exists()).toBe(true)
            expect(wrapper.findAll('.skeleton-card')).toHaveLength(10)
        })

        it('shows 10 skeleton cards', () => {
            vi.mocked(celebritySearching).mockImplementation(() => new Promise(() => {}))
            const wrapper = createWrapper()
            expect(wrapper.findAll('.skeleton-card')).toHaveLength(10)
        })

        it('each skeleton card has the gender badge skeleton', () => {
            vi.mocked(celebritySearching).mockImplementation(() => new Promise(() => {}))
            const wrapper = createWrapper()
            wrapper.findAll('.skeleton-card').forEach(card => {
                expect(card.find('.skeleton-badge-gender').exists()).toBe(true)
            })
        })

        it('each skeleton card has a footer', () => {
            vi.mocked(celebritySearching).mockImplementation(() => new Promise(() => {}))
            const wrapper = createWrapper()
            wrapper.findAll('.skeleton-card').forEach(card => {
                expect(card.find('.skeleton-footer').exists()).toBe(true)
            })
        })

        it('hides skeleton after data loads', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([mockCelebrity()]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.findAll('.skeleton-card')).toHaveLength(0)
        })
    })

    // ── Empty state ──────────────────────────────────────
    describe('empty state', () => {
        it('shows empty state when no results', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.find('.state-box').exists()).toBe(true)
        })

        it('shows search icon in empty state', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.find('.empty-icon').exists()).toBe(true)
            expect(wrapper.find('.pi-search').exists()).toBe(true)
        })

        it('shows empty title and subtitle', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.find('.empty-title').exists()).toBe(true)
            expect(wrapper.find('.empty-sub').exists()).toBe(true)
        })

        it('does not show results grid in empty state', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.find('.celebs-grid').exists()).toBe(false)
        })
    })

    // ── Results state ────────────────────────────────────
    describe('results state', () => {
        it('renders one CelebrityCardComponent per result', async () => {
            const results = [mockCelebrity({ id: 1 }), mockCelebrity({ id: 2 }), mockCelebrity({ id: 3 })]
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination(results))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.findAllComponents({ name: 'CelebrityCardComponent' })).toHaveLength(3)
        })

        it('passes celebrity prop to each card', async () => {
            const celebrity = mockCelebrity()
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([celebrity]))
            const wrapper = createWrapper()
            await flushPromises()
            const card = wrapper.findComponent({ name: 'CelebrityCardComponent' })
            expect(card.props('celebrity')).toEqual(celebrity)
        })

        it('does not show empty state when results exist', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([mockCelebrity()]))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.find('.state-box').exists()).toBe(false)
        })
    })

    // ── API calls ────────────────────────────────────────
    describe('api calls', () => {
        it('calls celebritySearching with name and page from query', async () => {
            mockQuery.value = { name: 'Hanks', page: '2' }
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            createWrapper()
            await flushPromises()
            expect(celebritySearching).toHaveBeenCalledWith('Hanks', 2)
        })

        it('calls celebritySearching with empty name and page 1 by default', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            createWrapper()
            await flushPromises()
            expect(celebritySearching).toHaveBeenCalledWith('', 1)
        })

        it('resets loading to false on API error', async () => {
            vi.mocked(celebritySearching).mockRejectedValue({
                response: { data: { message: 'Server error' } },
            })
            const wrapper = createWrapper()
            await flushPromises()
            expect((wrapper.vm as any).loading).toBe(false)
        })

        it('refetches when searchCelebrities is called with new query', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([]))
            mockQuery.value = { name: 'Tom' }
            const wrapper = createWrapper()
            await flushPromises()
            expect(celebritySearching).toHaveBeenCalledWith('Tom', 1)

            mockQuery.value = { name: 'Brad' }
            await (wrapper.vm as any).searchCelebrities()
            await flushPromises()
            expect(celebritySearching).toHaveBeenCalledWith('Brad', 1)
        })
    })

    // ── Pagination ───────────────────────────────────────
    describe('pagination', () => {
        it('shows pagination when total_pages > 1', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([mockCelebrity()], 3))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.findComponent({ name: 'PaginationComponent' }).exists()).toBe(true)
        })

        it('hides pagination when total_pages is 1', async () => {
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([mockCelebrity()], 1))
            const wrapper = createWrapper()
            await flushPromises()
            expect(wrapper.findComponent({ name: 'PaginationComponent' }).exists()).toBe(false)
        })

        it('hides pagination while loading', () => {
            vi.mocked(celebritySearching).mockImplementation(() => new Promise(() => {}))
            const wrapper = createWrapper()
            expect(wrapper.findComponent({ name: 'PaginationComponent' }).exists()).toBe(false)
        })

        it('calls router.push with new page on change-page event', async () => {
            mockQuery.value = { name: 'Tom' }
            vi.mocked(celebritySearching).mockResolvedValue(mockPagination([mockCelebrity()], 3))
            const wrapper = createWrapper()
            await flushPromises()

            const pagination = wrapper.findComponent({ name: 'PaginationComponent' })
            await pagination.vm.$emit('change-page', 2)

            expect(mockPush).toHaveBeenCalledWith({
                path: '/',
                query: { name: 'Tom', page: 2 },
            })
        })
    })
})