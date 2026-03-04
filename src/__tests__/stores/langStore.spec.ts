import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLangStore } from '@/stores/langStore'

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

vi.mock('@/i18n', () => ({
    default: {
        global: {
            locale: { value: 'en' }
        }
    }
}))

describe('useLangStore', () => {

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('localStorage instanciates with the correct language', () => {
        localStorageMock.getItem.mockReturnValue('es')
        const store = useLangStore()
        expect(store.language).toBe('es')
    })

    it('initializes with "en" if localStorage is empty', () => {
        localStorageMock.getItem.mockReturnValue(null)
        const store = useLangStore()
        expect(store.language).toBe('en')
    })

    it('setLanguage changes the language', () => {
        const store = useLangStore()
        store.setLanguage('es')
        expect(store.language).toBe('es')
    })

    it('setLanguage saves to localStorage', () => {
        const store = useLangStore()
        store.setLanguage('es')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'es')
    })

    it('setLanguage updates i18n locale', async () => {
        const i18n = await import('@/i18n')
        const store = useLangStore()
        store.setLanguage('es')
        expect(i18n.default.global.locale.value).toBe('es')
    })
})