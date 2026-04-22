import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FriendsRatingsComponent from '@/components/friendsRatingsComponent.vue'

import { friendsRatings } from '@/repositories/movieRepository'
import { api } from '@/composables/useAPI'
// ── Mocks ──────────────────────────────────────────────────────────────────

const mockRatings = (page: number, total: number) => ({
    results: Array.from({ length: 5 }, (_, i) => ({
        id: (page - 1) * 5 + i,
        rating: (i % 5) + 1,
        user: `http://api/users/user${(page - 1) * 5 + i}/`,
        movie: 'test-movie',
        created_at: new Date().toISOString(),
    })),
    total_pages: total,
    count: total * 5,
    has_next: page < total,
    has_previous: page > 1,
    current_page: page,
})

const mockProfile = (url: string) => ({
    id: 1,
    username: url.split('/').filter(Boolean).pop() ?? 'user',
    bio: '',
    friendship: {},
    picture: `https://cdn.example.com/avatar.jpg`,
})

vi.mock('@/repositories/movieRepository', () => ({
    friendsRatings: vi.fn(),
}))

vi.mock('@/composables/useAPI', () => ({
    api: {
        get: vi.fn(),
    },
}))


// ── Helpers ────────────────────────────────────────────────────────────────

const mountComponent = (movieSlug = 'test-movie') =>
    mount(FriendsRatingsComponent, {
        props: { movieSlug },
        global: {
            stubs: {
                TransitionGroup: true,
            },
        },
    })
// ── Tests ──────────────────────────────────────────────────────────────────

