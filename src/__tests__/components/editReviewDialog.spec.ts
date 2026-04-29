import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// ─── Hoisted spies ────────────────────────────────────────────────────────────

const {
    mockToastAdd,
    mockGetReview,
    mockUpdateReview,
    mockValidate,
    mockClearError,
    mockForm,
    mockFieldErrors,
    mockServerErrors,
    mockHandleApiError,
} = vi.hoisted(() => {
    const { ref } = require('vue')
    return {
        mockToastAdd: vi.fn(),
        mockGetReview: vi.fn(),
        mockUpdateReview: vi.fn(),
        mockValidate: vi.fn(() => true),
        mockClearError: vi.fn(),
        mockForm: ref({ title: '', content: '', isPositive: true }),
        mockFieldErrors: ref<Record<string, string[]>>({}),
        mockServerErrors: ref<string[]>([]),
        mockHandleApiError: vi.fn(),
    }
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/repositories/movieRepository', () => ({
    getReview: mockGetReview,
    updateReview: mockUpdateReview,
}))

vi.mock('primevue', () => ({
    useToast: () => ({ add: mockToastAdd }),
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
        validate: mockValidate,
    }),
}))

vi.mock('@/utils/handleApiError', () => ({
    handleApiError: mockHandleApiError,
}))

vi.mock('@/components/reviewFormDialog.vue', () => ({
    default: defineComponent({
        props: [
            'form', 'visible', 'header', 'loading', 'loadingFetch',
            'fieldErrors', 'serverErrors', 'saveLabel', 'reset',
        ],
        emits: ['update:form', 'update:visible', 'submit', 'clearError', 'reset'],
        template: `
      <div class="review-form-dialog"
        :data-visible="visible"
        :data-header="header"
        :data-loading="loading"
        :data-loading-fetch="loadingFetch"
        :data-save-label="saveLabel"
        :data-reset="reset"
      >
        <button class="trigger-submit" @click="$emit('submit')" />
        <button class="trigger-clear-error" @click="$emit('clearError', 'title')" />
        <button class="trigger-reset" @click="$emit('reset')" />
        <button class="trigger-close" @click="$emit('update:visible', false)" />
      </div>
    `,
    }),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import EditReviewDialog from '@/components/editReviewDialog.vue'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockReview = {
    id: 7,
    title: 'Masterpiece',
    content: 'An incredible film.',
    is_positive: true,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mountComponent = (propsOverrides = {}) =>
    mount(EditReviewDialog, {
        props: { visible: true, reviewId: 7, ...propsOverrides },
        global: { stubs: { teleport: true } },
    })

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EditReviewDialog', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        mockForm.value = { title: '', content: '', isPositive: true }
        mockFieldErrors.value = {}
        mockServerErrors.value = []
        mockValidate.mockReturnValue(true)
        mockGetReview.mockResolvedValue(mockReview)
        mockUpdateReview.mockResolvedValue(undefined)
    })

    // ── Fetch on open ─────────────────────────────────────────────────────────────

    describe('fetch on open', () => {
        it('calls getReview with the correct reviewId when visible', async () => {
            const wrapper = mount(EditReviewDialog, {
                props: { visible: false, reviewId: 7 },
                global: { stubs: { teleport: true } },
            })

            await wrapper.setProps({ visible: true })

            await flushPromises()

            expect(mockGetReview).toHaveBeenCalledWith(7)
        })

        it('populates the form with the fetched review data', async () => {
            const wrapper = mountComponent({ visible: false })
            await wrapper.setProps({ visible: true })
            await flushPromises()

            expect(mockForm.value).toEqual({
                title: 'Masterpiece',
                content: 'An incredible film.',
                isPositive: true,
            })
        })

        it('sets loadingFetch to false after a successful fetch', async () => {
            mountComponent()
            await flushPromises()
            const dialog = mountComponent().find('.review-form-dialog')
            expect(dialog.attributes('data-loading-fetch')).toBe('false')
        })

        it('calls getReview again when visible changes from false to true', async () => {
            const wrapper = mountComponent({ visible: false })
            await flushPromises()
            expect(mockGetReview).not.toHaveBeenCalled()
            await wrapper.setProps({ visible: true })
            await flushPromises()
            expect(mockGetReview).toHaveBeenCalledWith(7)
        })

        it('does not call getReview when visible is false', async () => {
            mountComponent({ visible: false })
            await flushPromises()
            expect(mockGetReview).not.toHaveBeenCalled()
        })
    })

    // ── Fetch error ───────────────────────────────────────────────────────────────

    describe('fetch error handling', () => {
        it('shows an error toast when getReview throws', async () => {
            mockGetReview.mockRejectedValue(new Error('Network error'))
            const wrapper = mountComponent({ visible: false })
            await wrapper.setProps({ visible: true })
            await flushPromises()
            expect(mockToastAdd).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'error', detail: 'review.error.fetching' })
            )
        })

        it('closes the dialog when getReview throws', async () => {
            mockGetReview.mockRejectedValue(new Error('Network error'))
            const wrapper = mountComponent({ visible: false })
            await wrapper.setProps({ visible: true })
            await flushPromises()
            expect(wrapper.emitted('update:visible')).toEqual([[false]])
        })

        it('clears field and server errors before fetching', async () => {
            mockFieldErrors.value = { title: ['Required'] }
            mockServerErrors.value = ['Something went wrong']
            const wrapper = mountComponent({ visible: false })
            await wrapper.setProps({ visible: true })
            await flushPromises()
            expect(mockFieldErrors.value).toEqual({})
            expect(mockServerErrors.value).toEqual([])
        })
    })

    // ── Props forwarded to ReviewFormDialog ───────────────────────────────────────

    describe('props forwarded to ReviewFormDialog', () => {
        it('passes the correct header', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            expect(wrapper.find('.review-form-dialog').attributes('data-header')).toBe('review.editReview')
        })

        it('passes the correct saveLabel', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            expect(wrapper.find('.review-form-dialog').attributes('data-save-label')).toBe('common.edit')
        })

        it('passes reset as true', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            expect(wrapper.find('.review-form-dialog').attributes('data-reset')).toBe('true')
        })

        it('passes visible prop through', async () => {
            const wrapper = mountComponent({ visible: true })
            await flushPromises()
            expect(wrapper.find('.review-form-dialog').attributes('data-visible')).toBe('true')
        })
    })

    // ── Submit — success ──────────────────────────────────────────────────────────

    describe('submit — success', () => {
        it('calls updateReview with the reviewId and current form values', async () => {
            mockForm.value = { title: 'Updated', content: 'New content.', isPositive: false }
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(mockUpdateReview).toHaveBeenCalledWith(7, mockForm.value)
        })

        it('emits reload after a successful update', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(wrapper.emitted('reload')).toHaveLength(1)
        })

        it('closes the dialog after a successful update', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(wrapper.emitted('update:visible')).toContainEqual([false])
        })

        it('shows a success toast after a successful update', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(mockToastAdd).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success', detail: 'review.updated' })
            )
        })
    })

    // ── Submit — validation failure ───────────────────────────────────────────────

    describe('submit — validation failure', () => {
        it('does not call updateReview when validation fails', async () => {
            mockValidate.mockReturnValue(false)
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(mockUpdateReview).not.toHaveBeenCalled()
        })

        it('does not emit reload when validation fails', async () => {
            mockValidate.mockReturnValue(false)
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(wrapper.emitted('reload')).toBeUndefined()
        })
    })

    // ── Submit — API error ────────────────────────────────────────────────────────

    describe('submit — API error', () => {
        it('calls handleApiError when updateReview throws', async () => {
            const error = new Error('Server error')
            mockUpdateReview.mockRejectedValue(error)
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(mockHandleApiError).toHaveBeenCalledWith(
                error, mockFieldErrors, mockServerErrors, expect.anything(), expect.any(Function)
            )
        })

        it('resets field and server errors before delegating to handleApiError', async () => {
            mockFieldErrors.value = { title: ['Old error'] }
            mockServerErrors.value = ['Old server error']
            mockUpdateReview.mockRejectedValue(new Error('fail'))
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(mockFieldErrors.value).toEqual({})
            expect(mockServerErrors.value).toEqual([])
        })

        it('does not emit reload when updateReview throws', async () => {
            mockUpdateReview.mockRejectedValue(new Error('fail'))
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-submit').trigger('click')
            await flushPromises()
            expect(wrapper.emitted('reload')).toBeUndefined()
        })
    })

    // ── Reset ─────────────────────────────────────────────────────────────────────

    describe('reset', () => {
        it('refetches the review when reset is triggered', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            mockGetReview.mockClear()
            await wrapper.find('.trigger-reset').trigger('click')
            await flushPromises()
            expect(mockGetReview).toHaveBeenCalledWith(7)
        })

        it('clears errors when reset is triggered', async () => {
            mockFieldErrors.value = { title: ['Required'] }
            mockServerErrors.value = ['Error']
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-reset').trigger('click')
            await flushPromises()
            expect(mockFieldErrors.value).toEqual({})
            expect(mockServerErrors.value).toEqual([])
        })
    })

    // ── Clear error ───────────────────────────────────────────────────────────────

    describe('clearError', () => {
        it('calls clearError with the field name when triggered', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-clear-error').trigger('click')
            expect(mockClearError).toHaveBeenCalledWith('title')
        })
    })

    // ── Close ─────────────────────────────────────────────────────────────────────

    describe('close', () => {
        it('emits update:visible with false when the dialog requests close', async () => {
            const wrapper = mountComponent()
            await flushPromises()
            await wrapper.find('.trigger-close').trigger('click')
            expect(wrapper.emitted('update:visible')).toContainEqual([false])
        })
    })
})