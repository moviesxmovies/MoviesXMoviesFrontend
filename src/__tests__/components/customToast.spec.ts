import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CustomToast from '@/components/customToast.vue'

const { mockToastService } = vi.hoisted(() => ({
    mockToastService: { add: vi.fn() },
}))

vi.mock('primevue/usetoast', () => ({
    useToast: () => mockToastService,
}))

function mountToast() {
    return mount(CustomToast, {
        attachTo: document.body,
        global: {
            stubs: {
                Teleport: {
                    template: '<div><slot /></div>',
                },
                TransitionGroup: true,
            },
        },
    })
}

describe('CustomToast', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mockToastService.add = vi.fn()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    // ── Mount ──
    it('mounts without errors', () => {
        const wrapper = mountToast()
        expect(wrapper.exists()).toBe(true)
    })

    it('renders no toasts initially', () => {
        const wrapper = mountToast()
        expect(wrapper.findAll('.toast-card')).toHaveLength(0)
    })

    // ── addToast ──
    it('shows a toast when addToast is called', async () => {
        const wrapper = mountToast()

        wrapper.vm.addToast({ severity: 'success', summary: 'Done', detail: 'It worked!' })
        await nextTick()

        const cards = wrapper.findAll('.toast-card')
        expect(cards).toHaveLength(1)
        expect(cards[0].find('.toast-summary').text()).toBe('Done')
        expect(cards[0].find('.toast-detail').text()).toBe('It worked!')
    })

    it('shows multiple toasts stacked', async () => {
        const wrapper = mountToast()

        wrapper.vm.addToast({ severity: 'success', summary: 'First' })
        wrapper.vm.addToast({ severity: 'error', summary: 'Second' })
        wrapper.vm.addToast({ severity: 'warn', summary: 'Third' })
        await nextTick()

        expect(wrapper.findAll('.toast-card')).toHaveLength(3)
    })

    it('renders correct icon and accent per severity', async () => {
        const wrapper = mountToast()
        const severities = ['success', 'error', 'warn', 'info'] as const

        for (const severity of severities) {
            wrapper.vm.addToast({ severity, summary: severity })
        }
        await nextTick()

        const cards = wrapper.findAll('.toast-card')
        expect(cards).toHaveLength(4)
        cards.forEach((card) => {
            expect(card.find('.toast-icon').exists()).toBe(true)
            expect(card.find('.toast-stripe').exists()).toBe(true)
        })
    })

    it('does not render detail span if detail is omitted', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'info', summary: 'No detail' })
        await nextTick()

        expect(wrapper.find('.toast-detail').exists()).toBe(false)
    })

    // ── Auto-dismiss ──
    it('auto-dismisses after the default life (3500ms)', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'success', summary: 'Gone soon' })
        await nextTick()

        expect(wrapper.findAll('.toast-card')).toHaveLength(1)

        vi.advanceTimersByTime(3500)
        await nextTick()
        await nextTick() // ← segundo tick para TransitionGroup

        expect(wrapper.findAll('.toast-card')).toHaveLength(0)
    })

    it('auto-dismisses after a custom life value', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'warn', summary: 'Custom life', life: 1000 })
        await nextTick()

        vi.advanceTimersByTime(999)
        await nextTick()
        expect(wrapper.findAll('.toast-card')).toHaveLength(1)

        vi.advanceTimersByTime(1)
        await nextTick()
        expect(wrapper.findAll('.toast-card')).toHaveLength(0)
    })

    it('dismisses toasts independently with different life values', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'success', summary: 'Short', life: 1000 })
        wrapper.vm.addToast({ severity: 'info', summary: 'Long', life: 5000 })
        await nextTick()

        expect(wrapper.findAll('.toast-card')).toHaveLength(2)

        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(wrapper.findAll('.toast-card')).toHaveLength(1)
        expect(wrapper.find('.toast-summary').text()).toBe('Long')
    })

    // ── Manual close ──
    it('removes toast when close button is clicked', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'error', summary: 'Close me' })
        await nextTick()

        await wrapper.find('.toast-close').trigger('click')
        await nextTick()

        expect(wrapper.findAll('.toast-card')).toHaveLength(0)
    })

    it('only removes the clicked toast when multiple exist', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'success', summary: 'Keep me' })
        wrapper.vm.addToast({ severity: 'error', summary: 'Remove me' })
        await nextTick()

        const closeButtons = wrapper.findAll('.toast-close')
        await closeButtons[1].trigger('click')
        await nextTick()

        expect(wrapper.findAll('.toast-card')).toHaveLength(1)
        expect(wrapper.find('.toast-summary').text()).toBe('Keep me')
    })

    // ── PrimeVue interop ──
    it('patches toastService.add on mount to route through addToast', async () => {
        const wrapper = mountToast()
        await nextTick()

        // After mount the service.add should be our custom function
        mockToastService.add({ severity: 'success', summary: 'Via service', detail: 'Patched', life: 3000 })
        await nextTick()

        expect(wrapper.find('.toast-summary').text()).toBe('Via service')
        expect(wrapper.find('.toast-detail').text()).toBe('Patched')
    })

    it('defaults severity to info when not provided via service', async () => {
        const wrapper = mountToast()
        await nextTick()

        mockToastService.add({ summary: 'No severity' })
        await nextTick()

        expect(wrapper.find('.toast-card').exists()).toBe(true)
        expect(wrapper.find('.toast-summary').text()).toBe('No severity')
    })

    // ── Progress bar ──
    it('renders a progress bar for each toast', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'success', summary: 'Progress', life: 2000 })
        await nextTick()

        expect(wrapper.find('.toast-progress').exists()).toBe(true)
        expect(wrapper.find('.toast-progress-bar').exists()).toBe(true)
    })

    it('sets correct animationDuration on progress bar', async () => {
        const wrapper = mountToast()
        wrapper.vm.addToast({ severity: 'info', summary: 'Timed', life: 4200 })
        await nextTick()

        const bar = wrapper.find('.toast-progress-bar')
        expect(bar.attributes('style')).toContain('4200ms')
    })

    // ── defineExpose ──
    it('exposes addToast method', () => {
        const wrapper = mountToast()
        expect(typeof wrapper.vm.addToast).toBe('function')
    })
})