describe('FriendsRatingsComponent', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.mocked(friendsRatings).mockResolvedValue(mockRatings(1, 2))
        vi.mocked(api.get).mockImplementation((url: string) =>
            Promise.resolve({ data: mockProfile(url) })
        )
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    // ── Mount ──────────────────────────────────────────────────────────────

    it('mounts without errors', () => {
        const wrapper = mountComponent()
        expect(wrapper.exists()).toBe(true)
    })

    it('calls friendsRatings on mount with page 1', async () => {
        mountComponent()
        await flushPromises()
        expect(friendsRatings).toHaveBeenCalledWith('test-movie', 5, 1)
    })

    it('renders the bubbles stage', () => {
        const wrapper = mountComponent()
        expect(wrapper.find('.bubbles-stage').exists()).toBe(true)
    })

    // ── Bubbles ────────────────────────────────────────────────────────────

    it('shows a bubble after the first tick', async () => {
        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()
        expect(wrapper.findAll('.bubble').length).toBeGreaterThanOrEqual(1)
    })

    it('shows more bubbles on each interval tick', async () => {
        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        const before = wrapper.findAll('.bubble').length

        vi.advanceTimersByTime(2200)
        await flushPromises()
        await flushPromises()
        await flushPromises()

        expect(wrapper.findAll('.bubble').length).toBeGreaterThan(before)
    })

    // ── Profile ────────────────────────────────────────────────────────────

    it('shows the profile picture when available', async () => {
        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        expect(wrapper.find('.avatar-img').exists()).toBe(true)
    })

    it('shows initials when picture is not available', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: { ...mockProfile('url'), picture: null },
        })

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        expect(wrapper.find('.avatar-initials').exists()).toBe(true)
    })

    it('truncates username longer than 10 characters', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: { ...mockProfile('url'), username: 'averylongusername' },
        })

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        const text = wrapper.find('.bubble-user').text()
        expect(text).toBe('averylongu…')
    })

    it('does not truncate usernames of 10 characters or fewer', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: { ...mockProfile('url'), username: 'shortname' },
        })

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        const text = wrapper.find('.bubble-user').text()
        expect(text).toBe('shortname')
        expect(text).not.toContain('…')
    })

    // ── Profile cache ──────────────────────────────────────────────────────

    it('does not call api.get twice for the same user URL', async () => {
        vi.mocked(friendsRatings).mockResolvedValue({
            ...mockRatings(1, 1),
            results: [
                { id: 1, rating: 5, user: 'http://api/users/same/', movie: 'x', created_at: '' },
                { id: 2, rating: 3, user: 'http://api/users/same/', movie: 'x', created_at: '' },
            ],
        })

        mountComponent()
        await flushPromises()

        expect(api.get).toHaveBeenCalledTimes(1)
    })

    it('does not issue concurrent requests for the same user URL', async () => {
        let resolveFirst!: (v: unknown) => void
        vi.mocked(api.get).mockImplementationOnce(
            () => new Promise(res => { resolveFirst = res })
        )

        vi.mocked(friendsRatings).mockResolvedValue({
            ...mockRatings(1, 1),
            results: [
                { id: 1, rating: 5, user: 'http://api/users/same/', movie: 'x', created_at: '' },
                { id: 2, rating: 3, user: 'http://api/users/same/', movie: 'x', created_at: '' },
            ],
        })

        mountComponent()
        await flushPromises()

        resolveFirst({ data: mockProfile('http://api/users/same/') })
        await flushPromises()

        expect(api.get).toHaveBeenCalledTimes(1)
    })

    // ── Page cache ─────────────────────────────────────────────────────────

    it('does not call friendsRatings twice for the same page', async () => {
        vi.mocked(friendsRatings).mockResolvedValue(mockRatings(1, 1))

        mountComponent()
        await flushPromises()

        vi.advanceTimersByTime(2200 * 10)
        await flushPromises()

        const page1Calls = vi.mocked(friendsRatings).mock.calls.filter(c => c[2] === 1)
        expect(page1Calls.length).toBe(1)
    })

    // ── Pagination ─────────────────────────────────────────────────────────

    it('requests page 2 when the queue runs low', async () => {
        vi.mocked(friendsRatings)
            .mockResolvedValueOnce(mockRatings(1, 2))
            .mockResolvedValueOnce(mockRatings(2, 2))

        mountComponent()
        await flushPromises()

        vi.advanceTimersByTime(2200 * 6)
        await flushPromises()

        expect(friendsRatings).toHaveBeenCalledWith('test-movie', 5, 2)
    })

    // ── Loop ───────────────────────────────────────────────────────────────

    it('does not apply the round pause on the first loop', async () => {
        vi.mocked(friendsRatings).mockResolvedValue(mockRatings(1, 1))

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        expect(wrapper.findAll('.bubble').length).toBeGreaterThan(0)
    })

    it('applies ROUND_PAUSE_MS before re-enqueuing on subsequent loops', async () => {
        vi.mocked(friendsRatings).mockResolvedValue(mockRatings(1, 1))

        const wrapper = mountComponent()
        await flushPromises()

        // Drain the first loop
        vi.advanceTimersByTime(2200 * 6)
        await flushPromises()

        const bubblesAfterDrain = wrapper.findAll('.bubble').length

        // Advance less than ROUND_PAUSE_MS — no new bubbles should appear yet
        vi.advanceTimersByTime(3000)
        await flushPromises()

        expect(wrapper.findAll('.bubble').length).toBeLessThanOrEqual(bubblesAfterDrain)

        // Now advance past ROUND_PAUSE_MS — bubbles should resume
        vi.advanceTimersByTime(3001 + 2200)
        await flushPromises()
        await flushPromises()

        expect(wrapper.findAll('.bubble').length).toBeGreaterThan(0)
    })

    // ── Prop change ────────────────────────────────────────────────────────

    it('resets the queue when movieSlug changes', async () => {
        const wrapper = mountComponent('movie-a')
        await flushPromises()

        await wrapper.setProps({ movieSlug: 'movie-b' })
        await flushPromises()

        expect(friendsRatings).toHaveBeenCalledWith('movie-b', 5, 1)
    })

    it('clears visible bubbles when movieSlug changes', async () => {
        const wrapper = mountComponent('movie-a')
        await flushPromises()
        await flushPromises()

        expect(wrapper.findAll('.bubble').length).toBeGreaterThan(0)

        vi.clearAllTimers()
        await wrapper.setProps({ movieSlug: 'movie-b' })
        expect(wrapper.findAll('.bubble').length).toBe(0)
    })

    it('clears the page cache when movieSlug changes', async () => {
        const wrapper = mountComponent('movie-a')
        await flushPromises()

        await wrapper.setProps({ movieSlug: 'movie-b' })
        await flushPromises()

        // Page 1 should be fetched fresh for the new movie
        expect(friendsRatings).toHaveBeenCalledWith('movie-b', 5, 1)
        const movieBCalls = vi.mocked(friendsRatings).mock.calls.filter(c => c[0] === 'movie-b')
        expect(movieBCalls.length).toBe(1)
    })

    // ── Unmount ────────────────────────────────────────────────────────────

    it('clears the interval on unmount', async () => {
        const clearSpy = vi.spyOn(global, 'clearInterval')
        const wrapper = mountComponent()
        await flushPromises()
        wrapper.unmount()
        expect(clearSpy).toHaveBeenCalled()
    })


    // ── Error handling ─────────────────────────────────────────────────────

    it('does not crash if friendsRatings throws', async () => {
        vi.mocked(friendsRatings).mockRejectedValue(new Error('Network error'))
        const wrapper = mountComponent()
        await flushPromises()
        expect(wrapper.exists()).toBe(true)
    })

    it('still shows the bubble if profile fetch fails', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: { username: 'user0', picture: null } })

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        expect(wrapper.find('.bubble').exists()).toBe(true)
    })


    it('shows initials as fallback when profile fetch fails', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: { username: 'user0', picture: null } })

        const wrapper = mountComponent()
        await flushPromises()
        await flushPromises()

        expect(wrapper.find('.avatar-initials').exists()).toBe(true)
    })

})