import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CelebrityCardComponent from '@/components/celebrityCardComponent.vue'
import type { Person } from '@/types'

// Mock goToPerson
vi.mock('@/utils/goTo', () => ({
    goToPerson: vi.fn(),
}))

import { goToPerson } from '@/utils/goTo'

const mockCelebrity: Person = {
    id: 1,
    slug: 'john-doe',
    name: 'John Doe',
    image: 'https://example.com/john.jpg',
    gender: '2',
    birthday: '1980-01-15',
    deathday: null,
    biography: 'A great actor.',
}

const deadCelebrity: Person = {
    ...mockCelebrity,
    id: 2,
    slug: 'jane-doe',
    name: 'Jane Doe',
    gender: '1',
    deathday: '2020-05-10',
}

const mountComponent = (celebrity: Person) =>
    mount(CelebrityCardComponent, {
        props: { celebrity },
        global: {
            stubs: {
                Teleport: true,
            },
        },
    })

describe('CelebrityCardComponent', () => {

    describe('rendering', () => {
        it('renders the celebrity image', () => {
            const wrapper = mountComponent(mockCelebrity)
            const img = wrapper.find('img')
            expect(img.exists()).toBe(true)
            expect(img.attributes('src')).toBe(mockCelebrity.image)
            expect(img.attributes('alt')).toBe(mockCelebrity.name)
        })

        it('shows skeleton before image loads', () => {
            const wrapper = mountComponent(mockCelebrity)
            expect(wrapper.find('.cover-skeleton').exists() ||
                wrapper.findComponent({ name: 'Skeleton' }).exists()
            ).toBe(true)
            expect(wrapper.find('.name').exists()).toBe(false)
        })

        it('shows content after image loads', async () => {
            const wrapper = mountComponent(mockCelebrity)
            await wrapper.find('img').trigger('load')
            expect(wrapper.find('.name').text()).toBe(mockCelebrity.name)
        })

        it('shows birthday after image loads', async () => {
            const wrapper = mountComponent(mockCelebrity)
            await wrapper.find('img').trigger('load')
            expect(wrapper.find('.birthday').text()).toContain(mockCelebrity.birthday)
        })

        it('does not show birthday if not provided', async () => {
            const wrapper = mountComponent({ ...mockCelebrity, birthday: null })
            await wrapper.find('img').trigger('load')
            expect(wrapper.find('.birthday').exists()).toBe(false)
        })
    })

    describe('gender badge', () => {
        it('shows mars icon for gender 2 (male)', async () => {
            const wrapper = mountComponent({ ...mockCelebrity, gender: '2' })
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.gender-badge')
            expect(badge.exists()).toBe(true)
            expect(badge.find('i').classes()).toContain('pi-mars')
            expect(badge.attributes('style')).toContain('var(--primary)')
        })

        it('shows venus icon for gender 1 (female)', async () => {
            const wrapper = mountComponent({ ...mockCelebrity, gender: '1' })
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.gender-badge')
            expect(badge.find('i').classes()).toContain('pi-venus')
            expect(badge.attributes('style')).toContain('var(--accent)')
        })

        it('shows minus icon for gender 0 (unknown)', async () => {
            const wrapper = mountComponent({ ...mockCelebrity, gender: '0' })
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.gender-badge')
            expect(badge.find('i').classes()).toContain('pi-minus')
            expect(badge.attributes('style')).toContain('var(--secondary)')
        })

        it('falls back to unknown gender for unrecognized value', async () => {
            const wrapper = mountComponent({ ...mockCelebrity, gender: '99' })
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.gender-badge')
            expect(badge.find('i').classes()).toContain('pi-minus')
        })
    })

    describe('death badge', () => {
        it('does not show death badge when celebrity is alive', async () => {
            const wrapper = mountComponent(mockCelebrity)
            await wrapper.find('img').trigger('load')
            expect(wrapper.find('.death-badge').exists()).toBe(false)
        })

        it('shows death badge when celebrity has deathday', async () => {
            const wrapper = mountComponent(deadCelebrity)
            await wrapper.find('img').trigger('load')
            expect(wrapper.find('.death-badge').exists()).toBe(true)
        })

        it('shows tooltip on mouseenter over death badge', async () => {
            const wrapper = mountComponent(deadCelebrity)
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.death-badge')
            await badge.trigger('mouseenter')
            // tooltipVisible should be true — check via teleport stub or vm
            expect((wrapper.vm as any).tooltipVisible).toBe(true)
        })

        it('hides tooltip on mouseleave from death badge', async () => {
            const wrapper = mountComponent(deadCelebrity)
            await wrapper.find('img').trigger('load')
            const badge = wrapper.find('.death-badge')
            await badge.trigger('mouseenter')
            await badge.trigger('mouseleave')
            expect((wrapper.vm as any).tooltipVisible).toBe(false)
        })

        it('does not navigate when clicking death badge', async () => {
            const wrapper = mountComponent(deadCelebrity)
            await wrapper.find('img').trigger('load')
            await wrapper.find('.death-badge').trigger('click')
            expect(goToPerson).not.toHaveBeenCalled()
        })
    })

    describe('navigation', () => {
        it('calls goToPerson with slug on card click', async () => {
            const wrapper = mountComponent(mockCelebrity)
            await wrapper.find('.celeb-card').trigger('click')
            expect(goToPerson).toHaveBeenCalledWith(mockCelebrity.slug)
        })
    })

    describe('tooltip positioning', () => {
        it('sets tooltip coordinates on mouseenter', async () => {
            const wrapper = mountComponent(deadCelebrity)
            await wrapper.find('img').trigger('load')

            const badge = wrapper.find('.death-badge')

            // Mock getBoundingClientRect
            badge.element.getBoundingClientRect = vi.fn(() => ({
                left: 100,
                right: 122,
                top: 50,
                bottom: 72,
                width: 22,
                height: 22,
                x: 100,
                y: 50,
                toJSON: vi.fn(),
            }))

            await badge.trigger('mouseenter')

            expect((wrapper.vm as any).tooltipX).toBe(111) // 100 + 22/2
            expect((wrapper.vm as any).tooltipY).toBe(78)  // 72 + 6
        })
    })
})