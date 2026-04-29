import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// ─── Hoisted spies ────────────────────────────────────────────────────────────

const {
    mockToastAdd,
    mockSubmitReview,
    mockValidate,
    mockResetForm,
    mockClearError,
    mockForm,
    mockFieldErrors,
    mockServerErrors,
    mockHandleApiError,
} = vi.hoisted(() => {
    const { ref } = require('vue')
    return {
        mockToastAdd: vi.fn(),
        mockSubmitReview: vi.fn(),
        mockValidate: vi.fn(() => true),
        mockResetForm: vi.fn(),
        mockClearError: vi.fn(),
        mockForm: ref({ title: '', content: '', isPositive: true }),
        mockFieldErrors: ref<Record<string, string[]>>({}),
        mockServerErrors: ref<string[]>([]),
        mockHandleApiError: vi.fn(),
    }
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/repositories/movieRepository', () => ({
    submitReview: mockSubmitReview,
}))

vi.mock('primevue', () => ({
    useToast: () => ({ add: mockToastAdd }),
    Dialog: defineComponent({
        props: ['visible'],
        template: '<div><slot /><slot name="footer" /></div>'
    }),
    Skeleton: defineComponent({ template: '<div></div>' })
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (k: string) => k }),
}))

vi.mock('@/composables/useReviewForm', () => ({
    useReviewForm: () => ({
        form: mockForm,
        fieldErrors: mockFieldErrors,
        serverErrors: mockServerErrors,
        clearError: mockClearError,
        resetForm: mockResetForm,
        validate: mockValidate,
    }),
}))

vi.mock('@/utils/handleApiError', () => ({
    handleApiError: mockHandleApiError,
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import AddReviewDialog from '@/components/addReviewDialog.vue'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mountComponent = (propsOverrides = {}) =>
    mount(AddReviewDialog, {
        props: { visible: true, movieSlug: 'interstellar', ...propsOverrides },
        global: {
            stubs: { teleport: true }
        },
    })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AddReviewDialog', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        mockForm.value = { title: '', content: '', isPositive: true }
        mockFieldErrors.value = {}
        mockServerErrors.value = []
        mockValidate.mockReturnValue(true)
        mockSubmitReview.mockResolvedValue(undefined)
    })

    describe('open behavior', () => {
        it('calls resetForm when visible changes from false to true', async () => {
            const wrapper = mountComponent({ visible: false })
            await wrapper.setProps({ visible: true })
            expect(mockResetForm).toHaveBeenCalled()
        })
    })

    describe('submit — success', () => {
        it('calls submitReview and handles success flow', async () => {
            const wrapper = mountComponent()

            await wrapper.find('.btn-save').trigger('click')
            await flushPromises()

            expect(mockSubmitReview).toHaveBeenCalledWith('interstellar', mockForm.value)
            expect(wrapper.emitted('reload')).toBeTruthy()
            expect(wrapper.emitted('update:visible')).toContainEqual([false])
            expect(mockToastAdd).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success', detail: 'review.submitted' })
            )
        })
    })

    describe('submit — failure', () => {
        it('handles validation and API errors', async () => {
            mockValidate.mockReturnValue(false)
            const wrapper = mountComponent()

            await wrapper.find('.btn-save').trigger('click')
            expect(mockSubmitReview).not.toHaveBeenCalled()

            mockValidate.mockReturnValue(true)
            mockSubmitReview.mockRejectedValue(new Error('fail'))
            await wrapper.find('.btn-save').trigger('click')
            await flushPromises()

            expect(mockHandleApiError).toHaveBeenCalled()
        })
    })

    describe('interactions', () => {
        it('emits update:visible false when cancel is clicked', async () => {
            const wrapper = mountComponent()
            await wrapper.find('.btn-cancel').trigger('click')
            expect(wrapper.emitted('update:visible')).toContainEqual([false])
        })

        it('clears errors on input', async () => {
            const wrapper = mountComponent()
            const input = wrapper.find('#review-title')
            await input.setValue('Nuevo título')
            expect(mockClearError).toHaveBeenCalledWith('title')
        })
    })
})